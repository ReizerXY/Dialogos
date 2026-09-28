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
                        'descripcion' => 'Números clave del periodo: citas registradas, completadas, programadas, canceladas, estudiantes atendidos, edad promedio, citas por estudiante y tasas de cumplimiento, cancelación y asistencia.',
                        'default'     => true,
                    ],
                    'por_estado' => [
                        'label'       => 'Cantidad de citas agrupadas por estado',
                        'descripcion' => 'Distribución de las citas según su estado actual: completadas (ya atendidas), programadas (por atender), canceladas y canceladas con horario liberado. Muestra cantidad y porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_clasificacion' => [
                        'label'       => 'Cantidad de citas agrupadas por tipo de clasificación',
                        'descripcion' => 'Distribución de las citas según el tema tratado en cada sesión: académica, familiar, emocional, espiritual o institucional.',
                        'default'     => true,
                    ],
                    'por_asistencia' => [
                        'label'       => 'Cantidad de citas agrupadas por asistencia del estudiante',
                        'descripcion' => 'Distribución de las citas según si el estudiante asistió, no asistió o quedó pendiente de registrar su asistencia.',
                        'default'     => true,
                    ],
                    'por_grado' => [
                        'label'       => 'Estudiantes atendidos agrupados por grado',
                        'descripcion' => 'Cantidad de estudiantes que recibieron al menos una cita en el periodo, agrupados por grado escolar (1ro a 6to).',
                        'default'     => true,
                    ],
                    'por_grupo' => [
                        'label'       => 'Estudiantes atendidos agrupados por grupo',
                        'descripcion' => 'Cantidad de estudiantes que recibieron al menos una cita en el periodo, agrupados por grupo (A, B, C, D).',
                        'default'     => true,
                    ],
                    'por_sexo' => [
                        'label'       => 'Estudiantes atendidos por sexo',
                        'descripcion' => 'Cantidad de estudiantes atendidos agrupados por su sexo registrado (Hombre, Mujer, Prefiere no decirlo, Otro).',
                        'default'     => true,
                    ],
                    'por_edad' => [
                        'label'       => 'Estudiantes atendidos por rango de edad',
                        'descripcion' => 'Cantidad de estudiantes atendidos agrupados por su rango de edad actual (14 años o menos, 15-16, 17-18, 19 años o más).',
                        'default'     => true,
                    ],
                    'top_formadores' => [
                        'label'       => 'Ranking de formadores por cantidad de citas atendidas',
                        'descripcion' => 'Lista ordenada de formadores según cuántas citas atendieron en el periodo. Los primeros tres aparecen con medalla.',
                        'default'     => true,
                    ],
                    'top_estudiantes' => [
                        'label'       => 'Ranking de estudiantes por cantidad de citas recibidas',
                        'descripcion' => 'Lista ordenada de estudiantes según cuántas citas recibieron en el periodo. Los primeros tres aparecen con medalla.',
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
                        'label'       => 'Cantidad de citas agrupadas por estado',
                        'descripcion' => 'Distribución de las citas según su estado: completadas, programadas, canceladas y canceladas con horario liberado, con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_clasificacion' => [
                        'label'       => 'Cantidad de citas agrupadas por tipo de clasificación',
                        'descripcion' => 'Distribución de las citas según el tema tratado: académica, familiar, emocional, espiritual o institucional.',
                        'default'     => true,
                    ],
                    'por_asistencia' => [
                        'label'       => 'Cantidad de citas agrupadas por asistencia del estudiante',
                        'descripcion' => 'Distribución de las citas según si el estudiante asistió, no asistió o quedó pendiente.',
                        'default'     => true,
                    ],
                    'por_sexo' => [
                        'label'       => 'Cantidad de citas agrupadas por sexo del estudiante',
                        'descripcion' => 'Cantidad de citas registradas en el periodo, agrupadas según el sexo del estudiante que las recibió.',
                        'default'     => true,
                    ],
                    'por_edad' => [
                        'label'       => 'Cantidad de citas agrupadas por rango de edad del estudiante',
                        'descripcion' => 'Cantidad de citas registradas en el periodo, agrupadas según el rango de edad del estudiante que las recibió.',
                        'default'     => true,
                    ],
                    'top_formadores' => [
                        'label'       => 'Ranking de formadores por cantidad de citas atendidas',
                        'descripcion' => 'Lista ordenada de formadores según cuántas citas atendieron en el periodo.',
                        'default'     => true,
                    ],
                    'listado_citas' => [
                        'label'       => 'Listado detallado de citas registradas',
                        'descripcion' => 'Tabla con cada cita registrada en el periodo: estudiante, formador, fecha, hora, estado y asistencia.',
                        'default'     => true,
                    ],
                ],
            ],
            'estudiantes' => [
                'titulo'      => 'Reporte de estudiantes atendidos',
                'descripcion' => 'Estudiantes que recibieron al menos una cita en el periodo. Muestra su distribución por grado, grupo, sexo y rango de edad.',
                'secciones'   => [
                    'resumen' => [
                        'label'       => 'Resumen del periodo',
                        'descripcion' => 'Cuántos estudiantes fueron atendidos, cuántas citas recibieron, el promedio de citas por estudiante, la edad promedio y los temas más frecuentes.',
                        'default'     => true,
                    ],
                    'por_grado' => [
                        'label'       => 'Estudiantes atendidos agrupados por grado',
                        'descripcion' => 'Cantidad de estudiantes atendidos agrupados por grado escolar (1ro a 6to), con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_grupo' => [
                        'label'       => 'Estudiantes atendidos agrupados por grupo',
                        'descripcion' => 'Cantidad de estudiantes atendidos agrupados por grupo (A, B, C, D), con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_sexo' => [
                        'label'       => 'Estudiantes atendidos por sexo',
                        'descripcion' => 'Cantidad de estudiantes atendidos agrupados por su sexo registrado, con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_edad' => [
                        'label'       => 'Estudiantes atendidos por rango de edad',
                        'descripcion' => 'Cantidad de estudiantes atendidos agrupados por su rango de edad, con su porcentaje del total.',
                        'default'     => true,
                    ],
                    'por_clasificacion' => [
                        'label'       => 'Temas más tratados en las citas',
                        'descripcion' => 'Distribución de las citas según el tema tratado: académica, familiar, emocional, espiritual o institucional.',
                        'default'     => true,
                    ],
                    'top_estudiantes' => [
                        'label'       => 'Ranking de estudiantes por cantidad de citas recibidas',
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
                        'label'       => 'Ranking de formadores por cantidad de citas atendidas',
                        'descripcion' => 'Lista ordenada de formadores según cuántas citas atendieron en el periodo, con medalla para los tres primeros lugares.',
                        'default'     => true,
                    ],
                    'detalle_formador' => [
                        'label'       => 'Desglose de citas por formador (estados y asistencia)',
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
                        'descripcion' => 'Totales del periodo con foco en la asistencia: total de citas, tasa de asistencia, cuántas veces sí asistió el estudiante y cuántas faltó.',
                        'default'     => true,
                    ],
                    'por_asistencia' => [
                        'label'       => 'Cantidad de citas agrupadas por asistencia del estudiante',
                        'descripcion' => 'Distribución de las citas según si el estudiante asistió, no asistió o quedó pendiente, con su porcentaje del total.',
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

    /**
     * Descarga el PDF (comportamiento original, sin cambios).
     */
    public function generarPDF(Request $request)
    {
        $data = $this->construirReportePDF($request);

        return $data['pdf']->download($data['nombreArchivo']);
    }

    /**
     * Devuelve el PDF en modo "inline" para previsualizarlo en un iframe.
     */
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

    /**
     * Construye el PDF a partir del request. Reutilizado por generarPDF() y previewPDF().
     */
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

        return [
            'pdf'           => $pdf,
            'nombreArchivo' => $nombreArchivo,
        ];
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

    private function calcularEdad($fechaNacimiento)
    {
        if (!$fechaNacimiento) return null;
        try {
            $nacimiento = new \DateTime($fechaNacimiento);
            $hoy = new \DateTime();
            $diff = $hoy->diff($nacimiento);
            $edad = (int) $diff->y;
            return ($edad >= 0 && $edad < 130) ? $edad : null;
        } catch (\Exception $e) {
            return null;
        }
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

        // ---- Ranking de estudiantes ----
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

        // ============================================================
        // Estudiantes atendidos por SEXO
        // ============================================================
        $sexosRaw = DB::table('citas')
            ->join('estudiantes', 'citas.id_estudiante', '=', 'estudiantes.id_estudiante')
            ->select('estudiantes.sexo', 'citas.nombre_estudiante', DB::raw('COUNT(citas.id_cita) as citas_count'))
            ->whereBetween('citas.fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('estudiantes.sexo')
            ->where('estudiantes.sexo', '!=', '')
            ->groupBy('estudiantes.sexo', 'citas.nombre_estudiante')
            ->get();

        $estudiantesPorSexo = ['Hombre' => 0, 'Mujer' => 0, 'Prefiero no decirlo' => 0, 'Otro' => 0];
        $citasPorSexo       = ['Hombre' => 0, 'Mujer' => 0, 'Prefiero no decirlo' => 0, 'Otro' => 0];

        foreach ($sexosRaw as $s) {
            $normalizado = mb_strtolower(trim((string) $s->sexo), 'UTF-8');
            $normalizado = strtr($normalizado, ['á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u']);

            $categoria = 'Otro';
            if (in_array($normalizado, ['hombre', 'masculino', 'varon', 'h'], true)) {
                $categoria = 'Hombre';
            } elseif (in_array($normalizado, ['mujer', 'femenino', 'f'], true)) {
                $categoria = 'Mujer';
            } elseif (
                str_contains($normalizado, 'prefiero') ||
                str_contains($normalizado, 'sin especificar') ||
                str_contains($normalizado, 'no especificado') ||
                str_contains($normalizado, 'n/e')
            ) {
                $categoria = 'Prefiero no decirlo';
            }

            $estudiantesPorSexo[$categoria]++;
            $citasPorSexo[$categoria] += (int) $s->citas_count;
        }

        $estudiantesPorSexo = array_filter($estudiantesPorSexo, fn($v) => $v > 0);
        $citasPorSexo       = array_filter($citasPorSexo,       fn($v) => $v > 0);

        // ============================================================
        // Estudiantes atendidos por RANGO DE EDAD
        // ============================================================
        $edadesRaw = DB::table('citas')
            ->join('estudiantes', 'citas.id_estudiante', '=', 'estudiantes.id_estudiante')
            ->select('estudiantes.fecha_nacimiento', 'citas.nombre_estudiante', DB::raw('COUNT(citas.id_cita) as citas_count'))
            ->whereBetween('citas.fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('estudiantes.fecha_nacimiento')
            ->groupBy('estudiantes.fecha_nacimiento', 'citas.nombre_estudiante')
            ->get();

        $rangosBase = [
            '14 años o menos' => 0,
            '15-16 años'      => 0,
            '17-18 años'      => 0,
            '19 años o más'   => 0,
        ];
        $estudiantesPorEdad = $rangosBase;
        $citasPorEdad       = $rangosBase;

        $sumaEdades   = 0;
        $totalConEdad = 0;

        foreach ($edadesRaw as $e) {
            $edad = $this->calcularEdad($e->fecha_nacimiento);
            if ($edad === null) continue;

            $sumaEdades += $edad;
            $totalConEdad++;

            if ($edad <= 14)      $rango = '14 años o menos';
            elseif ($edad <= 16)  $rango = '15-16 años';
            elseif ($edad <= 18)  $rango = '17-18 años';
            else                  $rango = '19 años o más';

            $estudiantesPorEdad[$rango]++;
            $citasPorEdad[$rango] += (int) $e->citas_count;
        }

        $edadPromedio = $totalConEdad > 0 ? round($sumaEdades / $totalConEdad, 1) : 0;

        $estudiantesPorEdad = array_filter($estudiantesPorEdad, fn($v) => $v > 0);
        $citasPorEdad       = array_filter($citasPorEdad,       fn($v) => $v > 0);

        // ---- Promedio de citas por estudiante atendido ----
        $citasPorEstudiante = $estudiantesAtendidos > 0
            ? round($totalCitas / $estudiantesAtendidos, 1)
            : 0;

        return [
            'total_citas'              => $totalCitas,
            'total_formadores'         => $totalFormadores,
            'total_estudiantes'        => $totalEstudiantes,
            'estudiantes_atendidos'    => $estudiantesAtendidos,
            'formadores_activos'       => $formadoresActivos,
            'promedio'                 => $promedio,
            'citas_por_estudiante'     => $citasPorEstudiante,
            'edad_promedio'            => $edadPromedio,
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
            'estudiantes_por_sexo'     => $estudiantesPorSexo,
            'estudiantes_por_edad'     => $estudiantesPorEdad,
            'citas_por_sexo'           => $citasPorSexo,
            'citas_por_edad'           => $citasPorEdad,
            'top_formadores'           => $topFormadores,
            'top_estudiantes'          => $topEstudiantes,
            'detalles_formador'        => $detallesFormador,
            'citas'                    => $citas,
        ];
    }
}