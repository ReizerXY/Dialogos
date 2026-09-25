<?php
// app/Http/Controllers/Panel/IndicadoresController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class IndicadoresController extends Controller
{
    private $MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

    private function mesTitulo($mesYMD)
    {
        if (!$mesYMD) return '';
        [$year, $month] = explode('-', $mesYMD);
        return $this->MESES_ES[(int) $month - 1] . ' ' . $year;
    }

    public function index(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') abort(403, 'No autorizado.');

        $anio   = $request->get('anio');
        $mes    = $request->get('mes');
        $semana = $request->get('semana');
        $grado  = $request->get('grado');
        $grupo  = $request->get('grupo');

        // ============================================================
        // FILTRO DE FECHA
        // ============================================================
        $whereRaw = '';
        $bindings = [];

        if ($semana) {
            $year = substr($semana, 0, 4);
            $week = substr($semana, 6, 2);
            $fechaLunes   = (new \DateTime())->setISODate($year, $week, 1)->format('Y-m-d');
            $fechaDomingo = (new \DateTime())->setISODate($year, $week, 7)->format('Y-m-d');
            $whereRaw = "fecha BETWEEN ? AND ?";
            $bindings = [$fechaLunes, $fechaDomingo];
        } elseif ($mes) {
            $parts = explode('-', $mes);
            $whereRaw = "YEAR(fecha) = ? AND MONTH(fecha) = ?";
            $bindings = [$parts[0], $parts[1]];
        } elseif ($anio) {
            $whereRaw = "YEAR(fecha) = ?";
            $bindings = [$anio];
        } else {
            $mesActual = now()->format('Y-m');
            $parts = explode('-', $mesActual);
            $whereRaw = "YEAR(fecha) = ? AND MONTH(fecha) = ?";
            $bindings = [$parts[0], $parts[1]];
        }

        // ============================================================
        // FILTRO GRADO/GRUPO
        // ============================================================
        $aplicarFiltroGradoGrupo = $grado || $grupo;
        $idsEstudiantesFiltrados = [];
        if ($aplicarFiltroGradoGrupo) {
            $qEst = DB::table('estudiantes')->select('id_estudiante');
            if ($grado) $qEst->where('grado', $grado);
            if ($grupo) $qEst->where('grupo', $grupo);
            $idsEstudiantesFiltrados = $qEst->pluck('id_estudiante')->toArray();
        }

        $buildCitasQuery = function () use ($whereRaw, $bindings, $aplicarFiltroGradoGrupo, $idsEstudiantesFiltrados) {
            $q = DB::table('citas')->whereRaw($whereRaw, $bindings);
            if ($aplicarFiltroGradoGrupo) {
                $q->whereIn('id_estudiante', $idsEstudiantesFiltrados ?: [0]);
            }
            return $q;
        };

        $buildEstudiantesQuery = function () use ($grado, $grupo) {
            $q = DB::table('estudiantes');
            if ($grado) $q->where('grado', $grado);
            if ($grupo) $q->where('grupo', $grupo);
            return $q;
        };

        // ============================================================
        // KPIs
        // ============================================================
        $totalCitas       = $buildCitasQuery()->count();
        $totalFormadores  = DB::table('usuarios')->where('rol', 'Formador')->where('activo', 1)->count();
        $totalEstudiantes = $buildEstudiantesQuery()->count();

        $estudiantesAtendidos = $buildCitasQuery()
            ->distinct('nombre_estudiante')
            ->count('nombre_estudiante');

        $citasPorEstado = $buildCitasQuery()
            ->select('estado', DB::raw('count(*) as total'))
            ->groupBy('estado')
            ->pluck('total', 'estado')
            ->toArray();

        $completadas = $citasPorEstado['completada'] ?? 0;
        $canceladas  = ($citasPorEstado['cancelada'] ?? 0) + ($citasPorEstado['cancelada_liberada'] ?? 0);

        $tasaCompletacion = $totalCitas > 0 ? round(($completadas / $totalCitas) * 100, 1) : 0;
        $tasaCancelacion  = $totalCitas > 0 ? round(($canceladas  / $totalCitas) * 100, 1) : 0;

        $citasPorAsistencia = $buildCitasQuery()
            ->select('asistencia', DB::raw('count(*) as total'))
            ->groupBy('asistencia')
            ->pluck('total', 'asistencia')
            ->toArray();

        $asistio      = $citasPorAsistencia['asistió'] ?? 0;
        $noAsistio    = $citasPorAsistencia['no asistió'] ?? 0;
        $totalConAsis = $asistio + $noAsistio;
        $tasaAsistencia = $totalConAsis > 0 ? round(($asistio / $totalConAsis) * 100, 1) : 0;

        // ============================================================
        // ESTUDIANTES AGRUPADOS (respeta filtro de grado/grupo)
        // ============================================================
        $queryEstudiantesAgrupados = DB::table('estudiantes')
            ->select('id_estudiante', 'nombre', 'grado', 'grupo');

        if ($grado) $queryEstudiantesAgrupados->where('grado', $grado);
        if ($grupo) $queryEstudiantesAgrupados->where('grupo', $grupo);

        $estudiantesAgrupados = $queryEstudiantesAgrupados
            ->orderBy('grado')->orderBy('grupo')->orderBy('nombre')
            ->get()
            ->groupBy('grado')
            ->map(function ($grupoGrado) {
                return $grupoGrado->groupBy('grupo')->map(function ($alumnos, $grupo) {
                    return [
                        'grupo' => $grupo,
                        'total' => $alumnos->count(),
                        'alumnos' => $alumnos->map(function ($a) {
                            return ['id_estudiante' => $a->id_estudiante, 'nombre' => $a->nombre];
                        })->values()->toArray(),
                    ];
                })->values()->toArray();
            })
            ->toArray();

        $gradosActivos = DB::table('estudiantes')->select('grado')->distinct()->orderBy('grado')->pluck('grado')->toArray();

        $gruposPorGrado = [];
        foreach ($gradosActivos as $g) {
            $gruposPorGrado[$g] = DB::table('estudiantes')
                ->where('grado', $g)
                ->select('grupo')->distinct()->orderBy('grupo')->pluck('grupo')->toArray();
        }

        $gruposActivos = DB::table('estudiantes')->select('grupo')->distinct()->orderBy('grupo')->pluck('grupo')->toArray();

        // ============================================================
        // DISTRIBUCIONES
        // ============================================================
        $citasPorClasificacion = $buildCitasQuery()
            ->select('clasificacion', DB::raw('count(*) as total'))
            ->whereNotNull('clasificacion')
            ->groupBy('clasificacion')->orderBy('total', 'desc')
            ->pluck('total', 'clasificacion')->toArray();

        $citasPorHora = $buildCitasQuery()
            ->select(DB::raw('HOUR(hora) as hora'), DB::raw('count(*) as total'))
            ->groupBy('hora')->orderBy('hora')
            ->get()
            ->mapWithKeys(function ($item) {
                $h = str_pad($item->hora, 2, '0', STR_PAD_LEFT) . ':00';
                return [$h => $item->total];
            })
            ->toArray();

        // ============================================================
        // DESTACADOS (antes rankings)
        // ============================================================
        $formadoresTop = $buildCitasQuery()
            ->select('nombre_formador as nombre', DB::raw('count(*) as total'))
            ->whereNotNull('nombre_formador')
            ->groupBy('nombre_formador')->orderBy('total', 'desc')->limit(5)->get();

        $estudiantesTop = $buildCitasQuery()
            ->select('nombre_estudiante', DB::raw('count(*) as total'))
            ->groupBy('nombre_estudiante')->orderBy('total', 'desc')->limit(5)->get();

        // ============================================================
        // TENDENCIAS
        // ============================================================
        $citasPorMes = $buildCitasQuery()
            ->select(DB::raw("DATE_FORMAT(fecha, '%Y-%m') as mes"), DB::raw('count(*) as total'))
            ->groupBy('mes')->orderBy('mes')->get();

        $citasPorDiaSemana = $buildCitasQuery()
            ->select(DB::raw('DAYNAME(fecha) as dia'), DB::raw('count(*) as total'))
            ->groupBy('dia')
            ->orderByRaw("FIELD(dia, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")
            ->get()
            ->mapWithKeys(function ($item) {
                $dias = ['Monday'=>'Lunes','Tuesday'=>'Martes','Wednesday'=>'Miércoles','Thursday'=>'Jueves','Friday'=>'Viernes','Saturday'=>'Sábado','Sunday'=>'Domingo'];
                return [$dias[$item->dia] ?? $item->dia => $item->total];
            })
            ->toArray();

        // ============================================================
        // COMPARATIVAS (dinámicas)
        // ============================================================
        $mostrarCompSemana = false;
        $mostrarCompMes    = false;

        if ($semana) {
            $mostrarCompSemana = true;
        } elseif ($mes) {
            $mostrarCompMes = true;
        } elseif ($anio) {
            $mostrarCompMes = true;
        } else {
            $mostrarCompSemana = true;
            $mostrarCompMes = true;
        }

        // --- Comparativa de semana ---
        if ($semana) {
            $year = (int) substr($semana, 0, 4);
            $week = (int) substr($semana, 6, 2);

            $inicioSemAct = (new \DateTime())->setISODate($year, $week, 1)->format('Y-m-d');
            $finSemAct    = (new \DateTime())->setISODate($year, $week, 7)->format('Y-m-d');

            $weekPrev = $week - 1;
            $yearPrev = $year;
            if ($weekPrev < 1) { $yearPrev = $year - 1; $weekPrev = 52; }

            $inicioSemAnt = (new \DateTime())->setISODate($yearPrev, $weekPrev, 1)->format('Y-m-d');
            $finSemAnt    = (new \DateTime())->setISODate($yearPrev, $weekPrev, 7)->format('Y-m-d');

            $tituloCompSemana = "Semana $week vs semana $weekPrev";
            $labelSemActual   = "Semana $week de $year";
            $labelSemAnterior = "Semana $weekPrev de $yearPrev";
        } else {
            $inicioSemAct = now()->startOfWeek()->toDateString();
            $finSemAct    = now()->endOfWeek()->toDateString();
            $inicioSemAnt = now()->subWeek()->startOfWeek()->toDateString();
            $finSemAnt    = now()->subWeek()->endOfWeek()->toDateString();
            $tituloCompSemana = 'Esta semana vs semana pasada';
            $labelSemActual   = 'Esta semana';
            $labelSemAnterior = 'Semana pasada';
        }

        $citasSemanaActual   = DB::table('citas')->whereBetween('fecha', [$inicioSemAct, $finSemAct])->count();
        $citasSemanaAnterior = DB::table('citas')->whereBetween('fecha', [$inicioSemAnt, $finSemAnt])->count();
        $diffSemana = $citasSemanaActual - $citasSemanaAnterior;
        $pctSemana  = $citasSemanaAnterior > 0
            ? round((($citasSemanaActual - $citasSemanaAnterior) / $citasSemanaAnterior) * 100, 1)
            : ($citasSemanaActual > 0 ? 100 : 0);

        // --- Comparativa de mes ---
        if ($mes) {
            $inicioMesAct = "$mes-01";
            $finMesAct    = date('Y-m-t', strtotime($inicioMesAct));
            $mesPrev      = date('Y-m', strtotime("$inicioMesAct -1 month"));
            $inicioMesAnt = "$mesPrev-01";
            $finMesAnt    = date('Y-m-t', strtotime($inicioMesAnt));

            $tituloCompMes    = 'Mes de ' . $this->mesTitulo($mes) . ' vs mes de ' . $this->mesTitulo($mesPrev);
            $labelMesActual   = 'Mes de ' . $this->mesTitulo($mes);
            $labelMesAnterior = 'Mes de ' . $this->mesTitulo($mesPrev);
        } else {
            $inicioMesAct = now()->startOfMonth()->toDateString();
            $finMesAct    = now()->endOfMonth()->toDateString();
            $inicioMesAnt = now()->subMonth()->startOfMonth()->toDateString();
            $finMesAnt    = now()->subMonth()->endOfMonth()->toDateString();
            $tituloCompMes    = 'Este mes vs mes anterior';
            $labelMesActual   = 'Este mes';
            $labelMesAnterior = 'Mes anterior';
        }

        $citasMesActual   = DB::table('citas')->whereBetween('fecha', [$inicioMesAct, $finMesAct])->count();
        $citasMesAnterior = DB::table('citas')->whereBetween('fecha', [$inicioMesAnt, $finMesAnt])->count();
        $diffMes = $citasMesActual - $citasMesAnterior;
        $pctMes  = $citasMesAnterior > 0
            ? round((($citasMesActual - $citasMesAnterior) / $citasMesAnterior) * 100, 1)
            : ($citasMesActual > 0 ? 100 : 0);

        // ============================================================
        // DETALLE POR FORMADOR  ← Este bloque es el que faltaba
        // ============================================================
        $formadoresNombres = $buildCitasQuery()
            ->select('nombre_formador')
            ->whereNotNull('nombre_formador')
            ->distinct()
            ->orderBy('nombre_formador')
            ->pluck('nombre_formador')
            ->toArray();

        $detalleFormadores = [];
        foreach ($formadoresNombres as $nombre) {
            $baseQ = $buildCitasQuery()->where('nombre_formador', $nombre);

            $total       = (clone $baseQ)->count();
            $completadas = (clone $baseQ)->where('estado', 'completada')->count();
            $programadas = (clone $baseQ)->where('estado', 'programada')->count();
            $canceladas  = (clone $baseQ)->whereIn('estado', ['cancelada', 'cancelada_liberada'])->count();
            $asistencias = (clone $baseQ)->where('asistencia', 'asistió')->count();
            $faltas      = (clone $baseQ)->where('asistencia', 'no asistió')->count();
            $totalAsis   = $asistencias + $faltas;
            $tasaAsis    = $totalAsis > 0 ? round(($asistencias / $totalAsis) * 100, 1) : 0;

            $clasifs = (clone $baseQ)
                ->select('clasificacion', DB::raw('count(*) as total'))
                ->whereNotNull('clasificacion')
                ->groupBy('clasificacion')
                ->orderBy('total', 'desc')
                ->get()
                ->map(function ($c) {
                    return ['clasificacion' => $c->clasificacion, 'total' => $c->total];
                })
                ->toArray();

            $estudiantesUnicos = (clone $baseQ)
                ->distinct('nombre_estudiante')
                ->count('nombre_estudiante');

            $detalleFormadores[] = [
                'nombre'            => $nombre,
                'total'             => $total,
                'completadas'       => $completadas,
                'programadas'       => $programadas,
                'canceladas'        => $canceladas,
                'asistencias'       => $asistencias,
                'faltas'            => $faltas,
                'tasaAsistencia'    => $tasaAsis,
                'estudiantesUnicos' => $estudiantesUnicos,
                'clasificaciones'   => $clasifs,
            ];
        }

        usort($detalleFormadores, fn($a, $b) => $b['total'] <=> $a['total']);

        // ============================================================
        // TABLA DE CITAS
        // ============================================================
        if ($mes || $semana || $anio || $aplicarFiltroGradoGrupo) {
            $citasDelPeriodo = $buildCitasQuery()
                ->orderBy('fecha', 'desc')
                ->orderBy('hora', 'desc')
                ->get();
        } else {
            $citasDelPeriodo = DB::table('citas')
                ->where('fecha', '>=', now()->toDateString())
                ->where('fecha', '<=', now()->addDays(7)->toDateString())
                ->where('estado', 'programada')
                ->orderBy('fecha')->orderBy('hora')
                ->limit(10)->get();
        }

        $aniosDisponibles = DB::table('citas')
            ->select(DB::raw('DISTINCT YEAR(fecha) as anio'))
            ->orderBy('anio', 'desc')
            ->pluck('anio')->toArray();

        return inertia('Panel/Indicadores', [
            'totalFormadores'          => $totalFormadores,
            'totalEstudiantes'         => $totalEstudiantes,
            'totalCitas'               => $totalCitas,
            'promedioCitasPorFormador' => $totalFormadores > 0 ? round($totalCitas / $totalFormadores, 1) : 0,
            'estudiantesAtendidos'     => $estudiantesAtendidos,
            'tasaCompletacion'         => $tasaCompletacion,
            'tasaCancelacion'          => $tasaCancelacion,
            'tasaAsistencia'           => $tasaAsistencia,
            'estudiantesAgrupados'     => $estudiantesAgrupados,
            'gradosActivos'            => $gradosActivos,
            'gruposActivos'            => $gruposActivos,
            'gruposPorGrado'           => $gruposPorGrado,
            'citasPorEstado'           => $citasPorEstado,
            'citasPorClasificacion'    => $citasPorClasificacion,
            'citasPorAsistencia'       => $citasPorAsistencia,
            'citasPorHora'             => $citasPorHora,
            'formadoresTop'            => $formadoresTop,
            'estudiantesTop'           => $estudiantesTop,
            'detalleFormadores'        => $detalleFormadores,
            'citasPorMes'              => $citasPorMes,
            'citasPorDiaSemana'        => $citasPorDiaSemana,
            'comparativaSemana' => [
                'mostrar'       => $mostrarCompSemana,
                'titulo'        => $tituloCompSemana,
                'labelActual'   => $labelSemActual,
                'labelAnterior' => $labelSemAnterior,
                'actual'        => $citasSemanaActual,
                'anterior'      => $citasSemanaAnterior,
                'diff'          => $diffSemana,
                'pct'           => $pctSemana,
            ],
            'comparativaMes' => [
                'mostrar'       => $mostrarCompMes,
                'titulo'        => $tituloCompMes,
                'labelActual'   => $labelMesActual,
                'labelAnterior' => $labelMesAnterior,
                'actual'        => $citasMesActual,
                'anterior'      => $citasMesAnterior,
                'diff'          => $diffMes,
                'pct'           => $pctMes,
            ],
            'citasDelPeriodo'  => $citasDelPeriodo,
            'user'             => $user,
            'filtroAnio'       => $anio,
            'filtroMes'        => $mes,
            'filtroSemana'     => $semana,
            'filtroGrado'      => $grado,
            'filtroGrupo'      => $grupo,
            'aniosDisponibles' => $aniosDisponibles,
        ]);
    }
}