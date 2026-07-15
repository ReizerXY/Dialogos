<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class MetricasController extends Controller
{
    public function index(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        // Filtros
        $mes = $request->get('mes'); // formato YYYY-MM
        $semana = $request->get('semana'); // formato YYYY-WW
        $fechaInicio = $request->get('fecha_inicio');
        $fechaFin = $request->get('fecha_fin');

        // Determinar rango de fechas
        $whereRaw = '';
        $bindings = [];

        if ($mes) {
            $whereRaw = "YEAR(fecha) = ? AND MONTH(fecha) = ?";
            $parts = explode('-', $mes);
            $bindings = [$parts[0], $parts[1]];
        } elseif ($semana) {
            // Obtener lunes y domingo de la semana (formato YYYY-WW)
            $year = substr($semana, 0, 4);
            $week = substr($semana, 6, 2);
            $fechaLunes = (new \DateTime())->setISODate($year, $week)->format('Y-m-d');
            $fechaDomingo = (new \DateTime())->setISODate($year, $week, 7)->format('Y-m-d');
            $whereRaw = "fecha BETWEEN ? AND ?";
            $bindings = [$fechaLunes, $fechaDomingo];
        } elseif ($fechaInicio && $fechaFin) {
            $whereRaw = "fecha BETWEEN ? AND ?";
            $bindings = [$fechaInicio, $fechaFin];
        } else {
            // Por defecto: mes actual
            $mesActual = now()->format('Y-m');
            $parts = explode('-', $mesActual);
            $whereRaw = "YEAR(fecha) = ? AND MONTH(fecha) = ?";
            $bindings = [$parts[0], $parts[1]];
        }

        // ==========================================
        // 1. DATOS GENERALES (filtrados)
        // ==========================================
        $totalCitas = DB::table('citas')
            ->whereRaw($whereRaw, $bindings)
            ->count();

        $totalFormadores = DB::table('usuarios')->where('rol', 'Formador')->count();

        $totalEstudiantes = DB::table('estudiantes')->count();

        // ==========================================
        // 2. ESTUDIANTES POR GRADO Y GRUPO
        // ==========================================
        $estudiantesPorGrado = DB::table('estudiantes')
            ->select('grado', DB::raw('count(*) as total'))
            ->groupBy('grado')
            ->orderBy('grado')
            ->get();

        $estudiantesPorGrupo = DB::table('estudiantes')
            ->select('grupo', DB::raw('count(*) as total'))
            ->groupBy('grupo')
            ->orderBy('grupo')
            ->get();

        // ==========================================
        // 3. CITAS POR ESTADO (filtradas)
        // ==========================================
        $citasPorEstado = DB::table('citas')
            ->select('estado', DB::raw('count(*) as total'))
            ->whereRaw($whereRaw, $bindings)
            ->groupBy('estado')
            ->pluck('total', 'estado')
            ->toArray();

        // ==========================================
        // 4. CITAS POR CLASIFICACIÓN
        // ==========================================
        $citasPorClasificacion = DB::table('citas')
            ->select('clasificacion', DB::raw('count(*) as total'))
            ->whereRaw($whereRaw, $bindings)
            ->whereNotNull('clasificacion')
            ->groupBy('clasificacion')
            ->pluck('total', 'clasificacion')
            ->toArray();

        // ==========================================
        // 5. CITAS POR ASISTENCIA
        // ==========================================
        $citasPorAsistencia = DB::table('citas')
            ->select('asistencia', DB::raw('count(*) as total'))
            ->whereRaw($whereRaw, $bindings)
            ->groupBy('asistencia')
            ->pluck('total', 'asistencia')
            ->toArray();

        // ==========================================
        // 6. FORMADORES TOP (filtrados)
        // ==========================================
        $formadoresTop = DB::table('citas')
            ->join('usuarios', 'citas.usuario_id', '=', 'usuarios.id')
            ->select('usuarios.nombre', DB::raw('count(*) as total'))
            ->whereRaw($whereRaw, $bindings)
            ->groupBy('usuarios.nombre')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        // ==========================================
        // 7. PROMEDIO CITAS POR FORMADOR
        // ==========================================
        $totalCitasParaPromedio = $totalCitas; // ya filtrado
        $promedioCitasPorFormador = $totalFormadores > 0
            ? round($totalCitasParaPromedio / $totalFormadores, 1)
            : 0;

        // ==========================================
        // 8. CITAS POR MES (últimos 6 meses, sin filtrar)
        // ==========================================
        $citasPorMes = DB::table('citas')
            ->select(DB::raw("DATE_FORMAT(fecha, '%Y-%m') as mes"), DB::raw('count(*) as total'))
            ->where('fecha', '>=', now()->subMonths(5)->startOfMonth()->toDateString())
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        // ==========================================
        // 9. CITAS DE LA SEMANA ACTUAL VS ANTERIOR (filtrado)
        // ==========================================
        $semanaActual = now()->startOfWeek()->toDateString();
        $semanaAnterior = now()->subWeek()->startOfWeek()->toDateString();

        $citasSemanaActual = DB::table('citas')
            ->whereBetween('fecha', [$semanaActual, now()->endOfWeek()->toDateString()])
            ->count();

        $citasSemanaAnterior = DB::table('citas')
            ->whereBetween('fecha', [$semanaAnterior, now()->subWeek()->endOfWeek()->toDateString()])
            ->count();

        // ==========================================
        // 10. PRÓXIMAS CITAS (7 días, solo programadas, sin filtro de mes)
        // ==========================================
        $proximasCitas = DB::table('citas')
            ->join('usuarios', 'citas.usuario_id', '=', 'usuarios.id')
            ->select('citas.*', 'usuarios.nombre as nombre_formador')
            ->where('citas.fecha', '>=', now()->toDateString())
            ->where('citas.fecha', '<=', now()->addDays(7)->toDateString())
            ->where('citas.estado', 'programada')
            ->orderBy('citas.fecha')
            ->orderBy('citas.hora')
            ->limit(10)
            ->get();

        // ==========================================
        // 11. ESTUDIANTES TOP (filtrados)
        // ==========================================
        $estudiantesTop = DB::table('citas')
            ->select('nombre_estudiante', DB::raw('count(*) as total'))
            ->whereRaw($whereRaw, $bindings)
            ->groupBy('nombre_estudiante')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        // ==========================================
        // 12. CITAS POR DÍA DE LA SEMANA (filtradas)
        // ==========================================
        $citasPorDiaSemana = DB::table('citas')
            ->select(DB::raw('DAYNAME(fecha) as dia'), DB::raw('count(*) as total'))
            ->whereRaw($whereRaw, $bindings)
            ->groupBy('dia')
            ->orderByRaw("FIELD(dia, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")
            ->get()
            ->mapWithKeys(function ($item) {
                $diasEspañol = [
                    'Monday' => 'Lunes',
                    'Tuesday' => 'Martes',
                    'Wednesday' => 'Miércoles',
                    'Thursday' => 'Jueves',
                    'Friday' => 'Viernes',
                    'Saturday' => 'Sábado',
                    'Sunday' => 'Domingo'
                ];
                return [$diasEspañol[$item->dia] ?? $item->dia => $item->total];
            })
            ->toArray();

        return inertia('Panel/Metricas', [
            'totalFormadores' => $totalFormadores,
            'totalEstudiantes' => $totalEstudiantes,
            'totalCitas' => $totalCitas,
            'estudiantesPorGrado' => $estudiantesPorGrado,
            'estudiantesPorGrupo' => $estudiantesPorGrupo,
            'citasPorEstado' => $citasPorEstado,
            'citasPorClasificacion' => $citasPorClasificacion,
            'citasPorAsistencia' => $citasPorAsistencia,
            'formadoresTop' => $formadoresTop,
            'promedioCitasPorFormador' => $promedioCitasPorFormador,
            'citasPorMes' => $citasPorMes,
            'citasSemanaActual' => $citasSemanaActual,
            'citasSemanaAnterior' => $citasSemanaAnterior,
            'proximasCitas' => $proximasCitas,
            'estudiantesTop' => $estudiantesTop,
            'citasPorDiaSemana' => $citasPorDiaSemana,
            'user' => $user,
            // Parámetros de filtro para la vista
            'filtroMes' => $mes,
            'filtroSemana' => $semana,
        ]);
    }
}