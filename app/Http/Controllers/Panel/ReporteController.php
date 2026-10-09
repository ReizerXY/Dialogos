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
    // Catálogo de tipos de reporte y sus secciones disponibles
    public static function catalogo(): array
    {
        return [
            'ejecutivo' => [
                'titulo'      => 'Reporte general del programa',
                'descripcion' => 'Vista completa del programa Diálogos en el periodo: cuántas citas hubo, quiénes las atendieron, quiénes las recibieron y cómo fue la asistencia.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen general (números principales)',
                        'descripcion' => 'Números clave del periodo: citas registradas, completadas, programadas, canceladas, estudiantes atendidos, citas por estudiante y tasas de cumplimiento, cancelación y asistencia.',
                        'default'     => true,
                    ],
                    'por_estado' => [
                        'label'       => 'Citas agrupadas por estado',
                        'descripcion' => 'Cuántas citas están en cada estado: completadas (ya atendidas), programadas (por atender), canceladas sin liberar y canceladas con horario liberado. Con porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_clasificacion' => [
                        'label'       => 'Citas agrupadas por tipo de clasificación',
                        'descripcion' => 'Cuántas citas hubo de cada tema: académica, familiar, emocional, espiritual o institucional. Útil para ver qué tipo de acompañamiento es el más solicitado.',
                        'default'     => true,
                    ],
                    'por_asistencia' => [
                        'label'       => 'Citas agrupadas por asistencia del estudiante',
                        'descripcion' => 'Cuántas citas efectivamente fueron atendidas (asistió), cuántas el estudiante no llegó (no asistió) y cuántas quedaron pendientes de registrar.',
                        'default'     => true,
                    ],
                    'por_grado' => [
                        'label'       => 'Estudiantes atendidos por grado',
                        'descripcion' => 'Estudiantes distintos con al menos una cita, agrupados por grado. Incluye inscritos y porcentaje de cobertura para medir qué tanto llega el programa a cada grado.',
                        'default'     => true,
                    ],
                    'por_grado_grupo' => [
                        'label'       => 'Estudiantes atendidos por grado y grupo',
                        'descripcion' => 'Estudiantes distintos con al menos una cita, agrupados por grado + grupo (1ro A, 1ro B...). Incluye inscritos y % de cobertura para detectar grupos olvidados.',
                        'default'     => true,
                    ],
                    'estudiantes_nuevos_mes' => [
                        'label'       => 'Estudiantes nuevos vs recurrentes por mes',
                        'descripcion' => 'Cada mes del periodo: cuántos estudiantes vinieron por primera vez (nuevos) y cuántos ya tenían historial (recurrentes). Mide si el programa crece o se estanca.',
                        'default'     => true,
                    ],
                    'top_formadores' => [
                        'label'       => 'Ranking de formadores por citas atendidas',
                        'descripcion' => 'Lista ordenada de formadores según cuántas citas atendieron en el periodo. Los primeros tres aparecen con medalla.',
                        'default'     => true,
                    ],
                    'top_estudiantes' => [
                        'label'       => 'Ranking de estudiantes por citas recibidas',
                        'descripcion' => 'Estudiantes con más citas en el periodo, con los temas que han tratado y la fecha de su última sesión. Útil para detectar quién necesita seguimiento.',
                        'default'     => true,
                    ],
                ],
            ],
            'citas' => [
                'titulo'      => 'Reporte de citas del periodo',
                'descripcion' => 'Todas las citas registradas en el periodo: su estado, el tema tratado, si el estudiante asistió y el listado completo una por una.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen del periodo',
                        'descripcion' => 'Totales del periodo: citas registradas, completadas, programadas, canceladas, estudiantes atendidos y sus porcentajes correspondientes.',
                        'default'     => true,
                    ],
                    'por_estado' => [
                        'label'       => 'Citas agrupadas por estado',
                        'descripcion' => 'Cuántas citas están en cada estado: completadas, programadas, canceladas y canceladas con horario liberado.',
                        'default'     => true,
                    ],
                    'por_clasificacion' => [
                        'label'       => 'Citas agrupadas por tipo de clasificación',
                        'descripcion' => 'Cuántas citas hubo de cada tema: académica, familiar, emocional, espiritual o institucional.',
                        'default'     => true,
                    ],
                    'por_asistencia' => [
                        'label'       => 'Citas agrupadas por asistencia del estudiante',
                        'descripcion' => 'Cuántas citas fueron atendidas (asistió), cuántas no (no asistió) y cuántas quedaron pendientes.',
                        'default'     => true,
                    ],
                    'estudiantes_nuevos_mes' => [
                        'label'       => 'Estudiantes nuevos vs recurrentes por mes',
                        'descripcion' => 'Cada mes del periodo: cuántos estudiantes vinieron por primera vez y cuántos ya tenían historial. Mide si el programa atrae gente nueva.',
                        'default'     => true,
                    ],
                    'top_formadores' => [
                        'label'       => 'Ranking de formadores por citas atendidas',
                        'descripcion' => 'Lista ordenada de formadores según cuántas citas atendieron en el periodo.',
                        'default'     => true,
                    ],
                    'listado_citas' => [
                        'label'       => 'Listado detallado de citas registradas',
                        'descripcion' => 'Cada cita registrada en el periodo: estudiante, formador, fecha, hora, estado y asistencia. Es la tabla más pesada del reporte.',
                        'default'     => true,
                    ],
                ],
            ],
            'estudiantes' => [
                'titulo'      => 'Reporte de estudiantes atendidos',
                'descripcion' => 'Estudiantes que recibieron al menos una cita en el periodo. Muestra su distribución por grado y grupo, y los temas más tratados.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen del periodo',
                        'descripcion' => 'Cuántos estudiantes fueron atendidos, cuántas citas recibieron, el promedio de citas por estudiante y los temas más frecuentes.',
                        'default'     => true,
                    ],
                    'por_grado' => [
                        'label'       => 'Estudiantes atendidos por grado',
                        'descripcion' => 'Estudiantes distintos con al menos una cita, agrupados por grado. Incluye inscritos y % de cobertura.',
                        'default'     => true,
                    ],
                    'por_grado_grupo' => [
                        'label'       => 'Estudiantes atendidos por grado y grupo',
                        'descripcion' => 'Estudiantes distintos con al menos una cita, agrupados por grado + grupo. Incluye inscritos y % de cobertura.',
                        'default'     => true,
                    ],
                    'por_clasificacion' => [
                        'label'       => 'Temas más tratados en las citas',
                        'descripcion' => 'Distribución de las citas según el tema tratado: académica, familiar, emocional, espiritual o institucional.',
                        'default'     => true,
                    ],
                    'temas_por_grado' => [
                        'label'       => 'Temas tratados por grado',
                        'descripcion' => 'Tabla cruzada: qué tipo de tema consulta cada grado. Útil para detectar necesidades específicas por etapa escolar.',
                        'default'     => true,
                    ],
                    'top_estudiantes' => [
                        'label'       => 'Ranking de estudiantes por citas recibidas',
                        'descripcion' => 'Estudiantes con más citas en el periodo, con los temas que han tratado y su última sesión registrada.',
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
                        'label'       => 'Ranking de formadores por citas atendidas',
                        'descripcion' => 'Lista ordenada de formadores según cuántas citas atendieron en el periodo, con medalla para los tres primeros lugares.',
                        'default'     => true,
                    ],
                    'detalle_formador' => [
                        'label'       => 'Desglose de citas por formador (estados y asistencia)',
                        'descripcion' => 'Tabla por formador: total, completadas, programadas, canceladas (bloquean y liberadas), asistencias, faltas, pendientes y % de asistencia.',
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
                        'descripcion' => 'Totales del periodo con foco en la asistencia: total de citas, tasa de asistencia, cuántas veces sí asistió el estudiante y cuántas faltó.',
                        'default'     => true,
                    ],
                    'por_asistencia' => [
                        'label'       => 'Citas agrupadas por asistencia del estudiante',
                        'descripcion' => 'Distribución de las citas según si el estudiante asistió, no asistió o quedó pendiente, con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'detalle_formador' => [
                        'label'       => 'Asistencia desglosada por formador',
                        'descripcion' => 'Tabla por formador con asistencias, faltas, pendientes y % de asistencia.',
                        'default'     => true,
                    ],
                    'listado_citas' => [
                        'label'       => 'Listado de citas con su asistencia',
                        'descripcion' => 'Tabla con todas las citas del periodo y si el estudiante asistió, no asistió o quedó pendiente.',
                        'default'     => true,
                    ],
                ],
            ],
            'cobertura' => [
                'titulo'      => 'Reporte de cobertura del programa',
                'descripcion' => 'Mide a cuántos estudiantes está llegando el programa: atendidos, sin atención, frecuencia de uso y comparativas por grado y grupo.',
                'secciones'   => [
                    'resumen_cobertura' => [
                        'label'       => 'Resumen de cobertura (histórico total)',
                        'descripcion' => 'Panorama general del programa: estudiantes inscritos, cuántos han sido atendidos alguna vez, cuántos NUNCA han venido y el % de cobertura. Usa todo el histórico, no depende del periodo.',
                        'default'     => true,
                    ],
                    'cobertura_por_grado' => [
                        'label'       => 'Cobertura por grado',
                        'descripcion' => 'Inscritos, atendidos, sin atención y % de cobertura por cada grado (1ro a 6to). Detecta qué grados el programa no está alcanzando.',
                        'default'     => true,
                    ],
                    'cobertura_por_grado_grupo' => [
                        'label'       => 'Cobertura por grado y grupo',
                        'descripcion' => 'Igual que la anterior pero por grupo específico (1ro A, 1ro B...). Permite ver exactamente qué grupos están más olvidados.',
                        'default'     => true,
                    ],
                    'frecuencia_uso' => [
                        'label'       => 'Frecuencia de uso del programa',
                        'descripcion' => 'Cuántos estudiantes vinieron 1 vez, 2 a 3 veces o 4 o más veces en el periodo. Mide si el programa retiene a los estudiantes o solo es una visita única.',
                        'default'     => true,
                    ],
                ],
            ],
        ];
    }

    // Vista inicial del módulo de reportes
    public function index()
    {
        $user = Session::get('user');

        if ($user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

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

    // Descarga el PDF directamente (Content-Disposition: attachment)
    public function generarPDF(Request $request)
    {
        $data = $this->construirReportePDF($request);

        return $data['pdf']->download($data['nombreArchivo']);
    }

    // Devuelve el PDF en modo inline para previsualizarlo en un iframe
    public function previewPDF(Request $request)
    {
        $data = $this->construirReportePDF($request);

        return response($data['pdf']->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $data['nombreArchivo'] . '"',
            'Cache-Control'       => 'no-store, no-cache, must-revalidate',
            'Pragma'              => 'no-cache',
        ]);
    }

    // Construye el PDF a partir del request. Reutilizado por generarPDF() y previewPDF()
    private function construirReportePDF(Request $request): array
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

        // Rango de fechas
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

        return [
            'pdf'           => $pdf,
            'nombreArchivo' => $nombreArchivo,
        ];
    }

    // Devuelve el nombre del mes a partir de YYYY-MM
    private function mesLabel($mesYMD)
    {
        $meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        [$year, $month] = explode('-', $mesYMD);
        return $meses[(int) $month - 1] . ' ' . $year;
    }

    // Devuelve el nombre corto del mes a partir de YYYY-MM (ej. "ene 2026")
    private function mesCortoLabel($mesYMD)
    {
        $meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
        [$year, $month] = explode('-', $mesYMD);
        return $meses[(int) $month - 1] . ' ' . $year;
    }

    // Formatea fecha YYYY-MM-DD a DD-MM-YYYY
    private function formatFechaPDF($fecha)
    {
        if (!$fecha) return '';
        $p = explode('-', $fecha);
        if (count($p) !== 3) return $fecha;
        return "{$p[2]}-{$p[1]}-{$p[0]}";
    }

    // Recopila todos los datos agregados del periodo para armar el PDF
    private function recopilarDatos($fechaInicio, $fechaFin): array
    {
        // ---- Números principales ----
        $totalCitas = DB::table('citas')->whereBetween('fecha', [$fechaInicio, $fechaFin])->count();

        $totalFormadores = DB::table('usuarios')->where('rol', 'Formador')->where('visibilidad_usuario', 1)->count();
        $totalEstudiantes = DB::table('estudiantes')->count();

        $estudiantesAtendidos = DB::table('citas')
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('id_estudiante')
            ->distinct('id_estudiante')
            ->count('id_estudiante');

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

        // ---- Citas por tipo de clasificación ----
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

        // ---- Ranking de formadores ----
        $topFormadores = DB::table('citas')
            ->select('nombre_formador as formador', DB::raw('count(*) as total_citas'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('nombre_formador')
            ->groupBy('nombre_formador')
            ->orderBy('total_citas', 'desc')
            ->limit(10)
            ->get();

        // ---- Desglose por formador (con pendientes y % asistencia) ----
        $detallesFormador = DB::table('citas')
            ->select(
                'nombre_formador as formador',
                DB::raw('count(*) as total'),
                DB::raw("SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas"),
                DB::raw("SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as programadas"),
                DB::raw("SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas"),
                DB::raw("SUM(CASE WHEN estado = 'cancelada_liberada' THEN 1 ELSE 0 END) as canceladas_liberadas"),
                DB::raw("SUM(CASE WHEN asistencia = 'asistió' THEN 1 ELSE 0 END) as asistencias"),
                DB::raw("SUM(CASE WHEN asistencia = 'no asistió' THEN 1 ELSE 0 END) as faltas"),
                DB::raw("SUM(CASE WHEN asistencia = 'pendiente' THEN 1 ELSE 0 END) as pendientes")
            )
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('nombre_formador')
            ->groupBy('nombre_formador')
            ->orderBy('total', 'desc')
            ->get();

        // Calcular % asistencia por formador
        foreach ($detallesFormador as $d) {
            $base = $d->asistencias + $d->faltas;
            $d->pct_asistencia = $base > 0 ? round(($d->asistencias / $base) * 100, 1) : 0;
        }

        $formadoresActivos = $detallesFormador->count();
        $promedio = $formadoresActivos > 0 ? round($totalCitas / $formadoresActivos, 1) : 0;

        // ---- Ranking de estudiantes (enriquecido con temas y última sesión) ----
        // ✅ Optimización: antes se hacían 2 queries por cada estudiante del top (20 queries totales).
        //    Ahora se hacen 2 queries agregadas para todos los del top.
        $topEstudiantesRaw = DB::table('citas')
            ->select('nombre_estudiante', DB::raw('count(*) as total_citas'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->groupBy('nombre_estudiante')
            ->orderBy('total_citas', 'desc')
            ->limit(10)
            ->get();

        $nombresTop = $topEstudiantesRaw->pluck('nombre_estudiante')->toArray();

        // 1 query: temas distintos por estudiante del top
        $temasPorEstudiante = empty($nombresTop)
            ? collect()
            : DB::table('citas')
                ->select('nombre_estudiante', 'clasificacion')
                ->whereIn('nombre_estudiante', $nombresTop)
                ->whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->whereNotNull('clasificacion')
                ->distinct()
                ->get()
                ->groupBy('nombre_estudiante')
                ->map(fn($rows) => $rows->pluck('clasificacion')->toArray());

        // 1 query: última sesión por estudiante del top
        $ultimaSesionPorEstudiante = empty($nombresTop)
            ? collect()
            : DB::table('citas')
                ->select('nombre_estudiante', DB::raw('MAX(fecha) as ultima'))
                ->whereIn('nombre_estudiante', $nombresTop)
                ->whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->groupBy('nombre_estudiante')
                ->pluck('ultima', 'nombre_estudiante');

        $topEstudiantes = [];
        foreach ($topEstudiantesRaw as $e) {
            $e->temas = $temasPorEstudiante[$e->nombre_estudiante] ?? [];
            $e->ultima_sesion = $ultimaSesionPorEstudiante[$e->nombre_estudiante] ?? null;
            $topEstudiantes[] = $e;
        }

        // ---- Inscritos por grado (universo) ----
        $inscritosPorGrado = DB::table('estudiantes')
            ->select('grado', DB::raw('count(*) as total'))
            ->groupBy('grado')
            ->pluck('total', 'grado')
            ->toArray();

        $inscritosPorGradoGrupo = DB::table('estudiantes')
            ->select('grado', 'grupo', DB::raw('count(*) as total'))
            ->groupBy('grado', 'grupo')
            ->get()
            ->keyBy(function ($item) {
                return $item->grado . '|' . $item->grupo;
            });

        // ---- Estudiantes por grado (enriquecido con inscritos y % cobertura) ----
        $estudiantesPorGrado = DB::table('citas')
            ->join('estudiantes', 'citas.id_estudiante', '=', 'estudiantes.id_estudiante')
            ->select('estudiantes.grado', DB::raw('count(distinct citas.id_estudiante) as total'))
            ->whereBetween('citas.fecha', [$fechaInicio, $fechaFin])
            ->groupBy('estudiantes.grado')
            ->orderBy('estudiantes.grado')
            ->get();

        foreach ($estudiantesPorGrado as $item) {
            $item->inscritos = $inscritosPorGrado[$item->grado] ?? 0;
            $item->pct_cobertura = $item->inscritos > 0
                ? round(($item->total / $item->inscritos) * 100, 1)
                : 0;
        }

        // ---- Estudiantes por grado Y grupo (enriquecido con inscritos y % cobertura) ----
        $estudiantesPorGradoGrupo = DB::table('citas')
            ->join('estudiantes', 'citas.id_estudiante', '=', 'estudiantes.id_estudiante')
            ->select(
                'estudiantes.grado',
                'estudiantes.grupo',
                DB::raw('count(distinct citas.id_estudiante) as total')
            )
            ->whereBetween('citas.fecha', [$fechaInicio, $fechaFin])
            ->groupBy('estudiantes.grado', 'estudiantes.grupo')
            ->orderBy('estudiantes.grado')
            ->orderBy('estudiantes.grupo')
            ->get();

        foreach ($estudiantesPorGradoGrupo as $item) {
            $key = $item->grado . '|' . $item->grupo;
            $item->inscritos = isset($inscritosPorGradoGrupo[$key]) ? $inscritosPorGradoGrupo[$key]->total : 0;
            $item->pct_cobertura = $item->inscritos > 0
                ? round(($item->total / $item->inscritos) * 100, 1)
                : 0;
        }

        // ---- Cobertura histórica general ----
        $estudiantesAtendidosHistorico = DB::table('citas')
            ->whereNotNull('id_estudiante')
            ->distinct('id_estudiante')
            ->count('id_estudiante');

        $estudiantesSinAtencionCount = max(0, $totalEstudiantes - $estudiantesAtendidosHistorico);
        $pctCoberturaHistorica = $totalEstudiantes > 0
            ? round(($estudiantesAtendidosHistorico / $totalEstudiantes) * 100, 1)
            : 0;

        // ---- Cobertura por grado (inscritos, atendidos, sin atención, %) ----
        $atendidosPorGrado = DB::table('citas')
            ->join('estudiantes', 'citas.id_estudiante', '=', 'estudiantes.id_estudiante')
            ->select('estudiantes.grado', DB::raw('count(distinct citas.id_estudiante) as total'))
            ->whereBetween('citas.fecha', [$fechaInicio, $fechaFin])
            ->groupBy('estudiantes.grado')
            ->pluck('total', 'grado')
            ->toArray();

        $coberturaPorGrado = [];
        foreach ($inscritosPorGrado as $grado => $inscritos) {
            $atendidos = $atendidosPorGrado[$grado] ?? 0;
            $coberturaPorGrado[] = (object) [
                'grado'         => $grado,
                'inscritos'     => $inscritos,
                'atendidos'     => $atendidos,
                'sin_atencion'  => max(0, $inscritos - $atendidos),
                'pct_cobertura' => $inscritos > 0 ? round(($atendidos / $inscritos) * 100, 1) : 0,
            ];
        }

        // ---- Cobertura por grado y grupo ----
        $atendidosPorGradoGrupo = DB::table('citas')
            ->join('estudiantes', 'citas.id_estudiante', '=', 'estudiantes.id_estudiante')
            ->select(
                'estudiantes.grado',
                'estudiantes.grupo',
                DB::raw('count(distinct citas.id_estudiante) as total')
            )
            ->whereBetween('citas.fecha', [$fechaInicio, $fechaFin])
            ->groupBy('estudiantes.grado', 'estudiantes.grupo')
            ->get()
            ->keyBy(function ($item) {
                return $item->grado . '|' . $item->grupo;
            });

        $coberturaPorGradoGrupo = [];
        foreach ($inscritosPorGradoGrupo as $key => $ins) {
            $atendidos = isset($atendidosPorGradoGrupo[$key]) ? $atendidosPorGradoGrupo[$key]->total : 0;
            $coberturaPorGradoGrupo[] = (object) [
                'grado'         => $ins->grado,
                'grupo'         => $ins->grupo,
                'inscritos'     => $ins->total,
                'atendidos'     => $atendidos,
                'sin_atencion'  => max(0, $ins->total - $atendidos),
                'pct_cobertura' => $ins->total > 0 ? round(($atendidos / $ins->total) * 100, 1) : 0,
            ];
        }
        usort($coberturaPorGradoGrupo, function ($a, $b) {
            if ($a->grado === $b->grado) return strcmp($a->grupo, $b->grupo);
            return strcmp($a->grado, $b->grado);
        });

        // ---- Frecuencia de uso (cuántas citas tuvo cada estudiante en el periodo) ----
        $frecuenciaRaw = DB::table('citas')
            ->select('id_estudiante', DB::raw('count(*) as total'))
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('id_estudiante')
            ->groupBy('id_estudiante')
            ->get();

        $frecUna = 0;
        $frecDosTres = 0;
        $frecCuatroMas = 0;
        foreach ($frecuenciaRaw as $r) {
            if ($r->total == 1) $frecUna++;
            elseif ($r->total <= 3) $frecDosTres++;
            else $frecCuatroMas++;
        }
        $frecuenciaUso = [
            'una'               => $frecUna,
            'dos_tres'          => $frecDosTres,
            'cuatro_mas'        => $frecCuatroMas,
            'total_estudiantes' => $frecUna + $frecDosTres + $frecCuatroMas,
        ];

        // ---- Estudiantes nuevos vs recurrentes por mes ----
        // Mapa: id_estudiante => fecha de su primera cita en toda la historia
        $primerasCitasMap = [];
        $primerasCitasRaw = DB::table('citas')
            ->select('id_estudiante', DB::raw('MIN(fecha) as primera'))
            ->whereNotNull('id_estudiante')
            ->groupBy('id_estudiante')
            ->get();
        foreach ($primerasCitasRaw as $p) {
            $primerasCitasMap[$p->id_estudiante] = $p->primera;
        }

        // Lista de meses que toca el rango
        $meses = [];
        $cursor = new \DateTime($fechaInicio);
        $cursor->modify('first day of this month');
        $cursorFin = new \DateTime($fechaFin);
        while ($cursor <= $cursorFin) {
            $meses[] = $cursor->format('Y-m');
            $cursor->modify('+1 month');
        }

        $estudiantesNuevosMes = [];
        foreach ($meses as $mes) {
            $mesIni = $mes . '-01';
            $mesFin = date('Y-m-t', strtotime($mesIni));

            // Estudiantes que tuvieron cita este mes
            $idsMes = DB::table('citas')
                ->whereBetween('fecha', [$mesIni, $mesFin])
                ->whereNotNull('id_estudiante')
                ->distinct()
                ->pluck('id_estudiante')
                ->toArray();

            $nuevos = 0;
            $recurrentes = 0;
            foreach ($idsMes as $id) {
                if (isset($primerasCitasMap[$id])
                    && $primerasCitasMap[$id] >= $mesIni
                    && $primerasCitasMap[$id] <= $mesFin) {
                    $nuevos++;
                } else {
                    $recurrentes++;
                }
            }

            // Citas totales del mes
            $totalMes = DB::table('citas')
                ->whereBetween('fecha', [$mesIni, $mesFin])
                ->count();

            $estudiantesNuevosMes[] = (object) [
                'mes'          => $mes,
                'mes_label'    => $this->mesCortoLabel($mes),
                'nuevos'       => $nuevos,
                'recurrentes'  => $recurrentes,
                'total_citas'  => $totalMes,
            ];
        }

        // ---- Temas por grado (tabla cruzada) ----
        $temasPorGradoRaw = DB::table('citas')
            ->join('estudiantes', 'citas.id_estudiante', '=', 'estudiantes.id_estudiante')
            ->select('estudiantes.grado', 'citas.clasificacion', DB::raw('count(*) as total'))
            ->whereBetween('citas.fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('citas.clasificacion')
            ->groupBy('estudiantes.grado', 'citas.clasificacion')
            ->orderBy('estudiantes.grado')
            ->get();

        $temasPorGrado = [];
        foreach ($temasPorGradoRaw as $row) {
            if (!isset($temasPorGrado[$row->grado])) $temasPorGrado[$row->grado] = [];
            $temasPorGrado[$row->grado][$row->clasificacion] = $row->total;
        }

        // ---- Promedio de citas por estudiante atendido ----
        $citasPorEstudiante = $estudiantesAtendidos > 0
            ? round($totalCitas / $estudiantesAtendidos, 1)
            : 0;

        return [
            'total_citas'                     => $totalCitas,
            'total_formadores'                => $totalFormadores,
            'total_estudiantes'               => $totalEstudiantes,
            'estudiantes_atendidos'           => $estudiantesAtendidos,
            'formadores_activos'              => $formadoresActivos,
            'promedio'                        => $promedio,
            'citas_por_estudiante'            => $citasPorEstudiante,
            'completadas'                     => $completadas,
            'programadas'                     => $programadas,
            'canceladas'                      => $canceladas,
            'tasa_completacion'               => $tasaCompletacion,
            'tasa_cancelacion'                => $tasaCancelacion,
            'tasa_asistencia'                 => $tasaAsistencia,
            'citas_por_estado'                => $citasPorEstado,
            'citas_por_clasificacion'         => $citasPorClasificacion,
            'citas_por_asistencia'            => $citasPorAsistencia,
            'estudiantes_por_grado'           => $estudiantesPorGrado,
            'estudiantes_por_grado_grupo'     => $estudiantesPorGradoGrupo,
            'estudiantes_nuevos_mes'          => $estudiantesNuevosMes,
            'temas_por_grado'                 => $temasPorGrado,
            'top_formadores'                  => $topFormadores,
            'top_estudiantes'                 => $topEstudiantes,
            'detalles_formador'               => $detallesFormador,
            'citas'                           => $citas,
            // Cobertura
            'estudiantes_atendidos_historico' => $estudiantesAtendidosHistorico,
            'estudiantes_sin_atencion_count'  => $estudiantesSinAtencionCount,
            'pct_cobertura_historica'         => $pctCoberturaHistorica,
            'cobertura_por_grado'             => $coberturaPorGrado,
            'cobertura_por_grado_grupo'       => $coberturaPorGradoGrupo,
            'frecuencia_uso'                  => $frecuenciaUso,
        ];
    }
}