<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class HorarioController extends Controller
{
    public function index(Request $request)
    {
        $formadorId = $request->get('formador');
        $diaSemana  = $request->get('dia');
        $horaDesde  = $request->get('hora_desde');
        $horaHasta  = $request->get('hora_hasta');

        $query = DB::table('horarios')
            ->join('usuarios', 'horarios.id_usuario', '=', 'usuarios.id_usuario')
            ->where('usuarios.rol', 'Formador')
            ->where('usuarios.activo', 1)
            ->select('horarios.*', 'usuarios.nombre as nombre_formador');

        // Filtro por formador
        if ($formadorId) {
            $query->where('horarios.id_usuario', $formadorId);
        }

        // Filtro por día de la semana
        if ($diaSemana) {
            $query->where('horarios.dia_semana', $diaSemana);
        }

        // Filtro por rango horario
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

        // Solo formadores ACTIVOS para el selector
        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->where('activo', 1)
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
            'user' => Session::get('user'),
        ]);
    }
}