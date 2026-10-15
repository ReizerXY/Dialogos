<?php
// app/Http/Controllers/Panel/EstudianteController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use App\Exports\EstudiantesExport;
use App\Imports\EstudiantesCsvImport;
use App\Imports\EstudiantesExcelImport;
use App\Services\CacheInvalidator;
use App\Services\SnapshotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Maatwebsite\Excel\Facades\Excel;

class EstudianteController extends Controller
{
    private const GRADOS_VALIDOS     = ['1ro', '2do', '3ro', '4to', '5to', '6to'];
    private const DIAS_VENTANA_CICLO = 7;
    private const MAX_ARCHIVO_KB     = 20480;

    // ============================================================
    // Estado publico de la importacion
    // ============================================================

    public static function estadoImportacion(): array
    {
        $inicioCiclo = null;
        $importacionManual = '0';
        $importacionCompletada = '0';

        try {
            $inicioCiclo = DB::table('configuracion')->where('clave', 'inicio_ciclo_escolar')->value('valor');
            $importacionManual = DB::table('configuracion')->where('clave', 'importacion_activa_manual')->value('valor') ?? '0';
            $importacionCompletada = DB::table('configuracion')->where('clave', 'importacion_completada')->value('valor') ?? '0';
        } catch (\Exception $e) {
            // Tabla no existe aun
        }

        $manualBool       = $importacionManual === '1';
        $completadaBool   = $importacionCompletada === '1';
        $enVentanaNatural = self::estaEnVentanaCiclo($inicioCiclo);

        $mostrarBloque = $manualBool || (!$completadaBool && $enVentanaNatural);
        $mostrarAlertaSidebar = !$completadaBool && !$manualBool && $enVentanaNatural;

        return [
            'inicio_ciclo_escolar'      => $inicioCiclo,
            'importacion_activa_manual' => $manualBool,
            'importacion_completada'    => $completadaBool,
            'mostrar_importacion'       => $mostrarBloque,
            'mostrar_alerta_sidebar'    => $mostrarAlertaSidebar,
            'dias_ventana_ciclo'        => self::DIAS_VENTANA_CICLO,
        ];
    }

    private static function estaEnVentanaCiclo($inicioCiclo): bool
    {
        if (!$inicioCiclo) return false;

        try {
            $inicio = new \DateTime($inicioCiclo);
            $inicio->setTime(0, 0, 0);
            $hoy = new \DateTime();
            $hoy->setTime(0, 0, 0);

            $diff = $inicio->diff($hoy);
            $dias = (int) $diff->format('%r%a');

            return $dias >= 0 && $dias <= self::DIAS_VENTANA_CICLO;
        } catch (\Exception $e) {
            return false;
        }
    }

    // ============================================================
    // Vistas y acciones
    // ============================================================

    public function index()
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        $estudiantes = DB::table('estudiantes')
            ->orderBy('grado')
            ->orderBy('grupo')
            ->orderBy('apellido_paterno')
            ->orderBy('apellido_materno')
            ->orderBy('nombre')
            ->get();

        return inertia('Panel/Estudiantes', [
            'estudiantes' => $estudiantes,
            'user'        => $user,
            'config'      => self::estadoImportacion(),
            'snapshots'   => SnapshotService::estado(),
        ]);
    }

    // Exporta la lista completa de estudiantes a Excel
    public function exportarExcel(Request $request)
    {
        $user = Session::get('user');
        if (!$user || $user['rol'] !== 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        $estudiantes = DB::table('estudiantes')
            ->orderBy('grado')
            ->orderBy('grupo')
            ->orderBy('apellido_paterno')
            ->orderBy('apellido_materno')
            ->orderBy('nombre')
            ->get();

        if ($estudiantes->isEmpty()) {
            return redirect()->route('estudiantes.index')
                ->with('error', 'No hay estudiantes para exportar.');
        }

        Log::info('Exportacion de estudiantes descargada', [
            'total'       => $estudiantes->count(),
            'por_usuario' => $user['usuario'] ?? null,
            'ip'          => $request->ip(),
        ]);

        $nombreArchivo = 'Estudiantes_Anahuac_' . now()->format('Y-m-d_H-i') . '.xlsx';

        return Excel::download(new EstudiantesExport($estudiantes), $nombreArchivo);
    }

    public function updateConfiguracion(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'inicio_ciclo_escolar'      => 'nullable|date',
            'importacion_activa_manual' => 'required|boolean',
        ]);

        try {
            $fechaAnterior = DB::table('configuracion')
                ->where('clave', 'inicio_ciclo_escolar')
                ->value('valor');

            $fechaNueva = $request->inicio_ciclo_escolar ?: null;

            DB::table('configuracion')->updateOrInsert(
                ['clave' => 'inicio_ciclo_escolar'],
                ['valor' => $fechaNueva]
            );

            DB::table('configuracion')->updateOrInsert(
                ['clave' => 'importacion_activa_manual'],
                ['valor' => $request->importacion_activa_manual ? '1' : '0']
            );

            if ($fechaAnterior !== $fechaNueva) {
                DB::table('configuracion')->updateOrInsert(
                    ['clave' => 'importacion_completada'],
                    ['valor' => '0']
                );
            }

            Log::info('Configuracion de ciclo escolar actualizada', [
                'inicio_ciclo' => $fechaNueva,
                'modo_manual'  => $request->importacion_activa_manual,
                'por_usuario'  => $user['usuario'] ?? null,
                'ip'           => $request->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Configuracion del ciclo escolar guardada correctamente.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error al guardar configuracion:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar la configuracion.',
            ], 500);
        }
    }

    // Importa estudiantes desde archivo .xlsx o .csv
    public function import(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'archivo' => 'required|file|max:' . self::MAX_ARCHIVO_KB,
        ]);

        $file = $request->file('archivo');

        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['xlsx', 'csv'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo de archivo no permitido. Usa XLSX o CSV.',
            ], 422);
        }

        try {
            // Snapshot antes de importar (por si el archivo corrompe algo)
            SnapshotService::crear('importar', [
                'archivo' => $file->getClientOriginalName(),
                'ext'     => $ext,
            ]);

            $cacheDir = storage_path('framework/cache/laravel-excel');
            if (is_dir($cacheDir)) {
                foreach (glob($cacheDir . '/*') as $cached) {
                    @unlink($cached);
                }
            }

            $path = $file->getRealPath();
            $handle = fopen($path, 'rb');
            $magicBytes = fread($handle, 8);
            fclose($handle);

            $tipo = $this->detectarTipo($magicBytes);

            if ($ext === 'xlsx' && $tipo !== 'xlsx') {
                return response()->json([
                    'success' => false,
                    'message' => 'El archivo tiene extension .xlsx pero no es un Excel valido.',
                ], 422);
            }

            Log::info('Importacion iniciada', [
                'archivo'      => $file->getClientOriginalName(),
                'extension'    => $ext,
                'tipo_magic'   => $tipo,
                'tamano_bytes' => $file->getSize(),
                'por_usuario'  => $user['usuario'] ?? null,
                'ip'           => $request->ip(),
            ]);

            if ($ext === 'xlsx') {
                return $this->importarExcel($path, $user, $request);
            }

            return $this->importarCsv($path, $user, $request);

        } catch (\Exception $e) {
            Log::error('Importacion: error general', [
                'error' => $e->getMessage(),
                'clase' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al importar. Revisa los logs del servidor.',
            ], 500);
        }
    }

    private function importarExcel(string $path, array $user, Request $request)
    {
        try {
            $import = new EstudiantesExcelImport();
            Excel::import($import, $path);

            CacheInvalidator::indicadores();
            $this->marcarImportacionCompletada();

            Log::info('Importacion Excel completada', [
                'formato'     => 'XLSX',
                'resultado'   => $import->getMensaje(),
                'por_usuario' => $user['usuario'] ?? null,
                'ip'          => $request->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => $import->getMensaje(),
                'formato' => 'XLSX',
            ]);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $errores = [];
            foreach ($e->failures() as $failure) {
                $errores[] = "Fila {$failure->row()}: " . implode(', ', $failure->errors());
            }
            Log::warning('Importacion Excel: errores de validacion', ['errores' => $errores]);
            return response()->json([
                'success' => false,
                'message' => 'Errores de validacion: ' . implode(' | ', array_slice($errores, 0, 5)),
            ], 422);
        } catch (\PhpOffice\PhpSpreadsheet\Reader\Exception $e) {
            Log::warning('Importacion Excel: archivo corrupto', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'El archivo de Excel esta danado o corrupto. Abrelo en Excel y guardalo de nuevo.',
            ], 422);
        } catch (\Exception $e) {
            Log::error('Importacion Excel: excepcion inesperada', [
                'error'   => $e->getMessage(),
                'clase'   => get_class($e),
                'trace'   => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Error al procesar el Excel. Revisa los logs del servidor.',
            ], 500);
        }
    }

    private function importarCsv(string $path, array $user, Request $request)
    {
        try {
            $import = new EstudiantesCsvImport();
            $import->import($path);

            CacheInvalidator::indicadores();
            $this->marcarImportacionCompletada();

            Log::info('Importacion CSV completada', [
                'resultado'   => $import->getMensaje(),
                'por_usuario' => $user['usuario'] ?? null,
                'ip'          => $request->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => $import->getMensaje(),
                'formato' => 'CSV',
            ]);
        } catch (\Exception $e) {
            Log::error('Importacion CSV: excepcion', [
                'error' => $e->getMessage(),
                'clase' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Error al procesar el CSV. Revisa los logs del servidor.',
            ], 500);
        }
    }

    private function marcarImportacionCompletada()
    {
        try {
            DB::table('configuracion')->updateOrInsert(
                ['clave' => 'importacion_completada'],
                ['valor' => '1']
            );

            DB::table('configuracion')->updateOrInsert(
                ['clave' => 'importacion_activa_manual'],
                ['valor' => '0']
            );
        } catch (\Exception $e) {
            Log::warning('No se pudo marcar la importacion como completada: ' . $e->getMessage());
        }
    }

    private function detectarTipo($magicBytes)
    {
        $hex = bin2hex(substr($magicBytes, 0, 4));
        if (substr($hex, 0, 4) === '504b') return 'xlsx';
        return 'texto';
    }

    // ============================================================
    // CRUD de estudiantes
    // ============================================================

    public function store(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'id_estudiante'       => 'required|string|max:10|unique:estudiantes,id_estudiante',
            'nombre'              => 'required|string|max:100',
            'apellido_paterno'    => 'required|string|max:100',
            'apellido_materno'    => 'required|string|max:100',
            'grado'               => 'required|in:' . implode(',', self::GRADOS_VALIDOS),
            'grupo'               => 'required|string|max:5',
            'contacto'            => 'nullable|string|max:15',
            'contacto_emergencia' => 'nullable|string|max:15',
        ]);

        DB::table('estudiantes')->insert([
            'id_estudiante'       => $request->id_estudiante,
            'nombre'              => $request->nombre,
            'apellido_paterno'    => $request->apellido_paterno,
            'apellido_materno'    => $request->apellido_materno,
            'grado'               => $request->grado,
            'grupo'               => strtoupper(trim($request->grupo)),
            'contacto'            => $request->contacto,
            'contacto_emergencia' => $request->contacto_emergencia,
        ]);

        Log::info('Estudiante creado', [
            'id_estudiante' => $request->id_estudiante,
            'por_usuario'   => $user['usuario'] ?? null,
            'ip'            => $request->ip(),
        ]);

        CacheInvalidator::indicadores();

        return response()->json([
            'success'    => true,
            'message'    => 'Estudiante agregado correctamente.',
            'estudiante' => DB::table('estudiantes')->where('id_estudiante', $request->id_estudiante)->first()
        ]);
    }

    public function update(Request $request, $id_estudiante)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'nombre'              => 'required|string|max:100',
            'apellido_paterno'    => 'required|string|max:100',
            'apellido_materno'    => 'required|string|max:100',
            'grado'               => 'required|in:' . implode(',', self::GRADOS_VALIDOS),
            'grupo'               => 'required|string|max:5',
            'contacto'            => 'nullable|string|max:15',
            'contacto_emergencia' => 'nullable|string|max:15',
        ]);

        $existe = DB::table('estudiantes')->where('id_estudiante', $id_estudiante)->exists();
        if (!$existe) {
            return response()->json(['error' => 'El estudiante no existe.'], 404);
        }

        DB::table('estudiantes')
            ->where('id_estudiante', $id_estudiante)
            ->update([
                'nombre'              => $request->nombre,
                'apellido_paterno'    => $request->apellido_paterno,
                'apellido_materno'    => $request->apellido_materno,
                'grado'               => $request->grado,
                'grupo'               => strtoupper(trim($request->grupo)),
                'contacto'            => $request->contacto,
                'contacto_emergencia' => $request->contacto_emergencia,
            ]);

        CacheInvalidator::indicadores();

        return response()->json([
            'success'    => true,
            'message'    => 'Estudiante actualizado correctamente.',
            'estudiante' => DB::table('estudiantes')->where('id_estudiante', $id_estudiante)->first()
        ]);
    }

    // Elimina un estudiante (con snapshot previo)
    public function destroy($id_estudiante)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $estudiante = DB::table('estudiantes')->where('id_estudiante', $id_estudiante)->first();
        if (!$estudiante) {
            return response()->json(['error' => 'El estudiante no existe.'], 404);
        }

        // Snapshot antes de eliminar
        SnapshotService::crear('eliminar_estudiante', [
            'id_estudiante' => $id_estudiante,
            'nombre'        => trim($estudiante->nombre . ' ' . $estudiante->apellido_paterno . ' ' . $estudiante->apellido_materno),
        ]);

        DB::table('estudiantes')->where('id_estudiante', $id_estudiante)->delete();
        CacheInvalidator::indicadores();

        Log::info('Estudiante eliminado', [
            'id_estudiante' => $id_estudiante,
            'nombre'        => trim($estudiante->nombre . ' ' . $estudiante->apellido_paterno . ' ' . $estudiante->apellido_materno),
            'por_usuario'   => $user['usuario'] ?? null,
            'ip'            => request()->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Estudiante eliminado correctamente. Sus citas historicas se conservan.'
        ]);
    }

    // Elimina TODOS los estudiantes (con snapshot previo, requiere token)
    public function destroyAll(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'confirm_token' => 'required|string|in:BORRAR_TODOS_LOS_ESTUDIANTES',
        ], [
            'confirm_token.in' => 'Confirmacion invalida. Operacion cancelada.',
        ]);

        $total = DB::table('estudiantes')->count();

        if ($total === 0) {
            return response()->json([
                'success' => false,
                'message' => 'No hay estudiantes registrados para eliminar.'
            ], 422);
        }

        // Snapshot antes de eliminar todos
        SnapshotService::crear('eliminar_todos', [
            'total_estudiantes' => $total,
        ]);

        DB::table('estudiantes')->delete();
        CacheInvalidator::indicadores();

        Log::warning('TODOS los estudiantes fueron eliminados', [
            'total_eliminados' => $total,
            'por_usuario'      => $user['usuario'] ?? null,
            'ip'               => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Se eliminaron $total estudiantes correctamente. Sus citas historicas se conservan."
        ]);
    }
}