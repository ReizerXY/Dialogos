<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class ExpedienteController extends Controller
{
    public function show($id_estudiante)
    {
        $user = Session::get('user');

        // 1) Buscar al estudiante en la tabla de activos
        $estudiante = DB::table('estudiantes')
            ->where('id_estudiante', $id_estudiante)
            ->first();

        $egresado = false;

        // 2) Traer citas por id_estudiante (con LEFT JOIN para formador)
        // ✅ FIX: usuarios.id → usuarios.id_usuario
        $citas = DB::table('citas')
            ->leftJoin('usuarios', 'citas.id_usuario', '=', 'usuarios.id_usuario')
            ->select('citas.*', 'usuarios.nombre as nombre_formador')
            ->where('citas.id_estudiante', $id_estudiante)
            ->orderBy('citas.fecha', 'desc')
            ->orderBy('citas.hora', 'desc')
            ->get();

        // 3) Fallback por nombre si no hay citas con id_estudiante
        if ($citas->isEmpty() && $estudiante) {
            // ✅ FIX: usuarios.id → usuarios.id_usuario
            $citas = DB::table('citas')
                ->leftJoin('usuarios', 'citas.id_usuario', '=', 'usuarios.id_usuario')
                ->select('citas.*', 'usuarios.nombre as nombre_formador')
                ->where('citas.nombre_estudiante', $estudiante->nombre)
                ->orderBy('citas.fecha', 'desc')
                ->orderBy('citas.hora', 'desc')
                ->get();
        }

        // 4) Si no existe en estudiantes pero hay citas → es egresado
        if (!$estudiante && $citas->isNotEmpty()) {
            $egresado = true;

            $nombreSnapshot = $citas->first()->nombre_estudiante;

            $estudiante = (object) [
                'id_estudiante' => $id_estudiante,
                'nombre'        => $nombreSnapshot,
                'grado'         => '—',
                'grupo'         => '—',
                'telefono_estudiante' => null,
                'telefono_padre'      => null,
            ];
        }

        if (!$estudiante) {
            abort(404, 'Estudiante no encontrado.');
        }

        // Contadores
        $totalCitas           = $citas->count();
        $citasProgramadas     = $citas->where('estado', 'programada')->count();
        $citasCompletadas     = $citas->where('estado', 'completada')->count();
        $citasCanceladas      = $citas->where('estado', 'cancelada')->count();
        $asistencias          = $citas->where('asistencia', 'asistió')->count();
        $faltas               = $citas->where('asistencia', 'no asistió')->count();
        $pendientesAsistencia = $citas->where('asistencia', 'pendiente')->count();

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

    public function buscarEstudiantes(Request $request)
    {
        $query = $request->get('q', '');
        if (strlen($query) < 1) {
            return response()->json([]);
        }

        try {
            // 1) Buscar en estudiantes activos
            $activos = DB::table('estudiantes')
                ->where(function ($q) use ($query) {
                    $q->where('nombre', 'LIKE', "%$query%")
                      ->orWhere('id_estudiante', 'LIKE', "%$query%");
                })
                ->select('id_estudiante', 'nombre', 'grado', 'grupo')
                ->limit(10)
                ->get()
                ->map(function ($e) {
                    return [
                        'id_estudiante' => (string) $e->id_estudiante,
                        'nombre' => $e->nombre,
                        'grado' => $e->grado,
                        'grupo' => $e->grupo,
                        'egresado' => false,
                    ];
                });

            // 2) Buscar egresados: están en citas pero no en estudiantes
            $idsActivos = $activos->pluck('id_estudiante')->toArray();

            $egresados = DB::table('citas')
                ->whereNotNull('id_estudiante')
                ->whereNotIn('id_estudiante', function ($sub) {
                    $sub->select('id_estudiante')->from('estudiantes');
                })
                ->where(function ($q) use ($query) {
                    $q->where('id_estudiante', 'LIKE', "%$query%")
                      ->orWhere('nombre_estudiante', 'LIKE', "%$query%");
                })
                ->select('id_estudiante', 'nombre_estudiante')
                ->distinct()
                ->limit(10)
                ->get()
                ->map(function ($e) {
                    return [
                        'id_estudiante' => (string) $e->id_estudiante,
                        'nombre' => $e->nombre_estudiante,
                        'grado' => null,
                        'grupo' => null,
                        'egresado' => true,
                    ];
                })
                ->filter(function ($e) use ($idsActivos) {
                    return !in_array($e['id_estudiante'], $idsActivos);
                });

            // 3) Unir y quitar duplicados
            $resultado = collect($activos)
                ->merge($egresados)
                ->unique('id_estudiante')
                ->values()
                ->take(15);

            Log::info('Buscar estudiantes:', ['query' => $query, 'resultados' => $resultado->count()]);

            return response()->json($resultado);
        } catch (\Exception $e) {
            Log::error('Error en buscarEstudiantes:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error en el servidor'], 500);
        }
    }
}