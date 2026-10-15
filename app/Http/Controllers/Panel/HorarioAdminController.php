<?php
// app/Http/Controllers/Panel/HorarioAdminController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class HorarioAdminController extends Controller
{
    public function index(Request $request)
    {
        $user = Session::get('user');
        if (!$user || $user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        $filtroFormador = null;
        if ($request->filled('formador') && ctype_digit((string) $request->get('formador'))) {
            $filtroFormador = (int) $request->get('formador');
        }

        $diasValidos = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
        $filtroDia = $request->get('dia');
        if (!in_array($filtroDia, $diasValidos, true)) {
            $filtroDia = null;
        }

        $filtroHoraDesde = $request->get('hora_desde');
        if (!preg_match('/^\d{2}:\d{2}$/', (string) $filtroHoraDesde)) {
            $filtroHoraDesde = null;
        }

        $filtroHoraHasta = $request->get('hora_hasta');
        if (!preg_match('/^\d{2}:\d{2}$/', (string) $filtroHoraHasta)) {
            $filtroHoraHasta = null;
        }

        $query = DB::table('horarios')
            ->join('usuarios', 'horarios.id_usuario', '=', 'usuarios.id_usuario')
            ->where('usuarios.rol', 'Formador')
            ->select('horarios.*', 'usuarios.nombre as nombre_formador');

        if ($filtroFormador) {
            $query->where('horarios.id_usuario', $filtroFormador);
        }
        if ($filtroDia) {
            $query->where('horarios.dia_semana', $filtroDia);
        }
        if ($filtroHoraDesde) {
            $query->where('horarios.hora_inicio', '>=', $filtroHoraDesde);
        }
        if ($filtroHoraHasta) {
            $query->where('horarios.hora_fin', '<=', $filtroHoraHasta);
        }

        $horarios = $query
            ->orderBy('usuarios.nombre')
            ->orderByRaw("FIELD(horarios.dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')")
            ->orderBy('horarios.hora_inicio')
            ->get();

        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->where('visibilidad_usuario', 1)
            ->select('id_usuario', 'nombre')
            ->orderBy('nombre')
            ->get();

        return inertia('Panel/ModificarHorarios', [
            'horarios'        => $horarios,
            'formadores'      => $formadores,
            'filtroFormador'  => $filtroFormador,
            'filtroDia'       => $filtroDia,
            'filtroHoraDesde' => $filtroHoraDesde,
            'filtroHoraHasta' => $filtroHoraHasta,
            'user'            => $user,
        ]);
    }

    public function store(Request $request)
    {
        $user = Session::get('user');
        if (!$user || $user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'id_usuario'  => 'required|integer|exists:usuarios,id_usuario',
            'dia_semana'  => 'required|in:lunes,martes,miércoles,jueves,viernes,sábado,domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin'    => 'required|date_format:H:i|after:hora_inicio',
        ]);

        // Verificar que el usuario destino sea Formador
        $usuarioDestino = DB::table('usuarios')->where('id_usuario', $validated['id_usuario'])->first();
        if (!$usuarioDestino || $usuarioDestino->rol !== 'Formador') {
            return redirect()->route('admin.horarios.index')
                ->with('error', 'Solo se pueden asignar horarios a Formadores.');
        }

        $horaInicio = $validated['hora_inicio'];
        $horaFin    = $validated['hora_fin'];

        $existe = DB::table('horarios')
            ->where('id_usuario', $validated['id_usuario'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where('hora_inicio', $horaInicio)
            ->exists();

        if ($existe) {
            return redirect()->route('admin.horarios.index')
                ->with('error', 'Ya existe un horario con ese dia y hora para este formador.');
        }

        DB::table('horarios')->insert([
            'id_usuario'  => $validated['id_usuario'],
            'dia_semana'  => $validated['dia_semana'],
            'hora_inicio' => $horaInicio,
            'hora_fin'    => $horaFin,
        ]);

        Log::info('Horario creado (admin)', [
            'id_usuario'   => $validated['id_usuario'],
            'formador'     => $usuarioDestino->usuario,
            'dia_semana'   => $validated['dia_semana'],
            'hora_inicio'  => $horaInicio,
            'hora_fin'     => $horaFin,
            'por_usuario'  => $user['usuario'] ?? null,
            'ip'           => $request->ip(),
        ]);

        return redirect()->route('admin.horarios.index')
            ->with('success', 'Horario creado exitosamente.');
    }

    public function update(Request $request, $id_usuario, $dia_semana, $hora_inicio)
    {
        $user = Session::get('user');
        if (!$user || $user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'id_usuario'  => 'required|integer|exists:usuarios,id_usuario',
            'dia_semana'  => 'required|in:lunes,martes,miércoles,jueves,viernes,sábado,domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin'    => 'required|date_format:H:i|after:hora_inicio',
        ]);

        // Verificar que el usuario destino sea Formador
        $usuarioDestino = DB::table('usuarios')->where('id_usuario', $validated['id_usuario'])->first();
        if (!$usuarioDestino || $usuarioDestino->rol !== 'Formador') {
            return redirect()->route('admin.horarios.index')
                ->with('error', 'Solo se pueden asignar horarios a Formadores.');
        }

        $nuevoHoraInicio = $validated['hora_inicio'];
        $nuevoHoraFin    = $validated['hora_fin'];

        $existe = DB::table('horarios')
            ->where('id_usuario', $validated['id_usuario'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where('hora_inicio', $nuevoHoraInicio)
            ->where(function ($query) use ($id_usuario, $dia_semana, $hora_inicio) {
                $query->where('id_usuario', '!=', $id_usuario)
                      ->orWhere('dia_semana', '!=', $dia_semana)
                      ->orWhere('hora_inicio', '!=', $hora_inicio);
            })
            ->exists();

        if ($existe) {
            return redirect()->route('admin.horarios.index')
                ->with('error', 'Ya existe un horario con ese dia y hora para este formador.');
        }

        DB::table('horarios')
            ->where('id_usuario', $id_usuario)
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->update([
                'id_usuario'  => $validated['id_usuario'],
                'dia_semana'  => $validated['dia_semana'],
                'hora_inicio' => $nuevoHoraInicio,
                'hora_fin'    => $nuevoHoraFin,
            ]);

        Log::info('Horario actualizado (admin)', [
            'id_usuario_previo' => $id_usuario,
            'dia_previo'        => $dia_semana,
            'hora_previo'       => $hora_inicio,
            'id_usuario_nuevo'  => $validated['id_usuario'],
            'dia_nuevo'         => $validated['dia_semana'],
            'hora_inicio_nuevo' => $nuevoHoraInicio,
            'hora_fin_nuevo'    => $nuevoHoraFin,
            'por_usuario'       => $user['usuario'] ?? null,
            'ip'                => $request->ip(),
        ]);

        return redirect()->route('admin.horarios.index')
            ->with('success', 'Horario actualizado exitosamente.');
    }

    public function destroy(Request $request, $id_usuario, $dia_semana, $hora_inicio)
    {
        $user = Session::get('user');
        if (!$user || $user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $horario = DB::table('horarios')
            ->where('id_usuario', $id_usuario)
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->first();

        if (!$horario) {
            return redirect()->route('admin.horarios.index')
                ->with('error', 'Horario no encontrado.');
        }

        DB::table('horarios')
            ->where('id_usuario', $id_usuario)
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->delete();

        Log::warning('Horario eliminado (admin)', [
            'id_usuario'  => $id_usuario,
            'dia_semana'  => $dia_semana,
            'hora_inicio' => $hora_inicio,
            'por_usuario' => $user['usuario'] ?? null,
            'ip'          => $request->ip(),
        ]);

        return redirect()->route('admin.horarios.index')
            ->with('success', 'Horario eliminado exitosamente.');
    }
}