<?php

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

class EstudianteController extends Controller
{
    public function index()
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        $estudiantes = DB::table('estudiantes')
            ->orderBy('grado')
            ->orderBy('grupo')
            ->orderBy('nombre')
            ->get();

        return inertia('Panel/Estudiantes', [
            'estudiantes' => $estudiantes,
            'user' => $user,
        ]);
    }

    /**
     * Importar estudiantes.
     *
     * Detección por magic bytes:
     *   PK..   → XLSX (ZIP)
     *   D0CF11 → XLS (OLE)
     *   Otros  → Texto (CSV / TXT / TSV)
     *
     * Soporta cualquier encoding y delimitador.
     */
    public function import(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'archivo' => 'required|file|max:20480', // 20 MB, sin restringir mimes
        ]);

        $file = $request->file('archivo');

        try {
            // Limpiar caché de Laravel Excel
            $cacheDir = storage_path('framework/cache/laravel-excel');
            if (is_dir($cacheDir)) {
                foreach (glob($cacheDir . '/*') as $cached) {
                    @unlink($cached);
                }
            }

            // Detectar el tipo REAL por los primeros bytes
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

            // ---------- XLSX ----------
            if ($tipo === 'xlsx') {
                $import = new EstudiantesExcelImport();
                Excel::import($import, $file, null, ExcelFormat::XLSX);

                return response()->json([
                    'success' => true,
                    'message' => $import->getMensaje(),
                    'formato' => 'XLSX',
                ]);
            }

            // ---------- XLS (OLE binario real) ----------
            if ($tipo === 'xls') {
                $import = new EstudiantesExcelImport();
                Excel::import($import, $file, null, ExcelFormat::XLS);

                return response()->json([
                    'success' => true,
                    'message' => $import->getMensaje(),
                    'formato' => 'XLS',
                ]);
            }

            // ---------- Cualquier otro → tratar como texto ----------
            $import = new EstudiantesCsvImport();
            $import->import($path);

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

    /**
     * Detecta el tipo de archivo por sus primeros bytes
     */
    private function detectarTipo($magicBytes)
    {
        $hex = bin2hex(substr($magicBytes, 0, 4));

        // PK.. → ZIP (XLSX es un ZIP)
        if (substr($hex, 0, 4) === '504b') {
            return 'xlsx';
        }

        // D0 CF 11 E0 → OLE Compound (XLS, DOC, PPT clásicos)
        if (substr($hex, 0, 8) === 'd0cf11e0') {
            return 'xls';
        }

        // Todo lo demás → texto (CSV, TXT, TSV)
        return 'texto';
    }

    public function store(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'id_estudiante' => 'required|string|max:10|unique:estudiantes,id_estudiante',
            'nombre'        => 'required|string|max:100',
            'grado'         => 'required|string|max:10',
            'grupo'         => 'required|string|max:5',
            'telefono_estudiante' => 'nullable|string|max:10',
            'telefono_padre'      => 'nullable|string|max:10',
        ]);

        DB::table('estudiantes')->insert([
            'id_estudiante' => $request->id_estudiante,
            'nombre'        => $request->nombre,
            'grado'         => $request->grado,
            'grupo'         => $request->grupo,
            'telefono_estudiante' => $request->telefono_estudiante,
            'telefono_padre'      => $request->telefono_padre,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Estudiante agregado correctamente.',
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
            'nombre'    => 'required|string|max:100',
            'grado'     => 'required|string|max:10',
            'grupo'     => 'required|string|max:5',
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
                'nombre'    => $request->nombre,
                'grado'     => $request->grado,
                'grupo'     => $request->grupo,
                'telefono_estudiante' => $request->telefono_estudiante,
                'telefono_padre'      => $request->telefono_padre,
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Estudiante actualizado correctamente.',
            'estudiante' => DB::table('estudiantes')->where('id_estudiante', $id_estudiante)->first()
        ]);
    }

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

        return response()->json([
            'success' => true,
            'message' => 'Estudiante eliminado correctamente. Sus citas históricas se conservan.'
        ]);
    }

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

        return response()->json([
            'success' => true,
            'message' => "Se eliminaron $total estudiantes correctamente. Sus citas históricas se conservan."
        ]);
    }
}