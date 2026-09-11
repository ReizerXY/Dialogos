<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\WhatsAppService;

class CitaController extends Controller
{
    public function index()
    {
        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->where('activo', 1)
            ->select('id_usuario', 'nombre')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id_usuario,
                    'nombre' => $item->nombre,
                ];
            })
            ->toArray();

        return inertia('SolicitarCita', [
            'formadores' => $formadores,
        ]);
    }

    public function verificarIdEstudiante($id_estudiante)
    {
        $estudiante = DB::table('estudiantes')
            ->where('id_estudiante', $id_estudiante)
            ->first();

        if ($estudiante) {
            return response()->json([
                'existe' => true,
                'nombre' => $estudiante->nombre,
                'id_estudiante' => $estudiante->id_estudiante,
            ]);
        }

        return response()->json(['existe' => false]);
    }

    public function estudiantes(Request $request)
    {
        $query = $request->get('q', '');
        if (strlen($query) < 1) {
            return response()->json([]);
        }

        $estudiantes = DB::table('estudiantes')
            ->where('nombre', 'LIKE', "%$query%")
            ->orWhere('id_estudiante', 'LIKE', "%$query%")
            ->select('id_estudiante', 'nombre', 'grado', 'grupo')
            ->limit(10)
            ->get();

        return response()->json($estudiantes);
    }

    public function disponibilidad(Request $request)
    {
        $formadorId = $request->get('formador_id');
        if (!$formadorId) {
            return response()->json([]);
        }

        $hoy = now();
        $limite = now()->addDays(7);

        $diasSemana = [];
        for ($i = 0; $i <= 7; $i++) {
            $fecha = $hoy->copy()->addDays($i);
            $diasSemana[] = [
                'fecha' => $fecha->toDateString(),
                'dia' => strtolower($fecha->locale('es')->dayName),
            ];
        }

        $horarios = DB::table('horarios')
            ->where('id_usuario', $formadorId)
            ->whereIn('dia_semana', array_column($diasSemana, 'dia'))
            ->get(['dia_semana', 'hora_inicio']);

        $citas = DB::table('citas')
            ->where('id_usuario', $formadorId)
            ->whereIn('estado', ['programada', 'completada', 'cancelada'])
            ->whereBetween('fecha', [$hoy->toDateString(), $limite->toDateString()])
            ->get(['fecha', 'hora']);

        $ocupadas = [];
        foreach ($citas as $cita) {
            $horaCita = substr($cita->hora, 0, 5);
            $ocupadas[$cita->fecha][] = $horaCita;
        }

        $disponible = [];
        foreach ($diasSemana as $item) {
            $fecha = $item['fecha'];
            $dia = $item['dia'];
            $horas = [];

            foreach ($horarios as $horario) {
                if ($horario->dia_semana == $dia) {
                    $hora = substr($horario->hora_inicio, 0, 5);
                    if (!isset($ocupadas[$fecha]) || !in_array($hora, $ocupadas[$fecha])) {
                        $horas[] = $hora;
                    }
                }
            }

            if (!empty($horas)) {
                $disponible[$fecha] = $horas;
            }
        }

        return response()->json($disponible);
    }

    /**
     * Guardar la cita y enviar notificación por WhatsApp
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre_estudiante' => 'required|string|max:100',
                'usuario_id'        => 'required|integer|exists:usuarios,id_usuario',
                'fecha'             => 'required|date',
                'hora'              => 'required|date_format:H:i',
            ]);

            $estudiante = DB::table('estudiantes')
                ->where('nombre', $validated['nombre_estudiante'])
                ->first();

            $lastId = DB::table('citas')->max('id_cita') ?? 0;
            $newId = $lastId + 1;
            $horaConSegundos = $validated['hora'] . ':00';

            DB::table('citas')->insert([
                'id_cita'            => $newId,
                'id_estudiante'      => $estudiante ? $estudiante->id_estudiante : null,
                'nombre_estudiante'  => $validated['nombre_estudiante'],
                'id_usuario'         => $validated['usuario_id'],
                'fecha'              => $validated['fecha'],
                'hora'               => $horaConSegundos,
                'notas'              => null,
                'asistencia'         => 'pendiente',
                'estado'             => 'programada',
            ]);

            // ✅ Enviar notificación por WhatsApp (no bloquea la respuesta si falla)
            try {
                $cita = DB::table('citas')->where('id_cita', $newId)->first();
                $whatsapp = new WhatsAppService();
                $whatsapp->sendConfirmation($cita);
            } catch (\Exception $e) {
                Log::warning('Error al enviar WhatsApp de confirmación: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Cita solicitada exitosamente.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al guardar cita:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar: ' . $e->getMessage()
            ], 500);
        }
    }
}