<?php
// app/Http/Controllers/Panel/MiHorarioController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class MiHorarioController extends Controller
{
    public function index()
    {
        $user = Session::get('user');
        if (!$user || $user['rol'] != 'Formador') {
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
        if (!$user || $user['rol'] != 'Formador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'dia_semana'  => 'required|in:lunes,martes,miércoles,jueves,viernes,sábado,domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin'    => 'required|date_format:H:i|after:hora_inicio',
        ]);

        $existe = DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where('hora_inicio', $validated['hora_inicio'])
            ->exists();

        if ($existe) {
            return redirect()->route('mis-horarios.index')
                ->with('error', 'Ya tienes un horario con ese dia y hora.');
        }

        // Verificar solapamiento con otros horarios del mismo dia
        $solapamiento = DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where(function ($q) use ($validated) {
                // Solapamiento: nuevo.inicio < existente.fin AND nuevo.fin > existente.inicio
                $q->where('hora_inicio', '<', $validated['hora_fin'])
                  ->where('hora_fin', '>', $validated['hora_inicio']);
            })
            ->exists();

        if ($solapamiento) {
            return redirect()->route('mis-horarios.index')
                ->with('error', 'El horario se solapa con otro ya existente.');
        }

        DB::table('horarios')->insert([
            'id_usuario'  => $user['id_usuario'],
            'dia_semana'  => $validated['dia_semana'],
            'hora_inicio' => $validated['hora_inicio'],
            'hora_fin'    => $validated['hora_fin'],
        ]);

        Log::info('Horario propio creado', [
            'id_usuario'  => $user['id_usuario'],
            'dia_semana'  => $validated['dia_semana'],
            'hora_inicio' => $validated['hora_inicio'],
            'hora_fin'    => $validated['hora_fin'],
            'ip'          => $request->ip(),
        ]);

        return redirect()->route('mis-horarios.index')
            ->with('success', 'Horario creado exitosamente.');
    }

    public function update(Request $request, $dia_semana, $hora_inicio)
    {
        $user = Session::get('user');
        if (!$user || $user['rol'] != 'Formador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'dia_semana'  => 'required|in:lunes,martes,miércoles,jueves,viernes,sábado,domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin'    => 'required|date_format:H:i|after:hora_inicio',
        ]);

        $existeOriginal = DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->exists();

        if (!$existeOriginal) {
            return redirect()->route('mis-horarios.index')
                ->with('error', 'Horario no encontrado.');
        }

        // Duplicado exacto (excepto el mismo registro)
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
                ->with('error', 'Ya tienes un horario con ese dia y hora.');
        }

        // Verificar solapamiento (excepto el mismo registro)
        $solapamiento = DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where(function ($q) use ($validated, $dia_semana, $hora_inicio) {
                $q->where(function ($qq) use ($validated) {
                    $qq->where('hora_inicio', '<', $validated['hora_fin'])
                       ->where('hora_fin', '>', $validated['hora_inicio']);
                });
                // Excluir el registro actual
                $q->where(function ($qq) use ($dia_semana, $hora_inicio) {
                    $qq->where('dia_semana', '!=', $dia_semana)
                       ->orWhere('hora_inicio', '!=', $hora_inicio);
                });
            })
            ->exists();

        if ($solapamiento) {
            return redirect()->route('mis-horarios.index')
                ->with('error', 'El horario se solapa con otro ya existente.');
        }

        DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->update([
                'dia_semana'  => $validated['dia_semana'],
                'hora_inicio' => $validated['hora_inicio'],
                'hora_fin'    => $validated['hora_fin'],
            ]);

        Log::info('Horario propio actualizado', [
            'id_usuario'   => $user['id_usuario'],
            'dia_previo'   => $dia_semana,
            'hora_previo'  => $hora_inicio,
            'dia_nuevo'    => $validated['dia_semana'],
            'hora_nueva'   => $validated['hora_inicio'],
            'hora_fin'     => $validated['hora_fin'],
            'ip'           => $request->ip(),
        ]);

        return redirect()->route('mis-horarios.index')
            ->with('success', 'Horario actualizado exitosamente.');
    }

    public function destroy(Request $request, $dia_semana, $hora_inicio)
    {
        $user = Session::get('user');
        if (!$user || $user['rol'] != 'Formador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $horario = DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->first();

        if (!$horario) {
            return redirect()->route('mis-horarios.index')
                ->with('error', 'Horario no encontrado.');
        }

        DB::table('horarios')
            ->where('id_usuario', $user['id_usuario'])
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->delete();

        Log::info('Horario propio eliminado', [
            'id_usuario'  => $user['id_usuario'],
            'dia_semana'  => $dia_semana,
            'hora_inicio' => $hora_inicio,
            'ip'          => $request->ip(),
        ]);

        return redirect()->route('mis-horarios.index')
            ->with('success', 'Horario eliminado exitosamente.');
    }
}