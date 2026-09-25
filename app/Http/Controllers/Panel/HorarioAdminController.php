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

        $filtroFormador  = $request->get('formador');
        $filtroDia       = $request->get('dia');
        $filtroHoraDesde = $request->get('hora_desde');
        $filtroHoraHasta = $request->get('hora_hasta');

        $query = DB::table('horarios')
            ->join('usuarios', 'horarios.id_usuario', '=', 'usuarios.id_usuario')
            ->where('usuarios.rol', 'Formador')
            ->select('horarios.*', 'usuarios.nombre as nombre_formador');

        // Filtro por formador
        if ($filtroFormador) {
            $query->where('horarios.id_usuario', $filtroFormador);
        }

        // Filtro por día
        if ($filtroDia) {
            $query->where('horarios.dia_semana', $filtroDia);
        }

        // Filtro por rango horario
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

        // Solo formadores ACTIVOS para el selector
        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->where('activo', 1)
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
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'dia_semana' => 'required|in:lunes,martes,miércoles,jueves,viernes,sábado,domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
        ]);

        $horaInicio = $validated['hora_inicio'];
        $horaFin    = $validated['hora_fin'];

        $existe = DB::table('horarios')
            ->where('id_usuario', $validated['id_usuario'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where('hora_inicio', $horaInicio)
            ->exists();

        if ($existe) {
            return redirect()->route('admin.horarios.index')
                ->with('error', 'Ya existe un horario con ese día y hora para este formador.');
        }

        DB::table('horarios')->insert([
            'id_usuario'  => $validated['id_usuario'],
            'dia_semana'  => $validated['dia_semana'],
            'hora_inicio' => $horaInicio,
            'hora_fin'    => $horaFin,
        ]);

        return redirect()->route('admin.horarios.index')
            ->with('success', 'Horario creado exitosamente.');
    }

    public function update(Request $request, $id_usuario, $dia_semana, $hora_inicio)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'dia_semana' => 'required|in:lunes,martes,miércoles,jueves,viernes,sábado,domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
        ]);

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
                ->with('error', 'Ya existe un horario con ese día y hora para este formador.');
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

        return redirect()->route('admin.horarios.index')
            ->with('success', 'Horario actualizado exitosamente.');
    }

    public function destroy($id_usuario, $dia_semana, $hora_inicio)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        DB::table('horarios')
            ->where('id_usuario', $id_usuario)
            ->where('dia_semana', $dia_semana)
            ->where('hora_inicio', $hora_inicio)
            ->delete();

        return redirect()->route('admin.horarios.index')
            ->with('success', 'Horario eliminado exitosamente.');
    }
}