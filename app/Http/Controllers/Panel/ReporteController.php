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
        public static function catalogo(): array
    {
        return [
            'ejecutivo' => [
                'titulo'      => 'Reporte ejecutivo general',
                'descripcion' => 'Resumen completo del programa con las métricas clave: citas, estudiantes, formadores, asistencia y rankings.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen ejecutivo (KPIs generales)',
                        'descripcion' => 'Muestra los KPIs generales del programa: total de citas registradas, completadas, programadas, canceladas, estudiantes atendidos y las tasas de completación, cancelación y asistencia.',
                        'default'     => true,
                    ],
                    'por_estado' => [
                        'label'       => 'Citas por estado (agrupado)',
                        'descripcion' => 'Desglose de las citas según su estado actual: completada, programada, cancelada o cancelada con horario liberado. Incluye cantidad y porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_clasificacion' => [
                        'label'       => 'Citas por tipo de clasificación',
                        'descripcion' => 'Cantidad de citas agrupadas por el tipo de tema tratado: académica, familiar, emocional, espiritual o institucional.',
                        'default'     => true,
                    ],
                    'por_asistencia' => [
                        'label'       => 'Citas por tipo de asistencia',
                        'descripcion' => 'Cantidad de citas según si el estudiante asistió, no asistió o quedó pendiente de confirmar.',
                        'default'     => true,
                    ],
                    'por_grado' => [
                        'label'       => 'Estudiantes atendidos por grado',
                        'descripcion' => 'Cantidad de estudiantes que recibieron al menos una cita, agrupados por grado (4to, 5to, 6to).',
                        'default'     => true,
                    ],
                    'por_grupo' => [
                        'label'       => 'Estudiantes atendidos por grupo',
                        'descripcion' => 'Cantidad de estudiantes que recibieron al menos una cita, agrupados por grupo (A, B, C).',
                        'default'     => true,
                    ],
                    'top_formadores' => [
                        'label'       => 'Formadores con más citas atendidas',
                        'descripcion' => 'Ranking de los formadores ordenado por la cantidad de citas que atendieron en el periodo, con medallas para los primeros lugares.',
                        'default'     => true,
                    ],
                    'top_estudiantes' => [
                        'label'       => 'Estudiantes con más citas recibidas',
                        'descripcion' => 'Ranking de los estudiantes ordenado por la cantidad de citas que recibieron en el periodo, con medallas para los primeros lugares.',
                        'default'     => true,
                    ],
                ],
            ],
            'citas' => [
                'titulo'      => 'Reporte de citas registradas',
                'descripcion' => 'Detalle de todas las citas del periodo: estados, clasificaciones, asistencia y listado completo.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen del periodo',
                        'descripcion' => 'Totales del periodo: citas registradas, completadas, programadas, canceladas, estudiantes atendidos y tasas porcentuales.',
                        'default'     => true,
                    ],
                    'por_estado' => [
                        'label'       => 'Citas por estado',
                        'descripcion' => 'Cantidad de citas en cada estado (completada, programada, cancelada, cancelada liberada) con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_clasificacion' => [
                        'label'       => 'Citas por tipo de clasificación',
                        'descripcion' => 'Cantidad de citas por tipo de clasificación: académica, familiar, emocional, espiritual o institucional.',
                        'default'     => true,
                    ],
                    'por_asistencia' => [
                        'label'       => 'Citas por tipo de asistencia',
                        'descripcion' => 'Cantidad de citas según la asistencia del estudiante: asistió, no asistió o pendiente.',
                        'default'     => true,
                    ],
                    'top_formadores' => [
                        'label'       => 'Formadores con más citas atendidas',
                        'descripcion' => 'Ranking de formadores ordenado por cantidad de citas atendidas en el periodo.',
                        'default'     => true,
                    ],
                    'listado_citas' => [
                        'label'       => 'Listado completo de citas',
                        'descripcion' => 'Tabla detallada con todas las citas del periodo: estudiante, formador, fecha, hora, estado y asistencia.',
                        'default'     => true,
                    ],
                ],
            ],
            'estudiantes' => [
                'titulo'      => 'Reporte de estudiantes atendidos',
                'descripcion' => 'Estudiantes que recibieron al menos una cita en el periodo. Incluye distribución por grado, grupo y ranking.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen del periodo',
                        'descripcion' => 'Totales del periodo: estudiantes atendidos, total de citas, promedio de citas por estudiante y clasificaciones usadas.',
                        'default'     => true,
                    ],
                    'por_grado' => [
                        'label'       => 'Estudiantes atendidos por grado',
                        'descripcion' => 'Cantidad de estudiantes atendidos agrupados por grado (4to, 5to, 6to), con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_grupo' => [
                        'label'       => 'Estudiantes atendidos por grupo',
                        'descripcion' => 'Cantidad de estudiantes atendidos agrupados por grupo (A, B, C), con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_clasificacion' => [
                        'label'       => 'Clasificaciones más frecuentes',
                        'descripcion' => 'Tipos de clasificación más usados en las citas de los estudiantes atendidos en el periodo.',
                        'default'     => true,
                    ],
                    'top_estudiantes' => [
                        'label'       => 'Estudiantes con más citas recibidas',
                        'descripcion' => 'Ranking de estudiantes ordenado por cantidad de citas recibidas en el periodo.',
                        'default'     => true,
                    ],
                ],
            ],
            'formadores' => [
                'titulo'      => 'Reporte de productividad por formador',
                'descripcion' => 'Actividad de cada formador en el periodo: cuántas citas atendió, cuántas completó y cuántas canceló.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen del periodo',
                        'descripcion' => 'Totales del periodo: formadores activos, total de citas registradas y promedio de citas por formador.',
                        'default'     => true,
                    ],
                    'top_formadores' => [
                        'label'       => 'Ranking por citas atendidas',
                        'descripcion' => 'Ranking de formadores ordenado por cantidad de citas atendidas en el periodo, con medallas para los primeros lugares.',
                        'default'     => true,
                    ],
                    'detalle_formador' => [
                        'label'       => 'Detalle completo por formador',
                        'descripcion' => 'Desglose por formador: total de citas, completadas, programadas, canceladas, asistencias y faltas.',
                        'default'     => true,
                    ],
                ],
            ],
            'asistencia' => [
                'titulo'      => 'Reporte de asistencia a citas',
                'descripcion' => 'Análisis de asistencia: cuántas citas se atendieron, faltas y pendientes, y desglose por formador.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen del periodo',
                        'descripcion' => 'Totales del periodo con foco en la asistencia: total de citas, tasa de asistencia, asistencias y faltas.',
                        'default'     => true,
                    ],
                    'por_asistencia' => [
                        'label'       => 'Citas por tipo de asistencia',
                        'descripcion' => 'Cantidad de citas según la asistencia del estudiante: asistió, no asistió o pendiente, con su porcentaje.',
                        'default'     => true,
                    ],
                    'detalle_formador' => [
                        'label'       => 'Asistencia desglosada por formador',
                        'descripcion' => 'Tabla por formador que muestra cuántas citas tuvieron asistencia, faltas y pendientes.',
                        'default'     => true,
                    ],
                    'listado_citas' => [
                        'label'       => 'Listado de citas con su asistencia',
                        'descripcion' => 'Tabla con todas las citas del periodo y su estado de asistencia (asistió / no asistió / pendiente).',
                        'default'     => true,
                    ],
                ],
            ],
        ];
    }

    public function index()
    {
        $user = Session::get('user');

        if ($user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        // ✅ Solo años con datos en la tabla citas
        $aniosDisponibles = DB::table('citas')
            ->select(DB::raw('DISTINCT YEAR(fecha) as anio'))
            ->orderBy('anio', 'desc')
            ->pluck('anio')
            ->toArray();

        return inertia('Panel/Reportes', [
            'user'              => $user,
            'catalogo'          => self::catalogo(),
            'aniosDisponibles'  => $aniosDisponibles,
        ]);
    }

    public function generarPDF(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        $tipo      = $request->get('tipo', 'citas');
        $periodo   = $request->get('periodo', 'semana');
        $secciones = $request->get('secciones', []);

        $catalogo = self::catalogo();
        if (!isset($catalogo[$tipo])) {
            abort(400, 'Tipo de reporte no válido.');
        }

        if (empty($secciones) || !is_array($secciones)) {
            abort(400, 'Debes seleccionar al menos una sección para generar el reporte.');
        }

        $seccionesValidas = array_keys($catalogo[$tipo]['secciones']);
        $secciones = array_values(array_intersect($secciones, $seccionesValidas));

        if (empty($secciones)) {
            abort(400, 'Ninguna sección válida fue seleccionada.');
        }

        // ============================================================
        // RANGO DE FECHAS
        // ============================================================
        $fechaInicio = null;
        $fechaFin    = null;
        $periodoLabel = '';

        switch ($periodo) {
            case 'semana':
                $semana = $request->get('semana');
                if ($semana) {
                    $year = substr($semana, 0, 4);
                    $week = substr($semana, 6, 2);
                    $fechaInicio = (new \DateTime())->setISODate($year, $week, 1)->format('Y-m-d');
                    $fechaFin    = (new \DateTime())->setISODate($year, $week, 7)->format('Y-m-d');
                    $periodoLabel = "Semana {$week} de {$year}";
                } else {
                    $fechaInicio = now()->subWeek()->startOfWeek()->toDateString();
                    $fechaFin    = now()->subWeek()->endOfWeek()->toDateString();
                    $periodoLabel = 'Semana anterior';
                }
                break;

            case 'mes':
                $mes = $request->get('mes');
                if ($mes) {
                    $fechaInicio = $mes . '-01';
                    $fechaFin    = date('Y-m-t', strtotime($fechaInicio));
                    $periodoLabel = $this->mesLabel($mes);
                } else {
                    $fechaInicio = now()->subMonth()->startOfMonth()->toDateString();
                    $fechaFin    = now()->subMonth()->endOfMonth()->toDateString();
                    $periodoLabel = 'Mes anterior';
                }
                break;

            case 'anio':
                $anio = $request->get('anio');
                if (!$anio) $anio = now()->year;
                $fechaInicio = "{$anio}-01-01";
                $fechaFin    = "{$anio}-12-31";
                $periodoLabel = "Año {$anio}";
                break;

            case 'libre':
            default:
                $fechaInicio = $request->get('fecha_inicio');
                $fechaFin    = $request->get('fecha_fin');

                if (!$fechaInicio || !$fechaFin) {
                    $fechaInicio = now()->subWeek()->startOfWeek()->toDateString();
                    $fechaFin    = now()->subWeek()->endOfWeek()->toDateString();
                    $periodoLabel = 'Semana anterior (por defecto)';
                } else {
                    $periodoLabel = 'Rango personalizado';
                }
                break;
        }

        $datos = $this->recopilarDatos($fechaInicio, $fechaFin);

        $datos['fecha_inicio']  = $fechaInicio;
        $datos['fecha_fin']     = $fechaFin;
        $datos['periodo_label'] = $periodoLabel;

        $pdf = Pdf::loadView('pdf.reporte', [
            'titulo'      => $catalogo[$tipo]['titulo'],
            'datos'       => $datos,
            'tipo'        => $tipo,
            'secciones'   => $secciones,
            'fechaGeneracion' => now()->format('d/m/Y H:i'),
            'generadoPor' => $user['nombre'] ?? $user['usuario'] ?? null,
        ]);

        $pdf->setPaper('letter', 'portrait');

        $nombreArchivo = "reporte_{$tipo}_" . $this->formatFechaPDF($fechaInicio) . "_al_" . $this->formatFechaPDF($fechaFin) . ".pdf";

        return $pdf->download($nombreArchivo);
    }

    private function mesLabel($mesYMD)
    {
        $meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        [$year, $month] = explode('-', $mesYMD);
        return $meses[(int) $month - 1] . ' ' . $year;
    }

    private function formatFechaPDF($fecha)
    {
        if (!$fecha) return '';
        $p = explode('-', $fecha);
        if (count($p) !== 3) return $fecha;
        return "{$p[2]}-{$p[1]}-{$p[0]}";
    }

    private function recopilarDatos($fechaInicio, $fechaFin): array
    {
        // ---- KPIs generales ----
        $totalCitas = DB::table('citas')->whereBetween('fecha', [$fechaInicio, $fechaFin])->count();

        $totalFormadores = DB::table('usuarios')->where('rol', 'Formador')->where('activo', 1)->count();
        $totalEstudiantes = DB::table('estudiantes')->count();

        $estudiantesAtendidos = DB::table('citas')
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->distinct('nombre_estudiante')
            ->count('nombre_estudiante');

        // ---- Citas por estado ----
        $citasPorEstado = DB::table('citas')
            ->select('estado', DB::raw('count(*) as total'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->groupBy('estado')
            ->pluck('total', 'estado')
            ->toArray();

        $completadas = $citasPorEstado['completada'] ?? 0;
        $programadas = $citasPorEstado['programada'] ?? 0;
        $canceladas  = ($citasPorEstado['cancelada'] ?? 0) + ($citasPorEstado['cancelada_liberada'] ?? 0);
        $tasaCompletacion = $totalCitas > 0 ? round(($completadas / $totalCitas) * 100, 1) : 0;
        $tasaCancelacion  = $totalCitas > 0 ? round(($canceladas  / $totalCitas) * 100, 1) : 0;

        // ---- Citas por clasificación ----
        $citasPorClasificacion = DB::table('citas')
            ->select('clasificacion', DB::raw('count(*) as total'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('clasificacion')
            ->groupBy('clasificacion')
            ->orderBy('total', 'desc')
            ->pluck('total', 'clasificacion')
            ->toArray();

        // ---- Citas por asistencia ----
        $citasPorAsistencia = DB::table('citas')
            ->select('asistencia', DB::raw('count(*) as total'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->groupBy('asistencia')
            ->pluck('total', 'asistencia')
            ->toArray();

        $asistio      = $citasPorAsistencia['asistió'] ?? 0;
        $noAsistio    = $citasPorAsistencia['no asistió'] ?? 0;
        $totalConAsis = $asistio + $noAsistio;
        $tasaAsistencia = $totalConAsis > 0 ? round(($asistio / $totalConAsis) * 100, 1) : 0;

        // ---- Listado detallado de citas ----
        $citas = DB::table('citas')
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->orderBy('fecha', 'asc')
            ->orderBy('hora', 'asc')
            ->get();

        // ---- Top formadores ----
        $topFormadores = DB::table('citas')
            ->select('nombre_formador as formador', DB::raw('count(*) as total_citas'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('nombre_formador')
            ->groupBy('nombre_formador')
            ->orderBy('total_citas', 'desc')
            ->limit(10)
            ->get();

        // ---- Detalle por formador ----
        $detallesFormador = DB::table('citas')
            ->select(
                'nombre_formador as formador',
                DB::raw('count(*) as total'),
                DB::raw("SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas"),
                DB::raw("SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as programadas"),
                DB::raw("SUM(CASE WHEN estado IN ('cancelada', 'cancelada_liberada') THEN 1 ELSE 0 END) as canceladas"),
                DB::raw("SUM(CASE WHEN asistencia = 'asistió' THEN 1 ELSE 0 END) as asistencias"),
                DB::raw("SUM(CASE WHEN asistencia = 'no asistió' THEN 1 ELSE 0 END) as faltas")
            )
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('nombre_formador')
            ->groupBy('nombre_formador')
            ->orderBy('total', 'desc')
            ->get();

        $formadoresActivos = $detallesFormador->count();
        $promedio = $formadoresActivos > 0 ? round($totalCitas / $formadoresActivos, 1) : 0;

        // ---- Top estudiantes ----
        $topEstudiantes = DB::table('citas')
            ->select('nombre_estudiante', DB::raw('count(*) as total_citas'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->groupBy('nombre_estudiante')
            ->orderBy('total_citas', 'desc')
            ->limit(10)
            ->get();

        // ---- Estudiantes por grado ----
        $estudiantesPorGrado = DB::table('citas')
            ->join('estudiantes', 'citas.id_estudiante', '=', 'estudiantes.id_estudiante')
            ->select('estudiantes.grado', DB::raw('count(distinct citas.nombre_estudiante) as total'))
            ->whereBetween('citas.fecha', [$fechaInicio, $fechaFin])
            ->groupBy('estudiantes.grado')
            ->orderBy('estudiantes.grado')
            ->get();

        // ---- Estudiantes por grupo ----
        $estudiantesPorGrupo = DB::table('citas')
            ->join('estudiantes', 'citas.id_estudiante', '=', 'estudiantes.id_estudiante')
            ->select('estudiantes.grupo', DB::raw('count(distinct citas.nombre_estudiante) as total'))
            ->whereBetween('citas.fecha', [$fechaInicio, $fechaFin])
            ->groupBy('estudiantes.grupo')
            ->orderBy('estudiantes.grupo')
            ->get();

        return [
            'total_citas'              => $totalCitas,
            'total_formadores'         => $totalFormadores,
            'total_estudiantes'        => $totalEstudiantes,
            'estudiantes_atendidos'    => $estudiantesAtendidos,
            'formadores_activos'       => $formadoresActivos,
            'promedio'                 => $promedio,
            'completadas'              => $completadas,
            'programadas'              => $programadas,
            'canceladas'               => $canceladas,
            'tasa_completacion'        => $tasaCompletacion,
            'tasa_cancelacion'         => $tasaCancelacion,
            'tasa_asistencia'          => $tasaAsistencia,
            'citas_por_estado'         => $citasPorEstado,
            'citas_por_clasificacion'  => $citasPorClasificacion,
            'citas_por_asistencia'     => $citasPorAsistencia,
            'estudiantes_por_grado'    => $estudiantesPorGrado,
            'estudiantes_por_grupo'    => $estudiantesPorGrupo,
            'top_formadores'           => $topFormadores,
            'top_estudiantes'          => $topEstudiantes,
            'detalles_formador'        => $detallesFormador,
            'citas'                    => $citas,
        ];
    }
}