<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class CitaController extends Controller
{
    /**
     * Listado de citas con filtros (semana actual por defecto)
     */
    public function index(Request $request)
    {
        $user = Session::get('user');
        $rol = $user['rol'];
        $usuarioId = $user['id'];

        $filtroFormador = $request->get('formador');
        $filtroEstado = $request->get('estado');
        $filtroFecha = $request->get('fecha');
        $semana = $request->get('semana', 'actual'); // por defecto, semana actual

        $query = DB::table('citas')
            ->join('usuarios', 'citas.usuario_id', '=', 'usuarios.id')
            ->select('citas.*', 'usuarios.nombre as nombre_formador');

        // Filtrar por rol
        if ($rol == 'Formador') {
            $query->where('citas.usuario_id', $usuarioId);
        } else {
            if ($filtroFormador) {
                $query->where('citas.usuario_id', $filtroFormador);
            }
        }

        // Filtro por estado
        if ($filtroEstado) {
            $query->where('citas.estado', $filtroEstado);
        }

        // Filtro por fecha específica
        if ($filtroFecha) {
            $query->whereDate('citas.fecha', $filtroFecha);
        }

        // Filtro por semana (actual por defecto)
        if ($semana == 'actual') {
            $hoy = now()->toDateString();
            $domingo = now()->endOfWeek()->toDateString();
            // Mostrar solo citas desde hoy hasta el domingo (dentro de la semana actual)
            $query->where('citas.fecha', '>=', $hoy)
                  ->where('citas.fecha', '<=', $domingo);
        }

        $citas = $query->orderBy('citas.fecha')->orderBy('citas.hora')->get();

        // Lista de formadores para el filtro (coordinador)
        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->select('id', 'nombre')
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
            'user' => $user,
        ]);
    }

    /**
     * Mostrar detalle de una cita para gestión
     */
    public function show($id)
    {
        $user = Session::get('user');

        $cita = DB::table('citas')
            ->join('usuarios', 'citas.usuario_id', '=', 'usuarios.id')
            ->select('citas.*', 'usuarios.nombre as nombre_formador')
            ->where('citas.id', $id)
            ->first();

        if (!$cita) {
            abort(404, 'Cita no encontrada.');
        }

        if ($user['rol'] == 'Formador' && $cita->usuario_id != $user['id']) {
            abort(403, 'No tienes permiso para gestionar esta cita.');
        }

        return inertia('Panel/GestionCita', [
            'cita' => $cita,
            'user' => $user,
        ]);
    }

    /**
     * Actualizar notas, clasificación y asistencia
     */
    public function actualizarNotas(Request $request, $id)
    {
        try {
            $user = Session::get('user');
            $cita = DB::table('citas')->where('id', $id)->first();

            if (!$cita) {
                return response()->json(['error' => 'Cita no encontrada'], 404);
            }

            if ($user['rol'] == 'Formador' && $cita->usuario_id != $user['id']) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            $validated = $request->validate([
                'clasificacion' => 'nullable|in:académica,familiar,emocional,espiritual,institucional',
                'notas' => 'nullable|string',
                'asistencia' => 'nullable|in:pendiente,asistió,no asistió',
            ]);

            Log::info('Actualizando notas de cita', ['id' => $id, 'datos' => $validated]);

            DB::table('citas')
                ->where('id', $id)
                ->update([
                    'clasificacion' => $validated['clasificacion'] ?? null,
                    'notas' => $validated['notas'] ?? null,
                    'asistencia' => $validated['asistencia'] ?? 'pendiente',
                ]);

            return response()->json(['success' => true, 'message' => 'Notas actualizadas correctamente.']);
        } catch (\Exception $e) {
            Log::error('Error al actualizar notas:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error en el servidor: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Modificar fecha y hora de una cita
     */
    public function modificarCita(Request $request, $id)
    {
        try {
            $user = Session::get('user');
            $cita = DB::table('citas')->where('id', $id)->first();

            if (!$cita) {
                return response()->json(['error' => 'Cita no encontrada'], 404);
            }

            if ($user['rol'] == 'Formador' && $cita->usuario_id != $user['id']) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            $validated = $request->validate([
                'fecha' => 'required|date',
                'hora' => 'required|date_format:H:i',
            ]);

            $horaConSegundos = $validated['hora'] . ':00';

            // Verificar disponibilidad (evitar duplicados)
            $existe = DB::table('citas')
                ->where('usuario_id', $cita->usuario_id)
                ->where('fecha', $validated['fecha'])
                ->where('hora', $horaConSegundos)
                ->where('id', '!=', $id)
                ->whereIn('estado', ['programada', 'completada'])
                ->exists();

            if ($existe) {
                return response()->json(['error' => 'Ya existe una cita en esa fecha y hora.'], 422);
            }

            DB::table('citas')
                ->where('id', $id)
                ->update([
                    'fecha' => $validated['fecha'],
                    'hora' => $horaConSegundos,
                ]);

            return response()->json(['success' => true, 'message' => 'Cita modificada correctamente.']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al modificar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Cancelar una cita (cambia estado a cancelada)
     */
    public function cancelarCita($id)
    {
        try {
            $user = Session::get('user');
            $cita = DB::table('citas')->where('id', $id)->first();

            if (!$cita) {
                return response()->json(['error' => 'Cita no encontrada'], 404);
            }

            if ($user['rol'] == 'Formador' && $cita->usuario_id != $user['id']) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            if ($cita->estado == 'cancelada') {
                return response()->json(['error' => 'La cita ya está cancelada.'], 422);
            }

            DB::table('citas')
                ->where('id', $id)
                ->update(['estado' => 'cancelada']);

            return response()->json(['success' => true, 'message' => 'Cita cancelada correctamente.']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al cancelar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Método genérico de actualización (para compatibilidad)
     */
    public function update(Request $request, $id)
    {
        $user = Session::get('user');
        $cita = DB::table('citas')->where('id', $id)->first();

        if (!$cita) {
            abort(404);
        }

        if ($user['rol'] == 'Formador' && $cita->usuario_id != $user['id']) {
            abort(403);
        }

        $validated = $request->validate([
            'clasificacion' => 'nullable|in:académica,familiar,emocional,espiritual,institucional',
            'notas' => 'nullable|string',
            'asistencia' => 'nullable|in:pendiente,asistió,no asistió',
            'estado' => 'required|in:programada,cancelada,completada',
        ]);

        DB::table('citas')
            ->where('id', $id)
            ->update([
                'clasificacion' => $validated['clasificacion'] ?? null,
                'notas' => $validated['notas'] ?? null,
                'asistencia' => $validated['asistencia'] ?? 'pendiente',
                'estado' => $validated['estado'],
            ]);

        return redirect()->route('citas.index')->with('success', 'Cita actualizada exitosamente.');
    }

    /**
     * Historial de citas por estudiante
     */
    public function historial(Request $request)
    {
        $query = $request->get('query', '');
        $citas = [];

        if (strlen($query) >= 1) {
            $citas = DB::table('citas')
                ->join('usuarios', 'citas.usuario_id', '=', 'usuarios.id')
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