<?php
// app/Http/Controllers/Panel/HorarioController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class HorarioController extends Controller
{
    public function index(Request $request)
    {
        $user = Session::get('user');
        if (!$user) {
            abort(403, 'No autorizado.');
        }

        // ---- Validacion de filtros ----
        $formadorId = null;
        if ($request->filled('formador') && ctype_digit((string) $request->get('formador'))) {
            $formadorId = (int) $request->get('formador');
        }

        $diasValidos = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
        $diaSemana = $request->get('dia');
        if (!in_array($diaSemana, $diasValidos, true)) {
            $diaSemana = null;
        }

        $horaDesde = $request->get('hora_desde');
        if (!preg_match('/^\d{2}:\d{2}$/', (string) $horaDesde)) {
            $horaDesde = null;
        }

        $horaHasta = $request->get('hora_hasta');
        if (!preg_match('/^\d{2}:\d{2}$/', (string) $horaHasta)) {
            $horaHasta = null;
        }

        $query = DB::table('horarios')
            ->join('usuarios', 'horarios.id_usuario', '=', 'usuarios.id_usuario')
            ->where('usuarios.rol', 'Formador')
            ->where('usuarios.visibilidad_usuario', 1)
            ->select('horarios.*', 'usuarios.nombre as nombre_formador');

        if ($formadorId) {
            $query->where('horarios.id_usuario', $formadorId);
        }

        if ($diaSemana) {
            $query->where('horarios.dia_semana', $diaSemana);
        }

        if ($horaDesde) {
            $query->where('horarios.hora_inicio', '>=', $horaDesde);
        }
        if ($horaHasta) {
            $query->where('horarios.hora_fin', '<=', $horaHasta);
        }

        $horarios = $query
            ->orderBy('usuarios.nombre')
            ->orderByRaw("FIELD(horarios.dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')")
            ->orderBy('horarios.hora_inicio')
            ->get();

        // Solo formadores VISIBLES para el selector
        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->where('visibilidad_usuario', 1)
            ->select('id_usuario', 'nombre')
            ->orderBy('nombre')
            ->get();

        return inertia('Panel/Horarios', [
            'horarios'   => $horarios,
            'formadores' => $formadores,
            'filtros'    => [
                'formador'   => $formadorId,
                'dia'        => $diaSemana,
                'hora_desde' => $horaDesde,
                'hora_hasta' => $horaHasta,
            ],
            'user' => $user,
        ]);
    }
}