<?php
// app/Http/Controllers/Panel/EstudianteController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Excel as ExcelFormat;
use App\Imports\EstudiantesCsvImport;
use App\Imports\EstudiantesExcelImport;
use App\Services\CacheInvalidator;

class EstudianteController extends Controller
{
    private const GRADOS_VALIDOS = ['1ro', '2do', '3ro', '4to', '5to', '6to'];

    // Días antes del inicio del ciclo en que se muestra la importación
    private const DIAS_ANTES_CICLO = 7;
    // Días después del inicio del ciclo en que se muestra la importación
    private const DIAS_DESPUES_CICLO = 14;

    // Lista todos los estudiantes y pasa la configuración del ciclo escolar
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

        // Lee la configuración (con fallback si la tabla aún no existe)
        $inicioCiclo = null;
        $importacionManual = '0';
        try {
            $inicioCiclo = DB::table('configuracion')->where('clave', 'inicio_ciclo_escolar')->value('valor');
            $importacionManual = DB::table('configuracion')->where('clave', 'importacion_activa_manual')->value('valor');
        } catch (\Exception $e) {
            // Tabla no existe aún
        }

        $mostrarImportacion = $this->calcularMostrarImportacion($inicioCiclo, $importacionManual === '1');

        return inertia('Panel/Estudiantes', [
            'estudiantes' => $estudiantes,
            'user' => $user,
            'config' => [
                'inicio_ciclo_escolar'      => $inicioCiclo,
                'importacion_activa_manual' => $importacionManual === '1',
                'mostrar_importacion'       => $mostrarImportacion,
                'dias_antes_ciclo'          => self::DIAS_ANTES_CICLO,
                'dias_despues_ciclo'        => self::DIAS_DESPUES_CICLO,
            ],
        ]);
    }

    // Determina si se debe mostrar el bloque de importación según la fecha y el modo manual
    private function calcularMostrarImportacion($inicioCiclo, $importacionManual)
    {
        // Modo manual: siempre mostrar
        if ($importacionManual) {
            return true;
        }

        // Sin fecha configurada: no mostrar
        if (!$inicioCiclo) {
            return false;
        }

        try {
            $inicio = new \DateTime($inicioCiclo);
            $inicio->setTime(0, 0, 0);
            $hoy = new \DateTime();
            $hoy->setTime(0, 0, 0);

            $diff = $inicio->diff($hoy);
            $dias = (int) $diff->format('%r%a'); // %r da signo: -5 = 5 días antes, +3 = 3 días después

            return $dias >= -self::DIAS_ANTES_CICLO && $dias <= self::DIAS_DESPUES_CICLO;
        } catch (\Exception $e) {
            return false;
        }
    }

    // Guarda la configuración del ciclo escolar (fecha y modo manual)
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
            DB::table('configuracion')->updateOrInsert(
                ['clave' => 'inicio_ciclo_escolar'],
                ['valor' => $request->inicio_ciclo_escolar ?: null]
            );

            DB::table('configuracion')->updateOrInsert(
                ['clave' => 'importacion_activa_manual'],
                ['valor' => $request->importacion_activa_manual ? '1' : '0']
            );

            return response()->json([
                'success' => true,
                'message' => 'Configuración del ciclo escolar guardada correctamente.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error al guardar configuración:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar la configuración: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Importa estudiantes desde archivo Excel, CSV o TXT
    public function import(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'archivo' => 'required|file|max:20480',
        ]);

        $file = $request->file('archivo');

        try {
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

            Log::info('Import archivo:', [
                'nombre' => $file->getClientOriginalName(),
                'ext' => $file->getClientOriginalExtension(),
                'magic_hex' => bin2hex(substr($magicBytes, 0, 4)),
                'tipo_detectado' => $tipo,
            ]);

            if ($tipo === 'xlsx') {
                $import = new EstudiantesExcelImport();
                Excel::import($import, $file, null, ExcelFormat::XLSX);
                CacheInvalidator::indicadores();
                return response()->json([
                    'success' => true,
                    'message' => $import->getMensaje(),
                    'formato' => 'XLSX',
                ]);
            }

            if ($tipo === 'xls') {
                $import = new EstudiantesExcelImport();
                Excel::import($import, $file, null, ExcelFormat::XLS);
                CacheInvalidator::indicadores();
                return response()->json([
                    'success' => true,
                    'message' => $import->getMensaje(),
                    'formato' => 'XLS',
                ]);
            }

            $import = new EstudiantesCsvImport();
            $import->import($path);
            CacheInvalidator::indicadores();
            return response()->json([
                'success' => true,
                'message' => $import->getMensaje(),
                'formato' => 'TEXTO',
            ]);

        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $errores = [];
            foreach ($e->failures() as $failure) {
                $errores[] = "Fila {$failure->row()}: " . implode(', ', $failure->errors());
            }
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación: ' . implode(' | ', array_slice($errores, 0, 5)),
            ], 422);
        } catch (\PhpOffice\PhpSpreadsheet\Reader\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'El archivo de Excel está dañado o corrupto. Ábrelo en Excel y guárdalo de nuevo.',
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al importar estudiantes:', [
                'error' => $e->getMessage(),
                'archivo' => $file->getClientOriginalName(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al importar: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Detecta el tipo de archivo por sus magic bytes
    private function detectarTipo($magicBytes)
    {
        $hex = bin2hex(substr($magicBytes, 0, 4));
        if (substr($hex, 0, 4) === '504b') return 'xlsx';
        if (substr($hex, 0, 8) === 'd0cf11e0') return 'xls';
        return 'texto';
    }

    // Crea un estudiante nuevo
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
            'telefono_estudiante' => 'nullable|string|max:10',
            'telefono_padre'      => 'nullable|string|max:10',
        ]);

        DB::table('estudiantes')->insert([
            'id_estudiante'       => $request->id_estudiante,
            'nombre'              => $request->nombre,
            'apellido_paterno'    => $request->apellido_paterno,
            'apellido_materno'    => $request->apellido_materno,
            'grado'               => $request->grado,
            'grupo'               => strtoupper(trim($request->grupo)),
            'telefono_estudiante' => $request->telefono_estudiante,
            'telefono_padre'      => $request->telefono_padre,
        ]);

        CacheInvalidator::indicadores();

        return response()->json([
            'success' => true,
            'message' => 'Estudiante agregado correctamente.',
            'estudiante' => DB::table('estudiantes')->where('id_estudiante', $request->id_estudiante)->first()
        ]);
    }

    // Actualiza un estudiante existente
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
            'telefono_estudiante' => 'nullable|string|max:10',
            'telefono_padre'      => 'nullable|string|max:10',
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
                'telefono_estudiante' => $request->telefono_estudiante,
                'telefono_padre'      => $request->telefono_padre,
            ]);

        CacheInvalidator::indicadores();

        return response()->json([
            'success' => true,
            'message' => 'Estudiante actualizado correctamente.',
            'estudiante' => DB::table('estudiantes')->where('id_estudiante', $id_estudiante)->first()
        ]);
    }

    // Elimina un estudiante (sus citas históricas se conservan)
    public function destroy($id_estudiante)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $existe = DB::table('estudiantes')->where('id_estudiante', $id_estudiante)->exists();
        if (!$existe) {
            return response()->json(['error' => 'El estudiante no existe.'], 404);
        }

        DB::table('estudiantes')->where('id_estudiante', $id_estudiante)->delete();
        CacheInvalidator::indicadores();

        return response()->json([
            'success' => true,
            'message' => 'Estudiante eliminado correctamente. Sus citas históricas se conservan.'
        ]);
    }

    // Elimina todos los estudiantes (sus citas históricas se conservan)
    public function destroyAll()
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $total = DB::table('estudiantes')->count();

        if ($total === 0) {
            return response()->json([
                'success' => false,
                'message' => 'No hay estudiantes registrados para eliminar.'
            ], 422);
        }

        DB::table('estudiantes')->delete();
        CacheInvalidator::indicadores();

        return response()->json([
            'success' => true,
            'message' => "Se eliminaron $total estudiantes correctamente. Sus citas históricas se conservan."
        ]);
    }
}