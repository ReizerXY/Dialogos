<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class DashboardController extends Controller
{
    public function metricas()
    {
        $user = Session::get('user');

        // Total de estudiantes
        $totalEstudiantes = DB::table('estudiantes')->count();

        // Total de formadores
        $totalFormadores = DB::table('usuarios')->where('rol', 'Formador')->count();

        // Total de citas por estado
        $citasPorEstado = DB::table('citas')
            ->select('estado', DB::raw('count(*) as total'))
            ->groupBy('estado')
            ->pluck('total', 'estado')
            ->toArray();

        // Citas por formador
        $citasPorFormador = DB::table('citas')
            ->join('usuarios', 'citas.usuario_id', '=', 'usuarios.id')
            ->select('usuarios.nombre as formador', DB::raw('count(*) as total'))
            ->groupBy('usuarios.nombre')
            ->get();

        // Citas de la semana actual
        $lunes = now()->startOfWeek()->toDateString();
        $domingo = now()->endOfWeek()->toDateString();
        $citasSemana = DB::table('citas')
            ->whereBetween('fecha', [$lunes, $domingo])
            ->count();

        // Citas de hoy
        $citasHoy = DB::table('citas')
            ->where('fecha', now()->toDateString())
            ->count();

        return inertia('Panel/Metricas', [
            'user' => $user,
            'metricas' => [
                'totalEstudiantes' => $totalEstudiantes,
                'totalFormadores' => $totalFormadores,
                'citasPorEstado' => $citasPorEstado,
                'citasPorFormador' => $citasPorFormador,
                'citasSemana' => $citasSemana,
                'citasHoy' => $citasHoy,
            ]
        ]);
    }
}