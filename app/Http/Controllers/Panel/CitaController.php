<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use App\Services\WhatsAppService;

class CitaController extends Controller
{
    public function index(Request $request)
    {
        $user = Session::get('user');
        $rol = $user['rol'];
        $usuarioId = $user['id_usuario'];

        $verTodas = ($rol === 'Formador') && ($request->get('todas') == 1);
        $soloLectura = $verTodas;

        $filtroFormador = $request->get('formador');
        $filtroEstado = $request->get('estado');
        $filtroFecha = $request->get('fecha');
        $semana = $request->get('semana', 'actual');

        $query = DB::table('citas')
            ->join('usuarios', 'citas.id_usuario', '=', 'usuarios.id_usuario')
            ->select('citas.*', 'usuarios.nombre as nombre_formador');

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

        if ($semana == 'actual') {
            $hoy = now()->toDateString();
            $fechaLimite = now()->addDays(7)->toDateString();
            $query->where('citas.fecha', '>=', $hoy)
                  ->where('citas.fecha', '<=', $fechaLimite);
        } else {
            if ($filtroFecha) {
                $query->whereDate('citas.fecha', $filtroFecha);
            }
        }

        $citas = $query->orderBy('citas.fecha', 'desc')
                       ->orderBy('citas.hora', 'desc')
                       ->get();

        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->where('activo', 1)
            ->select('id_usuario', 'nombre')
            ->get();

        return inertia('Panel/Citas', [
            'citas' => $citas,
            'formadores' => $formadores,
            'filtros' => [
                'formador' => $filtroFormador,
                'estado' => $filtroEstado,
                'fecha' => $filtroFecha,
                'semana' => $semana,
            ],
            'rol' => $rol,
            'soloLectura' => $soloLectura,
            'user' => $user,
        ]);
    }

    public function show($id)
    {
        $user = Session::get('user');

        if ($user['rol'] != 'Formador') {
            abort(403, 'Solo los formadores pueden gestionar citas.');
        }

        $cita = DB::table('citas')
            ->join('usuarios', 'citas.id_usuario', '=', 'usuarios.id_usuario')
            ->select('citas.*', 'usuarios.nombre as nombre_formador')
            ->where('citas.id_cita', $id)
            ->first();

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
                'notas' => 'nullable|string',
                'asistencia' => 'nullable|in:pendiente,asistió,no asistió',
            ]);

            Log::info('Actualizando notas de cita', ['id_cita' => $id, 'datos' => $validated]);

            $nuevoEstado = $cita->estado;
            if ($cita->estado === 'programada') {
                $nuevoEstado = 'completada';
            }

            DB::table('citas')
                ->where('id_cita', $id)
                ->update([
                    'clasificacion' => $validated['clasificacion'] ?? null,
                    'notas' => $validated['notas'] ?? null,
                    'asistencia' => $validated['asistencia'] ?? 'pendiente',
                    'estado' => $nuevoEstado,
                ]);

            return response()->json(['success' => true, 'message' => 'Notas actualizadas correctamente.']);
        } catch (\Exception $e) {
            Log::error('Error al actualizar notas:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error en el servidor: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Modificar fecha y hora de una cita.
     * Envía notificación por WhatsApp al estudiante.
     */
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
                'hora' => 'required|date_format:H:i',
            ]);

            $horaConSegundos = $validated['hora'] . ':00';

            // Verificar duplicados
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
                    'hora' => $horaConSegundos,
                ]);

            // ✅ Enviar notificación por WhatsApp (no bloquea la respuesta si falla)
            try {
                $citaActualizada = DB::table('citas')->where('id_cita', $id)->first();
                $whatsapp = new WhatsAppService();
                $whatsapp->sendModification($citaActualizada);
            } catch (\Exception $e) {
                Log::warning('Error al enviar WhatsApp de modificación: ' . $e->getMessage());
            }

            return response()->json(['success' => true, 'message' => 'Cita modificada correctamente.']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al modificar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Cancelar una cita.
     * Envía notificación por WhatsApp al estudiante.
     */
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
                    'notas' => $notaFinal,
                ]);

            // ✅ Enviar notificación por WhatsApp (no bloquea la respuesta si falla)
            try {
                $citaActualizada = DB::table('citas')->where('id_cita', $id)->first();
                $whatsapp = new WhatsAppService();
                $whatsapp->sendCancellation($citaActualizada);
            } catch (\Exception $e) {
                Log::warning('Error al enviar WhatsApp de cancelación: ' . $e->getMessage());
            }

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

    /**
     * Actualización genérica desde GestionCita.jsx.
     * Si el estado cambia a cancelada/cancelada_liberada, envía WhatsApp.
     */
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
            'notas' => 'nullable|string',
            'asistencia' => 'nullable|in:pendiente,asistió,no asistió',
            'estado' => 'required|in:programada,cancelada,completada,cancelada_liberada',
        ]);

        $estadoAnterior = $cita->estado;

        DB::table('citas')
            ->where('id_cita', $id)
            ->update([
                'clasificacion' => $validated['clasificacion'] ?? null,
                'notas' => $validated['notas'] ?? null,
                'asistencia' => $validated['asistencia'] ?? 'pendiente',
                'estado' => $validated['estado'],
            ]);

        // ✅ Si el estado cambió a cancelada/cancelada_liberada, enviar WhatsApp
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

        return redirect()->route('citas.index')->with('success', 'Cita actualizada exitosamente.');
    }

    public function historial(Request $request)
    {
        $query = $request->get('query', '');
        $citas = [];

        if (strlen($query) >= 1) {
            $citas = DB::table('citas')
                ->join('usuarios', 'citas.id_usuario', '=', 'usuarios.id_usuario')
                ->select('citas.*', 'usuarios.nombre as nombre_formador')
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