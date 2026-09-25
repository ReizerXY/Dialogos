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
                'titulo'      => 'Reporte general del programa',
                'descripcion' => 'Vista completa del programa Diálogos en el periodo: cuántas citas hubo, quiénes las atendieron, quiénes las recibieron y cómo fue la asistencia.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen general (números principales)',
                        'descripcion' => 'Los números clave del periodo: total de citas, cuántas se completaron, cuántas están programadas, cuántas se cancelaron, cuántos estudiantes fueron atendidos y los porcentajes de cumplimiento, cancelación y asistencia.',
                        'default'     => true,
                    ],
                    'por_estado' => [
                        'label'       => 'Citas por situación',
                        'descripcion' => 'Cuántas citas están en cada situación: completadas (ya atendidas), programadas (por atender), canceladas o canceladas con horario disponible. Muestra cantidad y porcentaje.',
                        'default'     => true,
                    ],
                    'por_clasificacion' => [
                        'label'       => 'Citas por tema tratado',
                        'descripcion' => 'Cuántas citas se registraron en cada tema: académico, familiar, emocional, espiritual o institucional. Útil para saber qué tipo de apoyo se está dando más.',
                        'default'     => true,
                    ],
                    'por_asistencia' => [
                        'label'       => 'Citas por asistencia del estudiante',
                        'descripcion' => 'Cuántas citas tuvieron al estudiante presente, cuántas no llegó y cuántas quedaron pendientes de registrar. Sirve para medir el compromiso de los estudiantes.',
                        'default'     => true,
                    ],
                    'por_grado' => [
                        'label'       => 'Estudiantes atendidos por grado escolar',
                        'descripcion' => 'Cuántos estudiantes de cada grado (1ro, 2do, 3ro, 4to, 5to, 6to) recibieron al menos una cita en el periodo.',
                        'default'     => true,
                    ],
                    'por_grupo' => [
                        'label'       => 'Estudiantes atendidos por grupo',
                        'descripcion' => 'Cuántos estudiantes de cada grupo (A, B, C, D) recibieron al menos una cita en el periodo.',
                        'default'     => true,
                    ],
                    'top_formadores' => [
                        'label'       => 'Formadores con más citas atendidas',
                        'descripcion' => 'Lista ordenada de los formadores según cuántas citas atendieron en el periodo. Los primeros tres aparecen con medalla.',
                        'default'     => true,
                    ],
                    'top_estudiantes' => [
                        'label'       => 'Estudiantes con más citas recibidas',
                        'descripcion' => 'Lista ordenada de los estudiantes según cuántas citas recibieron en el periodo. Los primeros tres aparecen con medalla.',
                        'default'     => true,
                    ],
                ],
            ],
            'citas' => [
                'titulo'      => 'Reporte de citas del periodo',
                'descripcion' => 'Todas las citas registradas en el periodo: su situación, el tema que se trató, si el estudiante asistió y el listado completo una por una.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen del periodo',
                        'descripcion' => 'Totales del periodo: cuántas citas se registraron, cuántas se completaron, cuántas están programadas, cuántas se cancelaron, cuántos estudiantes fueron atendidos y los porcentajes correspondientes.',
                        'default'     => true,
                    ],
                    'por_estado' => [
                        'label'       => 'Citas por situación',
                        'descripcion' => 'Cuántas citas están completadas, programadas, canceladas o canceladas con horario disponible, con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_clasificacion' => [
                        'label'       => 'Citas por tema tratado',
                        'descripcion' => 'Cuántas citas se registraron en cada tema: académico, familiar, emocional, espiritual o institucional.',
                        'default'     => true,
                    ],
                    'por_asistencia' => [
                        'label'       => 'Citas por asistencia del estudiante',
                        'descripcion' => 'Cuántas citas tuvieron al estudiante presente, cuántas no llegó y cuántas quedaron pendientes.',
                        'default'     => true,
                    ],
                    'top_formadores' => [
                        'label'       => 'Formadores con más citas atendidas',
                        'descripcion' => 'Lista ordenada de formadores según cuántas citas atendieron en el periodo.',
                        'default'     => true,
                    ],
                    'listado_citas' => [
                        'label'       => 'Listado detallado de cada cita',
                        'descripcion' => 'Tabla con todas las citas del periodo: estudiante, formador, fecha, hora, situación y asistencia. Una fila por cada cita.',
                        'default'     => true,
                    ],
                ],
            ],
            'estudiantes' => [
                'titulo'      => 'Reporte de estudiantes atendidos',
                'descripcion' => 'Estudiantes que recibieron al menos una cita en el periodo. Muestra cómo se distribuyen por grado y grupo, y quiénes recibieron más citas.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen del periodo',
                        'descripcion' => 'Cuántos estudiantes fueron atendidos, cuántas citas recibieron en total, el promedio de citas por estudiante y los temas más frecuentes.',
                        'default'     => true,
                    ],
                    'por_grado' => [
                        'label'       => 'Estudiantes atendidos por grado escolar',
                        'descripcion' => 'Cuántos estudiantes de cada grado (1ro a 6to) recibieron al menos una cita, con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_grupo' => [
                        'label'       => 'Estudiantes atendidos por grupo',
                        'descripcion' => 'Cuántos estudiantes de cada grupo (A, B, C, D) recibieron al menos una cita, con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_clasificacion' => [
                        'label'       => 'Temas más tratados en las citas',
                        'descripcion' => 'Los temas que más se trataron en las citas de estos estudiantes: académico, familiar, emocional, espiritual o institucional.',
                        'default'     => true,
                    ],
                    'top_estudiantes' => [
                        'label'       => 'Estudiantes con más citas recibidas',
                        'descripcion' => 'Lista ordenada de estudiantes según cuántas citas recibieron en el periodo.',
                        'default'     => true,
                    ],
                ],
            ],
            'formadores' => [
                'titulo'      => 'Reporte de actividad de los formadores',
                'descripcion' => 'Cuántas citas atendió cada formador en el periodo, cuántas completó, cuántas canceló y cuántas siguen programadas.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen del periodo',
                        'descripcion' => 'Cuántos formadores estuvieron activos, cuántas citas se registraron en total y el promedio de citas por formador.',
                        'default'     => true,
                    ],
                    'top_formadores' => [
                        'label'       => 'Formadores con más citas atendidas',
                        'descripcion' => 'Lista ordenada de formadores según cuántas citas atendieron en el periodo, con medalla para los tres primeros lugares.',
                        'default'     => true,
                    ],
                    'detalle_formador' => [
                        'label'       => 'Desglose de citas por formador',
                        'descripcion' => 'Tabla con cada formador y el detalle de sus citas: total, completadas, programadas, canceladas, asistencias y faltas.',
                        'default'     => true,
                    ],
                ],
            ],
            'asistencia' => [
                'titulo'      => 'Reporte de asistencia a las citas',
                'descripcion' => 'Cuántas citas se atendieron realmente, cuántas no, y cómo se comportó la asistencia por formador.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen del periodo',
                        'descripcion' => 'Totales del periodo con foco en la asistencia: total de citas, porcentaje de asistencia, cuántas veces sí asistió el estudiante y cuántas faltó.',
                        'default'     => true,
                    ],
                    'por_asistencia' => [
                        'label'       => 'Citas por asistencia del estudiante',
                        'descripcion' => 'Cuántas citas tuvieron al estudiante presente, cuántas no llegó y cuántas quedaron pendientes, con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'detalle_formador' => [
                        'label'       => 'Asistencia desglosada por formador',
                        'descripcion' => 'Tabla por formador: cuántas citas tuvieron asistencia, cuántas fueron faltas y cuántas siguen pendientes.',
                        'default'     => true,
                    ],
                    'listado_citas' => [
                        'label'       => 'Listado de citas con su asistencia',
                        'descripcion' => 'Tabla con todas las citas del periodo y si el estudiante asistió, no asistió o quedó pendiente.',
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

        // Solo años con datos en la tabla citas
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
                    $periodoLabel = "Semana {$week} del año {$year}";
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
                    $periodoLabel = 'Fechas personalizadas';
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
        // ---- Números principales ----
        $totalCitas = DB::table('citas')->whereBetween('fecha', [$fechaInicio, $fechaFin])->count();

        $totalFormadores = DB::table('usuarios')->where('rol', 'Formador')->where('activo', 1)->count();
        $totalEstudiantes = DB::table('estudiantes')->count();

        $estudiantesAtendidos = DB::table('citas')
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->distinct('nombre_estudiante')
            ->count('nombre_estudiante');

        // ---- Citas por situación ----
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

        // ---- Citas por tema tratado ----
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

        // ---- Formadores con más citas atendidas ----
        $topFormadores = DB::table('citas')
            ->select('nombre_formador as formador', DB::raw('count(*) as total_citas'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('nombre_formador')
            ->groupBy('nombre_formador')
            ->orderBy('total_citas', 'desc')
            ->limit(10)
            ->get();

        // ---- Desglose por formador ----
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

        // ---- Estudiantes con más citas recibidas ----
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