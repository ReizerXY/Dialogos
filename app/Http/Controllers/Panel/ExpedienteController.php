<?php
// app/Http/Controllers/Panel/ExpedienteController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class ExpedienteController extends Controller
{
    // Muestra el expediente de un estudiante (activo o egresado)
    // Todos los usuarios autenticados pueden ver cualquier expediente.
    public function show($id_estudiante)
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

        // Auditoría: registrar quién consulta cada expediente
        Log::info('Expediente consultado', [
            'id_estudiante' => $id_estudiante,
            'por_usuario'   => $user['usuario'] ?? null,
            'rol'           => $user['rol'] ?? null,
            'ip'            => request()->ip(),
        ]);

        return inertia('Panel/Expediente', [
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
            'user' => $user,
        ]);
    }

    // Busca estudiantes por nombre completo o por ID (insensible a acentos)
    // Disponible para Coordinadores y Formadores sin restricción.
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

        // Normalizar: reemplazar caracteres especiales por espacios
        $queryLimpio = preg_replace('/[\(\)\-_,\.\*\+\?\¿\¡\!\[\]\{\}]+/u', ' ', $query);
        $queryLimpio = trim(preg_replace('/\s+/u', ' ', $queryLimpio));

        if ($queryLimpio === '') {
            return response()->json([]);
        }

        $palabras = array_values(array_filter(explode(' ', $queryLimpio), fn($p) => $p !== ''));

        // Límite de palabras para evitar DOS con queries gigantes
        if (count($palabras) > 5) {
            $palabras = array_slice($palabras, 0, 5);
        }

        // Límite de largo de cada palabra
        $palabras = array_map(fn($p) => mb_substr($p, 0, 30), $palabras);

        try {
            // Búsqueda de estudiantes activos
            $activos = DB::table('estudiantes')
                ->where(function ($outer) use ($palabras) {
                    foreach ($palabras as $palabra) {
                        $outer->where(function ($sub) use ($palabra) {
                            $sub->whereRaw(
                                "CONVERT(CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) USING utf8mb4) COLLATE utf8mb4_unicode_ci LIKE ?",
                                ["%{$palabra}%"]
                            )
                            ->orWhere('id_estudiante', 'LIKE', "%{$palabra}%");
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

            // Búsqueda de egresados (mismo criterio sobre nombre_estudiante)
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

            $resultado = collect($activos)
                ->merge($egresados)
                ->unique('id_estudiante')
                ->values()
                ->take(15);

            return response()->json($resultado);
        } catch (\Exception $e) {
            Log::error('Error en buscarEstudiantes:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error en el servidor'], 500);
        }
    }
}