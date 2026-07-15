<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CitaController extends Controller
{
    /**
     * Muestra el formulario de solicitar cita
     */
    public function index()
    {
        // Obtener lista de formadores (usuarios con rol = 'Formador')
        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->select('id', 'nombre')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nombre' => $item->nombre,
                ];
            })
            ->toArray();

        return inertia('SolicitarCita', [
            'formadores' => $formadores,
        ]);
    }

    /**
     * API para autocompletar estudiantes
     */
    public function estudiantes(Request $request)
    {
        $query = $request->get('q', '');
        if (strlen($query) < 1) {
            return response()->json([]);
        }

        $estudiantes = DB::table('estudiantes')
            ->where('nombre', 'LIKE', "%$query%")
            ->orWhere('matricula', 'LIKE', "%$query%")
            ->select('matricula', 'nombre', 'grado', 'grupo')
            ->limit(10)
            ->get();

        return response()->json($estudiantes);
    }

    /**
     * API para disponibilidad (basada en usuario_id y día de la semana)
     */
    public function disponibilidad(Request $request)
    {
        $formadorId = $request->get('formador_id');
        if (!$formadorId) {
            return response()->json([]);
        }

        $hoy = now();
        $limite = now()->addDays(7);

        // Obtener días de la semana en español para los próximos 7 días
        $diasSemana = [];
        for ($i = 0; $i <= 7; $i++) {
            $fecha = $hoy->copy()->addDays($i);
            $diasSemana[] = [
                'fecha' => $fecha->toDateString(),
                'dia' => strtolower($fecha->locale('es')->dayName), // ej: "lunes"
            ];
        }

        // Obtener horarios del formador para esos días
        $horarios = DB::table('horarios')
            ->where('usuario_id', $formadorId)
            ->whereIn('dia_semana', array_column($diasSemana, 'dia'))
            ->get(['dia_semana', 'hora_inicio']);

        // Obtener citas ocupadas para ese formador en esas fechas
        $citas = DB::table('citas')
            ->where('usuario_id', $formadorId)
            ->whereIn('estado', ['programada', 'completada'])
            ->whereBetween('fecha', [$hoy->toDateString(), $limite->toDateString()])
            ->get(['fecha', 'hora']);

        // Construir array de ocupadas por fecha
        $ocupadas = [];
        foreach ($citas as $cita) {
            $horaCita = substr($cita->hora, 0, 5); // "09:00"
            $ocupadas[$cita->fecha][] = $horaCita;
        }

        // Construir disponibilidad por fecha
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
     * Guardar la cita (con asignación manual de id)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre_estudiante' => 'required|string|max:100',
                'usuario_id' => 'required|integer|exists:usuarios,id',
                'fecha' => 'required|date',
                'hora' => 'required|date_format:H:i',
            ]);

            // ✅ Obtener el último ID y sumar 1 (asignación manual)
            $lastId = DB::table('citas')->max('id') ?? 0;
            $newId = $lastId + 1;

            // Agregar ":00" para guardar con segundos (formato TIME)
            $horaConSegundos = $validated['hora'] . ':00';

            DB::table('citas')->insert([
                'id' => $newId, // ✅ Asignación manual del ID
                'nombre_estudiante' => $validated['nombre_estudiante'],
                'usuario_id' => $validated['usuario_id'],
                'fecha' => $validated['fecha'],
                'hora' => $horaConSegundos,
                'notas' => null,
                'asistencia' => 'pendiente',
                'estado' => 'programada',
            ]);

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