<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class ExpedienteController extends Controller
{
    public function show($id)
    {
        $user = Session::get('user');

        $estudiante = DB::table('estudiantes')
            ->where('matricula', $id)
            ->first();

        if (!$estudiante) {
            abort(404, 'Estudiante no encontrado.');
        }

        $citas = DB::table('citas')
            ->join('usuarios', 'citas.usuario_id', '=', 'usuarios.id')
            ->select('citas.*', 'usuarios.nombre as nombre_formador')
            ->where('citas.nombre_estudiante', $estudiante->nombre)
            ->orderBy('citas.fecha', 'desc')
            ->orderBy('citas.hora', 'desc')
            ->get();

        $totalCitas = $citas->count();
        $citasProgramadas = $citas->where('estado', 'programada')->count();
        $citasCompletadas = $citas->where('estado', 'completada')->count();
        $citasCanceladas = $citas->where('estado', 'cancelada')->count();

        return inertia('Panel/Expediente', [
            'estudiante' => $estudiante,
            'citas' => $citas,
            'totalCitas' => $totalCitas,
            'citasProgramadas' => $citasProgramadas,
            'citasCompletadas' => $citasCompletadas,
            'citasCanceladas' => $citasCanceladas,
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
            $estudiantes = DB::table('estudiantes')
                ->where('nombre', 'LIKE', "%$query%")
                ->orWhere('matricula', 'LIKE', "%$query%")
                ->select('matricula', 'nombre', 'grado', 'grupo')
                ->limit(10)
                ->get();

            Log::info('Buscar estudiantes:', ['query' => $query, 'resultados' => $estudiantes->count()]);

            return response()->json($estudiantes);
        } catch (\Exception $e) {
            Log::error('Error en buscarEstudiantes:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error en el servidor'], 500);
        }
    }
}