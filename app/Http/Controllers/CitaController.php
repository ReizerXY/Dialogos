<?php
// app/Http/Controllers/CitaController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\WhatsAppService;
use App\Services\CacheInvalidator;

class CitaController extends Controller
{
    // Muestra el formulario público para solicitar cita
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

    // Verifica si existe un estudiante por su ID
    public function verificarIdEstudiante($id_estudiante)
    {
        $estudiante = DB::table('estudiantes')
            ->where('id_estudiante', $id_estudiante)
            ->first();

        if ($estudiante) {
            $nombreCompleto = trim($estudiante->nombre . ' ' . $estudiante->apellido_paterno . ' ' . $estudiante->apellido_materno);

            return response()->json([
                'existe' => true,
                'nombre' => $nombreCompleto,
                'id_estudiante' => $estudiante->id_estudiante,
            ]);
        }

        return response()->json(['existe' => false]);
    }

    // Busca estudiantes por nombre, apellidos o ID
    public function estudiantes(Request $request)
    {
        $query = $request->get('q', '');
        if (strlen($query) < 1) {
            return response()->json([]);
        }

        $estudiantes = DB::table('estudiantes')
            ->where(function ($q) use ($query) {
                $q->where('nombre', 'LIKE', "%$query%")
                  ->orWhere('apellido_paterno', 'LIKE', "%$query%")
                  ->orWhere('apellido_materno', 'LIKE', "%$query%")
                  ->orWhere('id_estudiante', 'LIKE', "%$query%");
            })
            ->select('id_estudiante', 'nombre', 'apellido_paterno', 'apellido_materno', 'grado', 'grupo')
            ->limit(10)
            ->get()
            ->map(function ($e) {
                return [
                    'id_estudiante' => $e->id_estudiante,
                    'nombre'        => trim($e->nombre . ' ' . $e->apellido_paterno . ' ' . $e->apellido_materno),
                    'grado'         => $e->grado,
                    'grupo'         => $e->grupo,
                ];
            });

        return response()->json($estudiantes);
    }

    // Devuelve los horarios disponibles de un formador en los próximos 7 días
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

    // Guarda una nueva cita solicitada desde el formulario público
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre_estudiante' => 'required|string|max:100',
                'usuario_id'        => 'required|integer|exists:usuarios,id_usuario,activo,1',
                'fecha'             => 'required|date',
                'hora'              => 'required|date_format:H:i',
            ]);

            // Busca al estudiante por su nombre completo (nombre + apellidos concatenados)
            $estudiante = DB::table('estudiantes')
                ->whereRaw(
                    "CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) = ?",
                    [$validated['nombre_estudiante']]
                )
                ->first();

            $formador = DB::table('usuarios')
                ->where('id_usuario', $validated['usuario_id'])
                ->first();

            $horaConSegundos = $validated['hora'] . ':00';

            $newId = DB::table('citas')->insertGetId([
                'id_estudiante'     => $estudiante ? $estudiante->id_estudiante : null,
                'nombre_estudiante' => $validated['nombre_estudiante'],
                'id_usuario'        => $validated['usuario_id'],
                'nombre_formador'   => $formador->nombre ?? null,
                'fecha'             => $validated['fecha'],
                'hora'              => $horaConSegundos,
                'notas'             => null,
                'asistencia'        => 'pendiente',
                'estado'            => 'programada',
            ]);

            try {
                $cita = DB::table('citas')->where('id_cita', $newId)->first();
                $whatsapp = new WhatsAppService();
                $whatsapp->sendConfirmation($cita);
            } catch (\Exception $e) {
                Log::warning('Error al enviar WhatsApp de confirmación: ' . $e->getMessage());
            }

            CacheInvalidator::indicadores();

            return response()->json([
                'success' => true,
                'message' => 'Cita solicitada exitosamente.'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error al guardar cita:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar: ' . $e->getMessage()
            ], 500);
        }
    }
}