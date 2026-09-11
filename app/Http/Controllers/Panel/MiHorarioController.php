<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class MiHorarioController extends Controller
{
    public function index()
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Formador') {
            abort(403, 'No autorizado.');
        }

        $horarios = DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->orderByRaw("FIELD(dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')")
            ->orderBy('hora_inicio')
            ->get();

        return inertia('Panel/MisHorarios', [
            'horarios' => $horarios,
            'user' => $user,
        ]);
    }

    public function store(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Formador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'dia_semana' => 'required|in:lunes,martes,miércoles,jueves,viernes,sábado,domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
        ]);

        $existe = DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where('hora_inicio', $validated['hora_inicio'])
            ->exists();

        if ($existe) {
            return redirect()->route('mis-horarios.index')
                ->with('error', 'Ya tienes un horario con ese día y hora.');
        }

        DB::table('horarios')->insert([
            'id_usuario' => $user['id_usuario'],
            'dia_semana' => $validated['dia_semana'],
            'hora_inicio' => $validated['hora_inicio'],
            'hora_fin' => $validated['hora_fin'],
        ]);

        return redirect()->route('mis-horarios.index')
            ->with('success', 'Horario creado exitosamente.');
    }

    public function update(Request $request, $dia_semana, $hora_inicio)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Formador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'dia_semana' => 'required|in:lunes,martes,miércoles,jueves,viernes,sábado,domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
        ]);

        // Verificar que el registro original existe y pertenece al formador
        $existeOriginal = DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->exists();

        if (!$existeOriginal) {
            return redirect()->route('mis-horarios.index')
                ->with('error', 'Horario no encontrado.');
        }

        // Verificar duplicado (excepto el mismo registro)
        $duplicado = DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where('hora_inicio', $validated['hora_inicio'])
            ->where(function ($q) use ($dia_semana, $hora_inicio) {
                $q->where('dia_semana', '!=', $dia_semana)
                  ->orWhere('hora_inicio', '!=', $hora_inicio);
            })
            ->exists();

        if ($duplicado) {
            return redirect()->route('mis-horarios.index')
                ->with('error', 'Ya tienes un horario con ese día y hora.');
        }

        DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->update([
                'dia_semana' => $validated['dia_semana'],
                'hora_inicio' => $validated['hora_inicio'],
                'hora_fin' => $validated['hora_fin'],
            ]);

        return redirect()->route('mis-horarios.index')
            ->with('success', 'Horario actualizado exitosamente.');
    }

    public function destroy($dia_semana, $hora_inicio)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Formador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->delete();

        return redirect()->route('mis-horarios.index')
            ->with('success', 'Horario eliminado exitosamente.');
    }
}