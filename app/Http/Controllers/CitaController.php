<?php
// app/Http/Controllers/CitaController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Services\CacheInvalidator;

class CitaController extends Controller
{
    private const DIAS_ANTICIPACION_DEFAULT = 1;
    private const DIAS_ANTICIPACION_MAX     = 15;
    private const DIAS_VENTANA_AGENDA       = 7;

    // Muestra el formulario publico para agendar cita
    public function index()
    {
        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->where('visibilidad_usuario', 1)
            ->where('acceso_usuario', 1)
            ->select('id_usuario', 'nombre')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id_usuario,
                    'nombre' => $item->nombre,
                ];
            })
            ->toArray();

        // Verificar si la solicitud de citas esta activa
        $configSC = DB::table('configuracion')->where('clave', 'solicitud_citas_activa')->first();
        $solicitudActiva = $configSC && (string) $configSC->valor === '1';

        // Leer dias de anticipacion configurados
        $diasAnticipacion = $this->leerDiasAnticipacion();

        return inertia('SolicitarCita', [
            'formadores'       => $formadores,
            'solicitudActiva'  => $solicitudActiva,
            'diasAnticipacion' => $diasAnticipacion,
        ]);
    }

    // Devuelve los horarios disponibles de un formador en la ventana de agenda
    public function disponibilidad(Request $request)
    {
        $formadorId = $request->get('formador_id');
        if (!$formadorId) {
            return response()->json([]);
        }

        // ✅ La ventana empieza en (hoy + diasAnticipacion) y dura 7 días
        $diasAnticipacion = $this->leerDiasAnticipacion();
        $hoy = now()->addDays($diasAnticipacion);
        $limite = $hoy->copy()->addDays(self::DIAS_VENTANA_AGENDA);

        $diasSemana = [];
        for ($i = 0; $i <= self::DIAS_VENTANA_AGENDA; $i++) {
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

    // Guarda una nueva cita solicitada desde el formulario publico
    public function store(Request $request)
    {
        // Verificar si la solicitud de citas esta activa
        $configSC = DB::table('configuracion')->where('clave', 'solicitud_citas_activa')->first();
        if (!$configSC || (string) $configSC->valor !== '1') {
            return response()->json([
                'success' => false,
                'message' => 'Las solicitudes de cita estan temporalmente deshabilitadas.'
            ], 403);
        }

        try {
            $mensajes = [
                'id_estudiante.required' => 'Ingresa tu ID de estudiante.',
                'id_estudiante.string'   => 'El ID de estudiante no es valido.',
                'id_estudiante.max'      => 'El ID de estudiante no puede tener mas de 10 caracteres.',
                'id_estudiante.exists'   => 'No se encontro ningun estudiante con ese ID. Verifica tu credencial.',
                'usuario_id.required'    => 'Selecciona un formador.',
                'usuario_id.integer'     => 'El formador seleccionado no es valido.',
                'usuario_id.exists'      => 'El formador seleccionado no esta disponible en este momento.',
                'fecha.required'         => 'Selecciona una fecha para tu cita.',
                'fecha.date'             => 'La fecha seleccionada no es valida.',
                'hora.required'          => 'Selecciona una hora para tu cita.',
                'hora.date_format'       => 'La hora seleccionada no tiene el formato correcto.',
            ];

            $atributos = [
                'id_estudiante' => 'ID de estudiante',
                'usuario_id'    => 'formador',
                'fecha'         => 'fecha',
                'hora'          => 'hora',
            ];

            $validated = $request->validate([
                'id_estudiante' => [
                    'required',
                    'string',
                    'max:10',
                    Rule::exists('estudiantes', 'id_estudiante'),
                ],
                'usuario_id' => [
                    'required',
                    'integer',
                    Rule::exists('usuarios', 'id_usuario')
                        ->where('visibilidad_usuario', 1)
                        ->where('acceso_usuario', 1),
                ],
                'fecha' => 'required|date',
                'hora'  => 'required|date_format:H:i',
            ], $mensajes, $atributos);

            $estudiante = DB::table('estudiantes')
                ->where('id_estudiante', $validated['id_estudiante'])
                ->first();

            if (!$estudiante) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontro al estudiante con ese ID.'
                ], 422);
            }

            $nombreCompleto = trim(
                $estudiante->nombre . ' ' .
                $estudiante->apellido_paterno . ' ' .
                $estudiante->apellido_materno
            );

            $formador = DB::table('usuarios')
                ->where('id_usuario', $validated['usuario_id'])
                ->first();

            $horaConSegundos = $validated['hora'] . ':00';

            $newId = DB::table('citas')->insertGetId([
                'id_estudiante'     => $estudiante->id_estudiante,
                'nombre_estudiante' => $nombreCompleto,
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
                \App\Jobs\SendWhatsAppJob::dispatch($cita, 'confirmacion');
            } catch (\Exception $e) {
                Log::warning('Error al encolar WhatsApp de confirmacion: ' . $e->getMessage());
            }

            CacheInvalidator::indicadores();

            return response()->json([
                'success' => true,
                'message' => 'Cita agendada exitosamente.'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error al guardar cita:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la solicitud. Intenta de nuevo.'
            ], 500);
        }
    }

    // Lee los dias de anticipacion minimos desde configuracion
    private function leerDiasAnticipacion(): int
    {
        try {
            $valor = DB::table('configuracion')
                ->where('clave', 'dias_anticipacion')
                ->value('valor');

            if ($valor === null) {
                return self::DIAS_ANTICIPACION_DEFAULT;
            }

            $dias = (int) $valor;
            if ($dias < 0) $dias = 0;
            if ($dias > self::DIAS_ANTICIPACION_MAX) $dias = self::DIAS_ANTICIPACION_MAX;

            return $dias;
        } catch (\Exception $e) {
            return self::DIAS_ANTICIPACION_DEFAULT;
        }
    }
}