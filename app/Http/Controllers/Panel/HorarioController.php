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

        $query = DB::table('horarios')
            ->join('usuarios', 'horarios.id_usuario', '=', 'usuarios.id_usuario')
            ->select('horarios.*', 'usuarios.nombre as nombre_formador');

        if ($formadorId) {
            $query->where('horarios.id_usuario', $formadorId);
        }

        $horarios = $query
            ->orderBy('usuarios.nombre')
            ->orderByRaw("FIELD(horarios.dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')")
            ->orderBy('horarios.hora_inicio')
            ->get();

        // ✅ Solo formadores ACTIVOS para el filtro
        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->where('activo', 1)
            ->select('id_usuario', 'nombre')
            ->get();

        return inertia('Panel/Horarios', [
            'horarios' => $horarios,
            'formadores' => $formadores,
            'filtroFormador' => $formadorId,
            'user' => Session::get('user'),
        ]);
    }
}