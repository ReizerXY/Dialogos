<?php
// app/Http/Controllers/Panel/ReporteController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Barryvdh\DomPDF\Facade\Pdf;

class ReporteController extends Controller
{
    public function index()
    {
        $user = Session::get('user');

        if ($user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        return inertia('Panel/Reportes', [
            'user' => $user,
        ]);
    }

    public function generarPDF(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        $tipo = $request->get('tipo', 'citas');
        $periodo = $request->get('periodo', 'semana');

        $fechaInicio = null;
        $fechaFin = null;

        switch ($periodo) {
            case 'semana':
                $semana = $request->get('semana');
                if ($semana) {
                    $year = substr($semana, 0, 4);
                    $week = substr($semana, 6, 2);
                    $fechaInicio = (new \DateTime())->setISODate($year, $week)->format('Y-m-d');
                    $fechaFin = (new \DateTime())->setISODate($year, $week, 5)->format('Y-m-d');
                } else {
                    $fechaInicio = now()->subWeek()->startOfWeek()->toDateString();
                    $fechaFin = now()->subWeek()->startOfWeek()->addDays(4)->toDateString();
                }
                break;

            case 'mes':
                $mes = $request->get('mes');
                if ($mes) {
                    $fechaInicio = $mes . '-01';
                    $fechaFin = date('Y-m-t', strtotime($fechaInicio));
                } else {
                    $fechaInicio = now()->subMonth()->startOfMonth()->toDateString();
                    $fechaFin = now()->subMonth()->endOfMonth()->toDateString();
                }
                break;

            case 'libre':
            default:
                $fechaInicio = $request->get('fecha_inicio');
                $fechaFin = $request->get('fecha_fin');

                if (!$fechaInicio || !$fechaFin) {
                    $fechaInicio = now()->subWeek()->startOfWeek()->toDateString();
                    $fechaFin = now()->subWeek()->startOfWeek()->addDays(4)->toDateString();
                }
                break;
        }

        $datos = [];
        $titulo = '';

        switch ($tipo) {
            case 'estudiantes':
                $datos = $this->reporteEstudiantes($fechaInicio, $fechaFin);
                $titulo = 'Reporte de estudiantes atendidos';
                break;
            case 'citas':
                $datos = $this->reporteCitas($fechaInicio, $fechaFin);
                $titulo = 'Reporte de citas';
                break;
            case 'formadores':
                $datos = $this->reporteFormadores($fechaInicio, $fechaFin);
                $titulo = 'Reporte de productividad por formador';
                break;
            default:
                abort(400, 'Tipo de reporte no válido.');
        }

        // Inyectamos fecha_inicio y fecha_fin en $datos para la vista
        $datos['fecha_inicio'] = $fechaInicio;
        $datos['fecha_fin'] = $fechaFin;

        $pdf = Pdf::loadView('pdf.reporte', [
            'titulo' => $titulo,
            'datos' => $datos,
            'tipo' => $tipo,
            'fechaGeneracion' => now()->format('d/m/Y H:i'),
            'generadoPor' => $user['nombre'] ?? $user['usuario'] ?? null,
        ]);

        $pdf->setPaper('letter', 'portrait');

        // Nombre del PDF con fechas DD-MM-YYYY
        $nombreArchivo = "reporte_{$tipo}_" . $this->formatFechaPDF($fechaInicio) . "_al_" . $this->formatFechaPDF($fechaFin) . ".pdf";

        return $pdf->download($nombreArchivo);
    }

    /**
     * Helper para formatear fecha YYYY-MM-DD → DD-MM-YYYY
     */
    private function formatFechaPDF($fecha)
    {
        if (!$fecha) return '';
        $p = explode('-', $fecha);
        if (count($p) !== 3) return $fecha;
        return "{$p[2]}-{$p[1]}-{$p[0]}";
    }

    // ==================================================================
    // ====================== REPORTE DE ESTUDIANTES ====================
    // ==================================================================
    private function reporteEstudiantes($fechaInicio, $fechaFin)
    {
        $totalEstudiantes = DB::table('citas')
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->distinct('nombre_estudiante')
            ->count('nombre_estudiante');

        $totalCitas = DB::table('citas')
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->count();

        $estudiantes = DB::table('citas')
            ->select('nombre_estudiante', DB::raw('count(*) as total_citas'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->groupBy('nombre_estudiante')
            ->orderBy('total_citas', 'desc')
            ->get();

        $clasificaciones = DB::table('citas')
            ->select('clasificacion', DB::raw('count(*) as total'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('clasificacion')
            ->groupBy('clasificacion')
            ->orderBy('total', 'desc')
            ->get();

        // Distribución de estudiantes por grado (solo los que tuvieron citas en el periodo)
        $estudiantes_por_grado = DB::table('citas')
            ->join('estudiantes', 'citas.id_estudiante', '=', 'estudiantes.id_estudiante')
            ->select('estudiantes.grado', DB::raw('count(distinct citas.nombre_estudiante) as total'))
            ->whereBetween('citas.fecha', [$fechaInicio, $fechaFin])
            ->groupBy('estudiantes.grado')
            ->orderBy('estudiantes.grado')
            ->get();

        // Distribución de estudiantes por grupo
        $estudiantes_por_grupo = DB::table('citas')
            ->join('estudiantes', 'citas.id_estudiante', '=', 'estudiantes.id_estudiante')
            ->select('estudiantes.grupo', DB::raw('count(distinct citas.nombre_estudiante) as total'))
            ->whereBetween('citas.fecha', [$fechaInicio, $fechaFin])
            ->groupBy('estudiantes.grupo')
            ->orderBy('estudiantes.grupo')
            ->get();

        return [
            'total_estudiantes'      => $totalEstudiantes,
            'total_citas'            => $totalCitas,
            'estudiantes'            => $estudiantes,
            'clasificaciones'        => $clasificaciones,
            'estudiantes_por_grado'  => $estudiantes_por_grado,
            'estudiantes_por_grupo'  => $estudiantes_por_grupo,
        ];
    }

    // ==================================================================
    // ======================== REPORTE DE CITAS ========================
    // ==================================================================
    private function reporteCitas($fechaInicio, $fechaFin)
    {
        $totalCitas = DB::table('citas')
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->count();

        $citasPorEstado = DB::table('citas')
            ->select('estado', DB::raw('count(*) as total'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->groupBy('estado')
            ->pluck('total', 'estado')
            ->toArray();

        $citasPorClasificacion = DB::table('citas')
            ->select('clasificacion', DB::raw('count(*) as total'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('clasificacion')
            ->groupBy('clasificacion')
            ->orderBy('total', 'desc')
            ->pluck('total', 'clasificacion')
            ->toArray();

        $citasPorAsistencia = DB::table('citas')
            ->select('asistencia', DB::raw('count(*) as total'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->groupBy('asistencia')
            ->pluck('total', 'asistencia')
            ->toArray();

        // nombre_formador ya viene como columna propia de citas (snapshot histórico)
        $citas = DB::table('citas')
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->orderBy('fecha', 'asc')
            ->orderBy('hora', 'asc')
            ->get();

        // Top formadores por citas en el periodo (agrupado por nombre_formador,
        // así se conserva el histórico aunque el usuario sea editado o dado de baja)
        $topFormadores = DB::table('citas')
            ->select('nombre_formador as formador', DB::raw('count(*) as total_citas'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('nombre_formador')
            ->groupBy('nombre_formador')
            ->orderBy('total_citas', 'desc')
            ->limit(5)
            ->get();

        return [
            'total_citas'             => $totalCitas,
            'citas_por_estado'        => $citasPorEstado,
            'citas_por_clasificacion' => $citasPorClasificacion,
            'citas_por_asistencia'    => $citasPorAsistencia,
            'citas'                   => $citas,
            'top_formadores'          => $topFormadores,
        ];
    }

    // ==================================================================
    // ===================== REPORTE DE FORMADORES ======================
    // ==================================================================
    private function reporteFormadores($fechaInicio, $fechaFin)
    {
        $formadoresActivos = DB::table('citas')
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('nombre_formador')
            ->distinct('nombre_formador')
            ->count('nombre_formador');

        // Agrupado por nombre_formador (snapshot) en vez de JOIN a usuarios
        $formadores = DB::table('citas')
            ->select('nombre_formador as formador', DB::raw('count(*) as total_citas'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('nombre_formador')
            ->groupBy('nombre_formador')
            ->orderBy('total_citas', 'desc')
            ->get();

        $totalCitas = DB::table('citas')
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->count();

        // ✅ Promedio sobre formadores que dieron citas en el periodo,
        //    no sobre el total de usuarios formadores registrados.
        $promedio = $formadoresActivos > 0
            ? round($totalCitas / $formadoresActivos, 1)
            : 0;

        // Detalles por formador (completadas, canceladas, asistencias) usando el snapshot
        $detallesFormador = DB::table('citas')
            ->select(
                'nombre_formador as formador',
                DB::raw('count(*) as total'),
                DB::raw("SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas"),
                DB::raw("SUM(CASE WHEN estado IN ('cancelada', 'cancelada_liberada') THEN 1 ELSE 0 END) as canceladas"),
                DB::raw("SUM(CASE WHEN asistencia = 'asistió' THEN 1 ELSE 0 END) as asistencias")
            )
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('nombre_formador')
            ->groupBy('nombre_formador')
            ->orderBy('total', 'desc')
            ->get();

        return [
            'formadores_activos' => $formadoresActivos,
            'formadores'         => $formadores,
            'total_citas'        => $totalCitas,
            'promedio'           => $promedio,
            'total_formadores'   => $formadoresActivos, // ahora consistente con la tarjeta 1
            'detalles_formador'  => $detallesFormador,
        ];
    }
}