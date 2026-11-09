<?php
// app/Http/Controllers/Panel/ExpedienteController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Barryvdh\DomPDF\Facade\Pdf; // <-- IMPORTANTE: Importar DomPDF

class ExpedienteController extends Controller
{
    // Muestra el expediente de un estudiante (activo o egresado)
    public function show($id_estudiante)
    {
        $datos = $this->obtenerDatosExpediente($id_estudiante);
        $datos['user'] = Session::get('user');
        
        return inertia('Panel/Expediente', $datos);
    }

    // Genera y descarga el expediente en formato PDF
    public function descargarPdf($id_estudiante)
    {
        $datos = $this->obtenerDatosExpediente($id_estudiante);
        $user = Session::get('user');

        // Auditoría
        Log::info('Expediente PDF descargado', [
            'id_estudiante' => $id_estudiante,
            'por_usuario'   => $user['usuario'] ?? null,
            'ip'            => request()->ip(),
        ]);

        // Cargar la vista de blade para el PDF
        $pdf = Pdf::loadView('pdf.expediente', $datos);
        
        // Configurar papel
        $pdf->setPaper('letter', 'portrait');

        // Nombre del archivo
        $nombreArchivo = 'Expediente_' . str_replace(' ', '_', $datos['estudiante']->nombre) . '.pdf';

        return $pdf->download($nombreArchivo);
    }

    // Método privado que extrae toda la lógica de consulta a la BD
    private function obtenerDatosExpediente($id_estudiante)
    {
        $user = Session::get('user');
        if (!$user) {
            abort(403, 'No autorizado.');
        }

        $estudiante = DB::table('estudiantes')
            ->where('id_estudiante', $id_estudiante)
            ->first();

        $egresado = false;

        $citas = DB::table('citas')
            ->leftJoin('usuarios', 'citas.id_usuario', '=', 'usuarios.id_usuario')
            ->select('citas.*', 'usuarios.nombre as nombre_formador')
            ->where('citas.id_estudiante', $id_estudiante)
            ->orderBy('citas.fecha', 'desc')
            ->orderBy('citas.hora', 'desc')
            ->get();

        // Respaldo por nombre completo si no hay citas con id_estudiante
        if ($citas->isEmpty() && $estudiante) {
            $nombreCompleto = trim($estudiante->nombre . ' ' . $estudiante->apellido_paterno . ' ' . $estudiante->apellido_materno);

            $citas = DB::table('citas')
                ->leftJoin('usuarios', 'citas.id_usuario', '=', 'usuarios.id_usuario')
                ->select('citas.*', 'usuarios.nombre as nombre_formador')
                ->where('citas.nombre_estudiante', $nombreCompleto)
                ->orderBy('citas.fecha', 'desc')
                ->orderBy('citas.hora', 'desc')
                ->get();
        }

        // Si no existe en estudiantes pero hay citas -> es egresado
        if (!$estudiante && $citas->isNotEmpty()) {
            $egresado = true;

            $nombreSnapshot = $citas->first()->nombre_estudiante;

            $estudiante = (object) [
                'id_estudiante'       => $id_estudiante,
                'nombre'              => $nombreSnapshot,
                'apellido_paterno'    => null,
                'apellido_materno'    => null,
                'grado'               => '—',
                'grupo'               => '—',
                'contacto'            => null,
                'contacto_emergencia' => null,
            ];
        }

        if (!$estudiante) {
            abort(404, 'Estudiante no encontrado.');
        }

        // Componer nombre completo (para activos)
        if (!$egresado) {
            $estudiante->nombre = trim(
                $estudiante->nombre . ' ' . $estudiante->apellido_paterno . ' ' . $estudiante->apellido_materno
            );
        }

        $totalCitas           = $citas->count();
        $citasProgramadas     = $citas->where('estado', 'programada')->count();
        $citasCompletadas     = $citas->where('estado', 'completada')->count();
        $citasCanceladas      = $citas->where('estado', 'cancelada')->count();
        $asistencias          = $citas->where('asistencia', 'asistió')->count();
        $faltas               = $citas->where('asistencia', 'no asistió')->count();
        $pendientesAsistencia = $citas->where('asistencia', 'pendiente')->count();

        // Auditoría (solo para la vista web, no para el PDF)
        Log::info('Expediente consultado', [
            'id_estudiante' => $id_estudiante,
            'por_usuario'   => $user['usuario'] ?? null,
            'rol'           => $user['rol'] ?? null,
            'ip'            => request()->ip(),
        ]);

        return [
            'estudiante' => $estudiante,
            'citas' => $citas,
            'totalCitas' => $totalCitas,
            'citasProgramadas' => $citasProgramadas,
            'citasCompletadas' => $citasCompletadas,
            'citasCanceladas' => $citasCanceladas,
            'asistencias' => $asistencias,
            'faltas' => $faltas,
            'pendientesAsistencia' => $pendientesAsistencia,
            'egresado' => $egresado,
        ];
    }

    // Busca estudiantes por nombre completo o por ID (insensible a acentos)
    public function buscarEstudiantes(Request $request)
    {
        $user = Session::get('user');
        if (!$user) {
            return response()->json([]);
        }

        $query = trim((string) $request->get('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json([]);
        }

        $queryLimpio = preg_replace('/[\(\)\-_,\.\*\+\?\¿\¡\!\[\]\{\}]+/u', ' ', $query);
        $queryLimpio = trim(preg_replace('/\s+/u', ' ', $queryLimpio));

        if ($queryLimpio === '') {
            return response()->json([]);
        }

        $palabras = array_values(array_filter(explode(' ', $queryLimpio), fn($p) => $p !== ''));

        if (count($palabras) > 5) {
            $palabras = array_slice($palabras, 0, 5);
        }

        $palabras = array_map(fn($p) => mb_substr($p, 0, 30), $palabras);

        try {
            $activos = DB::table('estudiantes')
                ->where(function ($outer) use ($palabras) {
                    foreach ($palabras as $palabra) {
                        $outer->where(function ($sub) use ($palabra) {
                            $sub->whereRaw(
                                "CONVERT(CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) USING utf8mb4) COLLATE utf8mb4_unicode_ci LIKE ?",
                                ["%{$palabra}%"]
                            )->orWhere('id_estudiante', 'LIKE', "%{$palabra}%");
                        });
                    }
                })
                ->select('id_estudiante', 'nombre', 'apellido_paterno', 'apellido_materno', 'grado', 'grupo')
                ->orderBy('apellido_paterno')
                ->orderBy('apellido_materno')
                ->orderBy('nombre')
                ->limit(10)
                ->get()
                ->map(function ($e) {
                    $nombreCompleto = trim($e->nombre . ' ' . $e->apellido_paterno . ' ' . $e->apellido_materno);
                    return [
                        'id_estudiante' => (string) $e->id_estudiante,
                        'nombre'        => $nombreCompleto,
                        'grado'         => $e->grado,
                        'grupo'         => $e->grupo,
                        'egresado'      => false,
                    ];
                });

            $idsActivos = $activos->pluck('id_estudiante')->toArray();

            $egresados = DB::table('citas')
                ->whereNotNull('id_estudiante')
                ->whereNotIn('id_estudiante', function ($sub) {
                    $sub->select('id_estudiante')->from('estudiantes');
                })
                ->where(function ($outer) use ($palabras) {
                    foreach ($palabras as $palabra) {
                        $outer->where(function ($sub) use ($palabra) {
                            $sub->where('id_estudiante', 'LIKE', "%{$palabra}%")
                                ->orWhereRaw(
                                    "CONVERT(nombre_estudiante USING utf8mb4) COLLATE utf8mb4_unicode_ci LIKE ?",
                                    ["%{$palabra}%"]
                                );
                        });
                    }
                })
                ->select('id_estudiante', 'nombre_estudiante')
                ->distinct()
                ->limit(10)
                ->get()
                ->map(function ($e) {
                    return [
                        'id_estudiante' => (string) $e->id_estudiante,
                        'nombre'        => $e->nombre_estudiante,
                        'grado'         => null,
                        'grupo'         => null,
                        'egresado'      => true,
                    ];
                })
                ->filter(function ($e) use ($idsActivos) {
                    return !in_array($e['id_estudiante'], $idsActivos);
                });

            $resultado = collect($activos)->merge($egresados)->unique('id_estudiante')->values()->take(15);

            return response()->json($resultado);
        } catch (\Exception $e) {
            Log::error('Error en buscarEstudiantes:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error en el servidor'], 500);
        }
    }
}