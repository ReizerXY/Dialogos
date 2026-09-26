<?php
// app/Http/Controllers/Panel/CitasController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use App\Exports\CitasExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Services\WhatsAppService;
use App\Services\CacheInvalidator;

class CitasController extends Controller
{
    public function index(Request $request)
    {
        $user = Session::get('user');
        $rol = $user['rol'];
        $usuarioId = $user['id_usuario'];

        $verTodas = ($rol === 'Formador') && ($request->get('todas') == 1);
        $soloLectura = $verTodas;

        $filtroFormador = $request->get('formador');
        $filtroEstado   = $request->get('estado');
        $filtroFecha    = $request->get('fecha');
        $periodo        = $request->get('semana', 'actual');
        $filtroAnio     = $request->get('anio');
        $filtroMes      = $request->get('mes');
        $semanaValor    = $request->get('semana_valor');
        $filtroGrado    = $request->get('grado');
        $filtroGrupo    = $request->get('grupo');

        $query = DB::table('citas')->select('citas.*');

        if ($rol == 'Formador' && !$verTodas) {
            $query->where('citas.id_usuario', $usuarioId);
        } else {
            if ($filtroFormador) {
                $query->where('citas.id_usuario', $filtroFormador);
            }
        }

        if ($filtroEstado) {
            $query->where('citas.estado', $filtroEstado);
        }

        if ($filtroGrado || $filtroGrupo) {
            $qEst = DB::table('estudiantes')->select('id_estudiante');
            if ($filtroGrado) $qEst->where('grado', $filtroGrado);
            if ($filtroGrupo) $qEst->where('grupo', $filtroGrupo);
            $idsEstudiantes = $qEst->pluck('id_estudiante')->toArray();
            $query->whereIn('citas.id_estudiante', $idsEstudiantes ?: [0]);
        }

        if ($semanaValor) {
            $year = substr($semanaValor, 0, 4);
            $week = substr($semanaValor, 6, 2);
            $fechaLunes   = (new \DateTime())->setISODate($year, $week, 1)->format('Y-m-d');
            $fechaDomingo = (new \DateTime())->setISODate($year, $week, 7)->format('Y-m-d');
            $query->whereBetween('citas.fecha', [$fechaLunes, $fechaDomingo]);
        } elseif ($filtroFecha) {
            $query->whereDate('citas.fecha', $filtroFecha);
        } elseif ($filtroMes) {
            $parts = explode('-', $filtroMes);
            $query->whereYear('citas.fecha', (int) $parts[0])
                  ->whereMonth('citas.fecha', (int) $parts[1]);
        } elseif ($filtroAnio) {
            $query->whereYear('citas.fecha', (int) $filtroAnio);
        } elseif ($periodo === 'actual') {
            $query->where('citas.fecha', '>=', now()->toDateString())
                  ->where('citas.fecha', '<=', now()->addDays(7)->toDateString());
        }

        $citas = $query->orderBy('citas.fecha', 'asc')
                       ->orderBy('citas.hora', 'asc')
                       ->orderBy('citas.id_cita', 'asc')
                       ->get();

        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->where('activo', 1)
            ->select('id_usuario', 'nombre')
            ->get();

        $aniosDisponibles = DB::table('citas')
            ->select(DB::raw('DISTINCT YEAR(fecha) as anio'))
            ->orderBy('anio', 'desc')
            ->pluck('anio')
            ->toArray();

        $gradosActivos = DB::table('estudiantes')
            ->select('grado')->distinct()->orderBy('grado')
            ->pluck('grado')->toArray();

        $gruposPorGrado = [];
        foreach ($gradosActivos as $g) {
            $gruposPorGrado[$g] = DB::table('estudiantes')
                ->where('grado', $g)
                ->select('grupo')->distinct()->orderBy('grupo')
                ->pluck('grupo')->toArray();
        }

        return inertia('Panel/Citas', [
            'citas'            => $citas,
            'formadores'       => $formadores,
            'aniosDisponibles' => $aniosDisponibles,
            'gradosActivos'    => $gradosActivos,
            'gruposPorGrado'   => $gruposPorGrado,
            'filtros'          => [
                'formador'     => $filtroFormador,
                'estado'       => $filtroEstado,
                'fecha'        => $filtroFecha,
                'semana'       => $periodo,
                'anio'         => $filtroAnio,
                'mes'          => $filtroMes,
                'semana_valor' => $semanaValor,
                'grado'        => $filtroGrado,
                'grupo'        => $filtroGrupo,
            ],
            'rol'         => $rol,
            'soloLectura' => $soloLectura,
            'user'        => $user,
        ]);
    }

    public function exportarExcel(Request $request)
    {
        $user = Session::get('user');
        if (($user['rol'] ?? '') !== 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        $ids = $request->get('ids', []);
        if (!is_array($ids)) {
            $ids = [$ids];
        }
        $ids = array_values(array_filter(array_map('intval', $ids)));

        $orden = $request->get('orden', 'fecha');

        $query = DB::table('citas')->select('citas.*');

        if (!empty($ids)) {
            $query->whereIn('citas.id_cita', $ids);
        } else {
            $filtroFormador = $request->get('formador');
            $filtroEstado   = $request->get('estado');
            $filtroFecha    = $request->get('fecha');
            $periodo        = $request->get('semana', 'actual');
            $filtroAnio     = $request->get('anio');
            $filtroMes      = $request->get('mes');
            $semanaValor    = $request->get('semana_valor');
            $filtroGrado    = $request->get('grado');
            $filtroGrupo    = $request->get('grupo');

            if ($filtroFormador) $query->where('citas.id_usuario', $filtroFormador);
            if ($filtroEstado)   $query->where('citas.estado', $filtroEstado);

            if ($filtroGrado || $filtroGrupo) {
                $qEst = DB::table('estudiantes')->select('id_estudiante');
                if ($filtroGrado) $qEst->where('grado', $filtroGrado);
                if ($filtroGrupo) $qEst->where('grupo', $filtroGrupo);
                $idsEst = $qEst->pluck('id_estudiante')->toArray();
                $query->whereIn('citas.id_estudiante', $idsEst ?: [0]);
            }

            if ($semanaValor) {
                $year = substr($semanaValor, 0, 4);
                $week = substr($semanaValor, 6, 2);
                $lun = (new \DateTime())->setISODate($year, $week, 1)->format('Y-m-d');
                $dom = (new \DateTime())->setISODate($year, $week, 7)->format('Y-m-d');
                $query->whereBetween('citas.fecha', [$lun, $dom]);
            } elseif ($filtroFecha) {
                $query->whereDate('citas.fecha', $filtroFecha);
            } elseif ($filtroMes) {
                $parts = explode('-', $filtroMes);
                $query->whereYear('citas.fecha', (int) $parts[0])
                      ->whereMonth('citas.fecha', (int) $parts[1]);
            } elseif ($filtroAnio) {
                $query->whereYear('citas.fecha', (int) $filtroAnio);
            } elseif ($periodo === 'actual') {
                $query->where('citas.fecha', '>=', now()->toDateString())
                      ->where('citas.fecha', '<=', now()->addDays(7)->toDateString());
            }
        }

        if ($orden === 'id') {
            $query->orderBy('citas.id_cita', 'asc');
        } else {
            $query->orderBy('citas.fecha', 'asc')
                  ->orderBy('citas.hora', 'asc')
                  ->orderBy('citas.id_cita', 'asc');
        }

        $citas = $query->get();

        $nombreArchivo = 'Citas_Anahuac_' . now()->format('Y-m-d_H-i') . '.xlsx';

        return Excel::download(new CitasExport($citas), $nombreArchivo);
    }

    public function show($id)
    {
        $user = Session::get('user');

        if ($user['rol'] != 'Formador') {
            abort(403, 'Solo los formadores pueden gestionar citas.');
        }

        $cita = DB::table('citas')->where('id_cita', $id)->first();

        if (!$cita) {
            abort(404, 'Cita no encontrada.');
        }

        if ($cita->id_usuario != $user['id_usuario']) {
            abort(403, 'No tienes permiso para gestionar esta cita.');
        }

        return inertia('Panel/GestionCita', [
            'cita' => $cita,
            'user' => $user,
        ]);
    }

    public function actualizarNotas(Request $request, $id)
    {
        try {
            $user = Session::get('user');
            $cita = DB::table('citas')->where('id_cita', $id)->first();

            if (!$cita) {
                return response()->json(['error' => 'Cita no encontrada'], 404);
            }

            if ($user['rol'] == 'Formador' && $cita->id_usuario != $user['id_usuario']) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            $validated = $request->validate([
                'clasificacion' => 'nullable|in:académica,familiar,emocional,espiritual,institucional',
                'notas'         => 'nullable|string|max:500',
                'asistencia'    => 'nullable|in:pendiente,asistió,no asistió',
                'estado'        => 'nullable|in:programada,cancelada,completada,cancelada_liberada',
            ]);

            $asistencia = $validated['asistencia'] ?? 'pendiente';
            $nuevoEstado = $this->calcularEstadoNotas($cita, $asistencia);

            Log::info('Actualizando notas de cita', [
                'id_cita'         => $id,
                'estado_anterior' => $cita->estado,
                'estado_nuevo'    => $nuevoEstado,
                'asistencia'      => $asistencia,
            ]);

            DB::table('citas')
                ->where('id_cita', $id)
                ->update([
                    'clasificacion' => $validated['clasificacion'] ?? null,
                    'notas'         => $validated['notas'] ?? null,
                    'asistencia'    => $asistencia,
                    'estado'        => $nuevoEstado,
                ]);

            CacheInvalidator::indicadores();

            return response()->json([
                'success' => true,
                'message' => 'Notas actualizadas correctamente.',
                'estado'  => $nuevoEstado,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error al actualizar notas:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error en el servidor: ' . $e->getMessage()], 500);
        }
    }

    private function calcularEstadoNotas($cita, $asistencia)
    {
        if (in_array($cita->estado, ['cancelada', 'cancelada_liberada'], true)) {
            return $cita->estado;
        }

        $hora = $cita->hora ? substr($cita->hora, 0, 8) : '00:00:00';
        $fechaHoraCita = Carbon::parse($cita->fecha . ' ' . $hora);
        $yaPaso = $fechaHoraCita->isPast();

        $asistenciaRegistrada = in_array($asistencia, ['asistió', 'no asistió'], true);

        if ($yaPaso || $asistenciaRegistrada) {
            return 'completada';
        }

        return 'programada';
    }

    public function modificarCita(Request $request, $id)
    {
        try {
            $user = Session::get('user');
            $cita = DB::table('citas')->where('id_cita', $id)->first();

            if (!$cita) {
                return response()->json(['error' => 'Cita no encontrada'], 404);
            }

            if ($user['rol'] == 'Formador' && $cita->id_usuario != $user['id_usuario']) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            $validated = $request->validate([
                'fecha' => 'required|date',
                'hora'  => 'required|date_format:H:i',
            ]);

            $horaConSegundos = $validated['hora'] . ':00';

            $existe = DB::table('citas')
                ->where('id_usuario', $cita->id_usuario)
                ->where('fecha', $validated['fecha'])
                ->where('hora', $horaConSegundos)
                ->where('id_cita', '!=', $id)
                ->whereIn('estado', ['programada', 'completada', 'cancelada'])
                ->exists();

            if ($existe) {
                return response()->json(['error' => 'Ya existe una cita en esa fecha y hora.'], 422);
            }

            DB::table('citas')
                ->where('id_cita', $id)
                ->update([
                    'fecha' => $validated['fecha'],
                    'hora'  => $horaConSegundos,
                ]);

            try {
                $citaActualizada = DB::table('citas')->where('id_cita', $id)->first();
                $whatsapp = new WhatsAppService();
                $whatsapp->sendModification($citaActualizada);
            } catch (\Exception $e) {
                Log::warning('Error al enviar WhatsApp de modificación: ' . $e->getMessage());
            }

            CacheInvalidator::indicadores();

            return response()->json(['success' => true, 'message' => 'Cita modificada correctamente.']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al modificar: ' . $e->getMessage()], 500);
        }
    }

    public function cancelarCita(Request $request, $id)
    {
        try {
            $user = Session::get('user');
            $cita = DB::table('citas')->where('id_cita', $id)->first();

            if (!$cita) {
                return response()->json(['error' => 'Cita no encontrada'], 404);
            }

            if ($user['rol'] == 'Formador' && $cita->id_usuario != $user['id_usuario']) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            if (in_array($cita->estado, ['cancelada', 'cancelada_liberada'])) {
                return response()->json(['error' => 'La cita ya está cancelada.'], 422);
            }

            $notaCancelacion = trim((string) $request->get('nota_cancelacion', ''));
            $liberarHorario  = (int) $request->get('liberar_horario', 1) === 1;

            $nuevoEstado = $liberarHorario ? 'cancelada_liberada' : 'cancelada';

            $notaFinal = $cita->notas;
            if ($notaCancelacion !== '') {
                $notaFinal = $cita->notas
                    ? $cita->notas . "\n\n" . $notaCancelacion
                    : $notaCancelacion;
            }

            DB::table('citas')
                ->where('id_cita', $id)
                ->update([
                    'estado' => $nuevoEstado,
                    'notas'  => $notaFinal,
                ]);

            try {
                $citaActualizada = DB::table('citas')->where('id_cita', $id)->first();
                $whatsapp = new WhatsAppService();
                $whatsapp->sendCancellation($citaActualizada);
            } catch (\Exception $e) {
                Log::warning('Error al enviar WhatsApp de cancelación: ' . $e->getMessage());
            }

            CacheInvalidator::indicadores();

            return response()->json([
                'success' => true,
                'message' => $liberarHorario
                    ? 'Cita cancelada. El horario quedó disponible.'
                    : 'Cita cancelada. El horario quedó bloqueado.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cancelar cita:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error al cancelar: ' . $e->getMessage()], 500);
        }
    }

    public function disponibilidadParaModificar(Request $request)
    {
        $usuarioId = $request->get('usuario_id');
        $fecha = $request->get('fecha');
        $citaId = $request->get('cita_id');

        if (!$usuarioId || !$fecha) {
            return response()->json([]);
        }

        $diaSemana = strtolower(now()->parse($fecha)->locale('es')->dayName);

        $horarios = DB::table('horarios')
            ->where('id_usuario', $usuarioId)
            ->where('dia_semana', $diaSemana)
            ->pluck('hora_inicio')
            ->toArray();

        $citasOcupadas = DB::table('citas')
            ->where('id_usuario', $usuarioId)
            ->where('fecha', $fecha)
            ->whereIn('estado', ['programada', 'completada', 'cancelada'])
            ->when($citaId, function ($query, $citaId) {
                return $query->where('id_cita', '!=', $citaId);
            })
            ->pluck('hora')
            ->map(function ($hora) {
                return substr($hora, 0, 5);
            })
            ->toArray();

        $horasDisponibles = array_diff($horarios, $citasOcupadas);

        return response()->json(array_values($horasDisponibles));
    }

    public function update(Request $request, $id)
    {
        $user = Session::get('user');
        $cita = DB::table('citas')->where('id_cita', $id)->first();

        if (!$cita) {
            abort(404);
        }

        if ($user['rol'] == 'Formador' && $cita->id_usuario != $user['id_usuario']) {
            abort(403);
        }

        $validated = $request->validate([
            'clasificacion' => 'nullable|in:académica,familiar,emocional,espiritual,institucional',
            'notas'         => 'nullable|string',
            'asistencia'    => 'nullable|in:pendiente,asistió,no asistió',
            'estado'        => 'required|in:programada,cancelada,completada,cancelada_liberada',
        ]);

        $estadoAnterior = $cita->estado;

        DB::table('citas')
            ->where('id_cita', $id)
            ->update([
                'clasificacion' => $validated['clasificacion'] ?? null,
                'notas'         => $validated['notas'] ?? null,
                'asistencia'    => $validated['asistencia'] ?? 'pendiente',
                'estado'        => $validated['estado'],
            ]);

        if (
            $estadoAnterior !== $validated['estado'] &&
            in_array($validated['estado'], ['cancelada', 'cancelada_liberada'])
        ) {
            try {
                $citaActualizada = DB::table('citas')->where('id_cita', $id)->first();
                $whatsapp = new WhatsAppService();
                $whatsapp->sendCancellation($citaActualizada);
            } catch (\Exception $e) {
                Log::warning('Error al enviar WhatsApp de cancelación: ' . $e->getMessage());
            }
        }

        CacheInvalidator::indicadores();

        return redirect()->route('citas.index')->with('success', 'Cita actualizada exitosamente.');
    }

    public function historial(Request $request)
    {
        $query = $request->get('query', '');
        $citas = [];

        if (strlen($query) >= 1) {
            $citas = DB::table('citas')
                ->where('citas.nombre_estudiante', 'LIKE', "%$query%")
                ->orderBy('citas.fecha', 'desc')
                ->orderBy('citas.hora', 'desc')
                ->get();
        }

        return inertia('Panel/HistorialEstudiante', [
            'citas' => $citas,
            'query' => $query,
            'user' => Session::get('user'),
        ]);
    }
}