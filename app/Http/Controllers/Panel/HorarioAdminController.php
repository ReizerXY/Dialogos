<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class HorarioAdminController extends Controller
{
    public function index(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        $filtroFormador = $request->get('formador');

        $query = DB::table('horarios')
            ->join('usuarios', 'horarios.usuario_id', '=', 'usuarios.id')
            ->select('horarios.*', 'usuarios.nombre as nombre_formador');

        if ($filtroFormador) {
            $query->where('horarios.usuario_id', $filtroFormador);
        }

        $horarios = $query
            ->orderBy('usuarios.nombre')
            ->orderByRaw("FIELD(horarios.dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')")
            ->orderBy('horarios.hora_inicio')
            ->get();

        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->select('id', 'nombre')
            ->get();

        return inertia('Panel/ModificarHorarios', [
            'horarios' => $horarios,
            'formadores' => $formadores,
            'filtroFormador' => $filtroFormador,
            'user' => $user,
        ]);
    }

    public function store(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'usuario_id' => 'required|exists:usuarios,id',
            'dia_semana' => 'required|in:lunes,martes,miércoles,jueves,viernes,sábado,domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
        ]);

        // Guardar solo HH:MM (sin segundos)
        $horaInicio = $validated['hora_inicio'];
        $horaFin = $validated['hora_fin'];

        // Verificar duplicado
        $existe = DB::table('horarios')
            ->where('usuario_id', $validated['usuario_id'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where('hora_inicio', $horaInicio)
            ->exists();

        if ($existe) {
            return redirect()->route('admin.horarios.index')
                ->with('error', 'Ya existe un horario con ese día y hora para este formador.');
        }

        // Insertar sin ID (no necesitamos asignar ID manual)
        DB::table('horarios')->insert([
            'usuario_id' => $validated['usuario_id'],
            'dia_semana' => $validated['dia_semana'],
            'hora_inicio' => $horaInicio,
            'hora_fin' => $horaFin,
        ]);

        return redirect()->route('admin.horarios.index')
            ->with('success', 'Horario creado exitosamente.');
    }

    public function update(Request $request, $usuario_id, $dia_semana, $hora_inicio)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'usuario_id' => 'required|exists:usuarios,id',
            'dia_semana' => 'required|in:lunes,martes,miércoles,jueves,viernes,sábado,domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
        ]);

        $nuevoHoraInicio = $validated['hora_inicio'];
        $nuevoHoraFin = $validated['hora_fin'];

        // Verificar duplicado (excepto el mismo registro)
        $existe = DB::table('horarios')
            ->where('usuario_id', $validated['usuario_id'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where('hora_inicio', $nuevoHoraInicio)
            ->where(function($query) use ($usuario_id, $dia_semana, $hora_inicio) {
                $query->where('usuario_id', '!=', $usuario_id)
                      ->orWhere('dia_semana', '!=', $dia_semana)
                      ->orWhere('hora_inicio', '!=', $hora_inicio);
            })
            ->exists();

        if ($existe) {
            return redirect()->route('admin.horarios.index')
                ->with('error', 'Ya existe un horario con ese día y hora para este formador.');
        }

        // Actualizar
        DB::table('horarios')
            ->where('usuario_id', $usuario_id)
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->update([
                'usuario_id' => $validated['usuario_id'],
                'dia_semana' => $validated['dia_semana'],
                'hora_inicio' => $nuevoHoraInicio,
                'hora_fin' => $nuevoHoraFin,
            ]);

        return redirect()->route('admin.horarios.index')
            ->with('success', 'Horario actualizado exitosamente.');
    }

    public function destroy($usuario_id, $dia_semana, $hora_inicio)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        DB::table('horarios')
            ->where('usuario_id', $usuario_id)
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->delete();

        return redirect()->route('admin.horarios.index')
            ->with('success', 'Horario eliminado exitosamente.');
    }
}