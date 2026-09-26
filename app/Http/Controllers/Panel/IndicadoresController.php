<?php
// app/Http/Controllers/Panel/IndicadoresController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use App\Services\CacheInvalidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
        // CACHÉ: 2 min por combinación de filtros
        // ============================================================
        $cacheKey = CacheInvalidator::indicadoresKey([
            'anio' => $anio, 'mes' => $mes, 'semana' => $semana, 'grado' => $grado, 'grupo' => $grupo,
        ]);

        $payload = Cache::remember($cacheKey, now()->addMinutes(2), function () use ($anio, $mes, $semana, $grado, $grupo) {

            // ========================================================
            // FILTRO DE FECHA PRINCIPAL
            // ========================================================
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

            // ========================================================
            // FILTRO GRADO/GRUPO
            // ========================================================
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

            // ========================================================
            // CATÁLOGOS (10 min de cache)
            // ========================================================
            $gradosActivos = Cache::remember('catalogos.grados', 600, function () {
                return DB::table('estudiantes')
                    ->select('grado')->distinct()->orderBy('grado')
                    ->pluck('grado')->toArray();
            });

            $gruposPorGrado = Cache::remember('catalogos.gruposPorGrado', 600, function () use ($gradosActivos) {
                $out = [];
                foreach ($gradosActivos as $g) {
                    $out[$g] = DB::table('estudiantes')
                        ->where('grado', $g)
                        ->select('grupo')->distinct()->orderBy('grupo')
                        ->pluck('grupo')->toArray();
                }
                return $out;
            });

            $gruposActivos = Cache::remember('catalogos.grupos', 600, function () {
                return DB::table('estudiantes')
                    ->select('grupo')->distinct()->orderBy('grupo')
                    ->pluck('grupo')->toArray();
            });

            $aniosDisponibles = Cache::remember('catalogos.anios', 600, function () {
                return DB::table('citas')
                    ->select(DB::raw('DISTINCT YEAR(fecha) as anio'))
                    ->orderByDesc('anio')
                    ->pluck('anio')->toArray();
            });

            // ========================================================
            // DISTRIBUCIONES
            // ========================================================
            $citasPorEstado = $buildCitasQuery()
                ->select('estado', DB::raw('COUNT(*) as total'))
                ->groupBy('estado')
                ->pluck('total', 'estado')
                ->toArray();

            $citasPorClasificacion = $buildCitasQuery()
                ->select('clasificacion', DB::raw('COUNT(*) as total'))
                ->whereNotNull('clasificacion')
                ->groupBy('clasificacion')
                ->orderByDesc('total')
                ->pluck('total', 'clasificacion')
                ->toArray();

            $citasPorAsistencia = $buildCitasQuery()
                ->select('asistencia', DB::raw('COUNT(*) as total'))
                ->groupBy('asistencia')
                ->pluck('total', 'asistencia')
                ->toArray();

            $citasPorHora = $buildCitasQuery()
                ->select(DB::raw('HOUR(hora) as hora'), DB::raw('COUNT(*) as total'))
                ->groupBy('hora')
                ->orderBy('hora')
                ->get()
                ->mapWithKeys(function ($item) {
                    $h = str_pad($item->hora, 2, '0', STR_PAD_LEFT) . ':00';
                    return [$h => $item->total];
                })
                ->toArray();

            $citasPorMes = $buildCitasQuery()
                ->select(DB::raw("DATE_FORMAT(fecha, '%Y-%m') as mes"), DB::raw('COUNT(*) as total'))
                ->groupBy('mes')
                ->orderBy('mes')
                ->get();

            $citasPorDiaSemana = $buildCitasQuery()
                ->select(DB::raw('DAYNAME(fecha) as dia'), DB::raw('COUNT(*) as total'))
                ->groupBy('dia')
                ->orderByRaw("FIELD(dia, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')")
                ->get()
                ->mapWithKeys(function ($item) {
                    $dias = [
                        'Monday'=>'Lunes','Tuesday'=>'Martes','Wednesday'=>'Miércoles',
                        'Thursday'=>'Jueves','Friday'=>'Viernes','Saturday'=>'Sábado','Sunday'=>'Domingo'
                    ];
                    return [$dias[$item->dia] ?? $item->dia => $item->total];
                })
                ->toArray();

            // ========================================================
            // KPIs derivados
            // ========================================================
            $totalCitas  = array_sum($citasPorEstado);
            $completadas = $citasPorEstado['completada'] ?? 0;
            $programadas = $citasPorEstado['programada'] ?? 0;
            $canceladas  = ($citasPorEstado['cancelada'] ?? 0) + ($citasPorEstado['cancelada_liberada'] ?? 0);

            $tasaCompletacion = $totalCitas > 0 ? round(($completadas / $totalCitas) * 100, 1) : 0;
            $tasaCancelacion  = $totalCitas > 0 ? round(($canceladas  / $totalCitas) * 100, 1) : 0;

            $asistio      = $citasPorAsistencia['asistió'] ?? 0;
            $noAsistio    = $citasPorAsistencia['no asistió'] ?? 0;
            $totalConAsis = $asistio + $noAsistio;
            $tasaAsistencia = $totalConAsis > 0 ? round(($asistio / $totalConAsis) * 100, 1) : 0;

            $estudiantesAtendidos = $buildCitasQuery()
                ->distinct('nombre_estudiante')
                ->count('nombre_estudiante');

            $totalFormadores = DB::table('usuarios')->where('rol', 'Formador')->where('activo', 1)->count();

            $qTotalEst = DB::table('estudiantes');
            if ($grado) $qTotalEst->where('grado', $grado);
            if ($grupo) $qTotalEst->where('grupo', $grupo);
            $totalEstudiantes = $qTotalEst->count();

            // ========================================================
            // ESTUDIANTES AGRUPADOS
            // ========================================================
            $qEstAgrupados = DB::table('estudiantes')
                ->select('id_estudiante', 'nombre', 'grado', 'grupo');
            if ($grado) $qEstAgrupados->where('grado', $grado);
            if ($grupo) $qEstAgrupados->where('grupo', $grupo);

            $estudiantesAgrupados = $qEstAgrupados
                ->orderBy('grado')->orderBy('grupo')->orderBy('nombre')
                ->get()
                ->groupBy('grado')
                ->map(function ($grupoGrado) {
                    return $grupoGrado->groupBy('grupo')->map(function ($alumnos, $grupo) {
                        return [
                            'grupo'   => $grupo,
                            'total'   => $alumnos->count(),
                            'alumnos' => $alumnos->map(fn($a) => [
                                'id_estudiante' => $a->id_estudiante,
                                'nombre'        => $a->nombre,
                            ])->values()->toArray(),
                        ];
                    })->values()->toArray();
                })
                ->toArray();

            // ========================================================
            // DESTACADOS
            // ========================================================
            $formadoresTop = $buildCitasQuery()
                ->select('nombre_formador as nombre', DB::raw('COUNT(*) as total'))
                ->whereNotNull('nombre_formador')
                ->groupBy('nombre_formador')
                ->orderByDesc('total')
                ->limit(5)
                ->get();

            $estudiantesTop = $buildCitasQuery()
                ->select('nombre_estudiante', DB::raw('COUNT(*) as total'))
                ->groupBy('nombre_estudiante')
                ->orderByDesc('total')
                ->limit(5)
                ->get();

            // ========================================================
            // DETALLE POR FORMADOR
            // ========================================================
            $detalleFormadoresRaw = $buildCitasQuery()
                ->select(
                    'nombre_formador as nombre',
                    DB::raw('COUNT(*) as total'),
                    DB::raw("SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas"),
                    DB::raw("SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as programadas"),
                    DB::raw("SUM(CASE WHEN estado IN ('cancelada','cancelada_liberada') THEN 1 ELSE 0 END) as canceladas"),
                    DB::raw("SUM(CASE WHEN asistencia = 'asistió' THEN 1 ELSE 0 END) as asistencias"),
                    DB::raw("SUM(CASE WHEN asistencia = 'no asistió' THEN 1 ELSE 0 END) as faltas"),
                    DB::raw('COUNT(DISTINCT nombre_estudiante) as estudiantesUnicos')
                )
                ->whereNotNull('nombre_formador')
                ->groupBy('nombre_formador')
                ->orderByDesc('total')
                ->get();

            $clasifsPorFormador = $buildCitasQuery()
                ->select('nombre_formador', 'clasificacion', DB::raw('COUNT(*) as total'))
                ->whereNotNull('nombre_formador')
                ->whereNotNull('clasificacion')
                ->groupBy('nombre_formador', 'clasificacion')
                ->orderByDesc('total')
                ->get()
                ->groupBy('nombre_formador');

            $detalleFormadores = $detalleFormadoresRaw->map(function ($f) use ($clasifsPorFormador) {
                $clasifs = $clasifsPorFormador->get($f->nombre, collect())
                    ->map(fn($c) => ['clasificacion' => $c->clasificacion, 'total' => (int) $c->total])
                    ->values()
                    ->toArray();

                $totalAsis = (int) $f->asistencias + (int) $f->faltas;

                return [
                    'nombre'            => $f->nombre,
                    'total'             => (int) $f->total,
                    'completadas'       => (int) $f->completadas,
                    'programadas'       => (int) $f->programadas,
                    'canceladas'        => (int) $f->canceladas,
                    'asistencias'       => (int) $f->asistencias,
                    'faltas'            => (int) $f->faltas,
                    'tasaAsistencia'    => $totalAsis > 0 ? round(($f->asistencias / $totalAsis) * 100, 1) : 0,
                    'estudiantesUnicos' => (int) $f->estudiantesUnicos,
                    'clasificaciones'   => $clasifs,
                ];
            })->toArray();

            // ========================================================
            // COMPARATIVAS
            // ========================================================
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

            // ========================================================
            // TABLA DE CITAS
            // ========================================================
            if ($mes || $semana || $anio || $aplicarFiltroGradoGrupo) {
                $citasDelPeriodo = $buildCitasQuery()
                    ->orderByDesc('fecha')
                    ->orderByDesc('hora')
                    ->orderByDesc('id_cita')
                    ->get();
            } else {
                $citasDelPeriodo = DB::table('citas')
                    ->where('fecha', '>=', now()->toDateString())
                    ->where('fecha', '<=', now()->addDays(7)->toDateString())
                    ->where('estado', 'programada')
                    ->orderBy('fecha')->orderBy('hora')
                    ->limit(10)->get();
            }

            // Nota: `user` NO va aquí porque depende de la sesión de cada usuario.
            return [
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
                'filtroAnio'       => $anio,
                'filtroMes'        => $mes,
                'filtroSemana'     => $semana,
                'filtroGrado'      => $grado,
                'filtroGrupo'      => $grupo,
                'aniosDisponibles' => $aniosDisponibles,
            ];
        });

        $payload['user'] = $user;

        return inertia('Panel/Indicadores', $payload);
    }
}