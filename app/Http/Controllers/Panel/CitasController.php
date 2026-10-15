<?php
// app/Http/Controllers/Panel/CitasController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use App\Exports\CitasExport;
use App\Services\CacheInvalidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Maatwebsite\Excel\Facades\Excel;

class CitasController extends Controller
{
    // Lista de citas con todos los filtros aplicados
    public function index(Request $request)
    {
        $user = Session::get('user');
        if (!$user) {
            abort(403, 'No autorizado.');
        }

        $rol = $user['rol'];
        $usuarioId = $user['id_usuario'];

        $verTodas = ($rol === 'Formador') && ($request->get('todas') == 1);
        $soloLectura = $verTodas;

        $filtroFormador      = $request->get('formador');
        $filtroEstado        = $request->get('estado');
        $filtroClasificacion = $request->get('clasificacion');
        $filtroAsistencia    = $request->get('asistencia');
        $filtroFecha         = $request->get('fecha');
        $periodo             = $request->get('semana', 'actual');
        $filtroAnio          = $request->get('anio');
        $filtroMes           = $request->get('mes');
        $semanaValor         = $request->get('semana_valor');
        $filtroGrado         = $request->get('grado');
        $filtroGrupo         = $request->get('grupo');

        $query = DB::table('citas')->select('citas.*');

        // Si es Formador en su propia vista, solo ve sus citas
        if ($rol == 'Formador' && !$verTodas) {
            $query->where('citas.id_usuario', $usuarioId);
        } else {
            if ($filtroFormador) {
                $query->where('citas.id_usuario', $filtroFormador);
            }
        }

        if ($filtroEstado && in_array($filtroEstado, ['programada', 'cancelada', 'completada', 'cancelada_liberada'], true)) {
            $query->where('citas.estado', $filtroEstado);
        }

        if ($filtroClasificacion && in_array($filtroClasificacion, ['académica', 'familiar', 'emocional', 'espiritual', 'institucional'], true)) {
            $query->where('citas.clasificacion', $filtroClasificacion);
        }

        if ($filtroAsistencia && in_array($filtroAsistencia, ['pendiente', 'asistió', 'no asistió'], true)) {
            $query->where('citas.asistencia', $filtroAsistencia);
        }

        if ($filtroGrado || $filtroGrupo) {
            $qEst = DB::table('estudiantes')->select('id_estudiante');
            if ($filtroGrado) $qEst->where('grado', $filtroGrado);
            if ($filtroGrupo) $qEst->where('grupo', $filtroGrupo);
            $idsEstudiantes = $qEst->pluck('id_estudiante')->toArray();
            $query->whereIn('citas.id_estudiante', $idsEstudiantes ?: [0]);
        }

        // Filtros de fecha
        if ($semanaValor && preg_match('/^\d{4}-W\d{2}$/', $semanaValor)) {
            $year = substr($semanaValor, 0, 4);
            $week = substr($semanaValor, 6, 2);
            $fechaLunes   = (new \DateTime())->setISODate((int) $year, (int) $week, 1)->format('Y-m-d');
            $fechaDomingo = (new \DateTime())->setISODate((int) $year, (int) $week, 7)->format('Y-m-d');
            $query->whereBetween('citas.fecha', [$fechaLunes, $fechaDomingo]);
        } elseif ($filtroFecha && preg_match('/^\d{4}-\d{2}-\d{2}$/', $filtroFecha)) {
            $query->whereDate('citas.fecha', $filtroFecha);
        } elseif ($filtroMes && preg_match('/^\d{4}-\d{2}$/', $filtroMes)) {
            $parts = explode('-', $filtroMes);
            $query->whereYear('citas.fecha', (int) $parts[0])
                  ->whereMonth('citas.fecha', (int) $parts[1]);
        } elseif ($filtroAnio && preg_match('/^\d{4}$/', (string) $filtroAnio)) {
            $query->whereYear('citas.fecha', (int) $filtroAnio);
        } elseif ($periodo === 'actual') {
            if ($rol === 'Formador') {
                $query->where(function ($q) {
                    $q->whereBetween('citas.fecha', [
                            now()->toDateString(),
                            now()->addDays(7)->toDateString(),
                        ])
                      ->orWhere(function ($q2) {
                            $q2->where('citas.fecha', '<', now()->toDateString())
                               ->where('citas.estado', 'programada');
                        });
                });
            } else {
                $query->whereBetween('citas.fecha', [
                    now()->toDateString(),
                    now()->addDays(7)->toDateString(),
                ]);
            }
        }

        $citas = $query->orderBy('citas.fecha', 'asc')
                       ->orderBy('citas.hora', 'asc')
                       ->orderBy('citas.id_cita', 'asc')
                       ->get();

        $formadores = DB::table('usuarios')
            ->where('rol', 'Formador')
            ->where('visibilidad_usuario', 1)
            ->where('acceso_usuario', 1)
            ->select('id_usuario', 'nombre')
            ->get();

        $aniosDisponibles = DB::table('citas')
            ->select(DB::raw('DISTINCT YEAR(fecha) as anio'))
            ->orderBy('anio', 'desc')
            ->pluck('anio')
            ->toArray();

        $gradosActivos = DB::table('estudiantes')
            ->select('grado')->distinct()->orderBy('grado')
            ->pluck('grado')->toArray();

        $gruposPorGrado = [];
        foreach ($gradosActivos as $g) {
            $gruposPorGrado[$g] = DB::table('estudiantes')
                ->where('grado', $g)
                ->select('grupo')->distinct()->orderBy('grupo')
                ->pluck('grupo')->toArray();
        }

        return inertia('Panel/Citas', [
            'citas'            => $citas,
            'formadores'       => $formadores,
            'aniosDisponibles' => $aniosDisponibles,
            'gradosActivos'    => $gradosActivos,
            'gruposPorGrado'   => $gruposPorGrado,
            'filtros'          => [
                'formador'      => $filtroFormador,
                'estado'        => $filtroEstado,
                'clasificacion' => $filtroClasificacion,
                'asistencia'    => $filtroAsistencia,
                'fecha'         => $filtroFecha,
                'semana'        => $periodo,
                'anio'          => $filtroAnio,
                'mes'           => $filtroMes,
                'semana_valor'  => $semanaValor,
                'grado'         => $filtroGrado,
                'grupo'         => $filtroGrupo,
            ],
            'rol'         => $rol,
            'soloLectura' => $soloLectura,
            'user'        => $user,
        ]);
    }

    // Exporta citas a Excel, respetando filtros o seleccion manual
    public function exportarExcel(Request $request)
    {
        $user = Session::get('user');
        if (($user['rol'] ?? '') !== 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        $ids = $request->get('ids', []);
        if (!is_array($ids)) {
            $ids = [$ids];
        }
        $ids = array_values(array_filter(array_map('intval', $ids)));

        if (count($ids) > 2000) {
            abort(413, 'Seleccion demasiado grande. Maximo 2000 citas por exportacion.');
        }

        $orden = $request->get('orden', 'fecha');
        $orden = in_array($orden, ['fecha', 'id'], true) ? $orden : 'fecha';

        $query = DB::table('citas')->select('citas.*');

        if (!empty($ids)) {
            $query->whereIn('citas.id_cita', $ids);
        } else {
            $filtroFormador      = $request->get('formador');
            $filtroEstado        = $request->get('estado');
            $filtroClasificacion = $request->get('clasificacion');
            $filtroAsistencia    = $request->get('asistencia');
            $filtroFecha         = $request->get('fecha');
            $periodo             = $request->get('semana', 'actual');
            $filtroAnio          = $request->get('anio');
            $filtroMes           = $request->get('mes');
            $semanaValor         = $request->get('semana_valor');
            $filtroGrado         = $request->get('grado');
            $filtroGrupo         = $request->get('grupo');

            if ($filtroFormador)      $query->where('citas.id_usuario', $filtroFormador);
            if ($filtroEstado && in_array($filtroEstado, ['programada', 'cancelada', 'completada', 'cancelada_liberada'], true)) {
                $query->where('citas.estado', $filtroEstado);
            }
            if ($filtroClasificacion && in_array($filtroClasificacion, ['académica', 'familiar', 'emocional', 'espiritual', 'institucional'], true)) {
                $query->where('citas.clasificacion', $filtroClasificacion);
            }
            if ($filtroAsistencia && in_array($filtroAsistencia, ['pendiente', 'asistió', 'no asistió'], true)) {
                $query->where('citas.asistencia', $filtroAsistencia);
            }

            if ($filtroGrado || $filtroGrupo) {
                $qEst = DB::table('estudiantes')->select('id_estudiante');
                if ($filtroGrado) $qEst->where('grado', $filtroGrado);
                if ($filtroGrupo) $qEst->where('grupo', $filtroGrupo);
                $idsEst = $qEst->pluck('id_estudiante')->toArray();
                $query->whereIn('citas.id_estudiante', $idsEst ?: [0]);
            }

            if ($semanaValor && preg_match('/^\d{4}-W\d{2}$/', $semanaValor)) {
                $year = substr($semanaValor, 0, 4);
                $week = substr($semanaValor, 6, 2);
                $lun = (new \DateTime())->setISODate((int) $year, (int) $week, 1)->format('Y-m-d');
                $dom = (new \DateTime())->setISODate((int) $year, (int) $week, 7)->format('Y-m-d');
                $query->whereBetween('citas.fecha', [$lun, $dom]);
            } elseif ($filtroFecha && preg_match('/^\d{4}-\d{2}-\d{2}$/', $filtroFecha)) {
                $query->whereDate('citas.fecha', $filtroFecha);
            } elseif ($filtroMes && preg_match('/^\d{4}-\d{2}$/', $filtroMes)) {
                $parts = explode('-', $filtroMes);
                $query->whereYear('citas.fecha', (int) $parts[0])
                      ->whereMonth('citas.fecha', (int) $parts[1]);
            } elseif ($filtroAnio && preg_match('/^\d{4}$/', (string) $filtroAnio)) {
                $query->whereYear('citas.fecha', (int) $filtroAnio);
            } elseif ($periodo === 'actual') {
                $query->whereBetween('citas.fecha', [
                    now()->toDateString(),
                    now()->addDays(7)->toDateString(),
                ]);
            }
        }

        if ($orden === 'id') {
            $query->orderBy('citas.id_cita', 'asc');
        } else {
            $query->orderBy('citas.fecha', 'asc')
                  ->orderBy('citas.hora', 'asc')
                  ->orderBy('citas.id_cita', 'asc');
        }

        $citas = $query->get();

        Log::info('Exportacion de citas descargada', [
            'total'       => $citas->count(),
            'por_usuario' => $user['usuario'] ?? null,
            'ip'          => $request->ip(),
        ]);

        $nombreArchivo = 'Citas_Anahuac_' . now()->format('Y-m-d_H-i') . '.xlsx';

        return Excel::download(new CitasExport($citas), $nombreArchivo);
    }

    // Muestra la pantalla individual de gestion de una cita (solo Formador)
    public function show($id)
    {
        $user = Session::get('user');
        if (!$user) {
            abort(403, 'No autorizado.');
        }

        if ($user['rol'] != 'Formador') {
            abort(403, 'Solo los formadores pueden gestionar citas.');
        }

        $cita = DB::table('citas')->where('id_cita', $id)->first();

        if (!$cita) {
            abort(404, 'Cita no encontrada.');
        }

        if ($cita->id_usuario != $user['id_usuario']) {
            abort(403, 'No tienes permiso para gestionar esta cita.');
        }

        return inertia('Panel/GestionCita', [
            'cita' => $cita,
            'user' => $user,
        ]);
    }

    // Actualiza clasificacion, notas y asistencia
    public function actualizarNotas(Request $request, $id)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            $cita = DB::table('citas')->where('id_cita', $id)->first();

            if (!$cita) {
                return response()->json(['error' => 'Cita no encontrada'], 404);
            }

            if ($user['rol'] == 'Formador' && $cita->id_usuario != $user['id_usuario']) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            $validated = $request->validate([
                'clasificacion' => 'nullable|in:académica,familiar,emocional,espiritual,institucional',
                'notas'         => 'nullable|string|max:500',
                'asistencia'    => 'nullable|in:pendiente,asistió,no asistió',
            ]);

            $asistencia = $validated['asistencia'] ?? 'pendiente';
            $nuevoEstado = $this->calcularEstadoNotas($cita, $asistencia);

            DB::table('citas')
                ->where('id_cita', $id)
                ->update([
                    'clasificacion' => $validated['clasificacion'] ?? null,
                    'notas'         => $validated['notas'] ?? null,
                    'asistencia'    => $asistencia,
                    'estado'        => $nuevoEstado,
                ]);

            Log::info('Cita: notas actualizadas', [
                'id_cita'         => $id,
                'estado_anterior' => $cita->estado,
                'estado_nuevo'    => $nuevoEstado,
                'asistencia'      => $asistencia,
                'por_usuario'     => $user['usuario'] ?? null,
                'ip'              => $request->ip(),
            ]);

            CacheInvalidator::indicadores();

            return response()->json([
                'success' => true,
                'message' => 'Notas actualizadas correctamente.',
                'estado'  => $nuevoEstado,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error al actualizar notas:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error al guardar los cambios.'], 500);
        }
    }

    private function calcularEstadoNotas($cita, $asistencia)
    {
        if (in_array($cita->estado, ['cancelada', 'cancelada_liberada'], true)) {
            return $cita->estado;
        }

        $asistenciaRegistrada = in_array($asistencia, ['asistió', 'no asistió'], true);

        if ($asistenciaRegistrada) {
            return 'completada';
        }

        return 'programada';
    }

    // Modifica la fecha y hora de una cita
    public function modificarCita(Request $request, $id)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            $cita = DB::table('citas')->where('id_cita', $id)->first();

            if (!$cita) {
                return response()->json(['error' => 'Cita no encontrada'], 404);
            }

            if ($user['rol'] == 'Formador' && $cita->id_usuario != $user['id_usuario']) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            $validated = $request->validate([
                'fecha' => 'required|date|after_or_equal:today',
                'hora'  => 'required|date_format:H:i',
            ]);

            $horaConSegundos = $validated['hora'] . ':00';

            $existe = DB::table('citas')
                ->where('id_usuario', $cita->id_usuario)
                ->where('fecha', $validated['fecha'])
                ->where('hora', $horaConSegundos)
                ->where('id_cita', '!=', $id)
                ->whereIn('estado', ['programada', 'completada', 'cancelada'])
                ->exists();

            if ($existe) {
                return response()->json(['error' => 'Ya existe una cita en esa fecha y hora.'], 422);
            }

            $fechaAnterior = $cita->fecha;
            $horaAnterior  = $cita->hora;

            DB::table('citas')
                ->where('id_cita', $id)
                ->update([
                    'fecha' => $validated['fecha'],
                    'hora'  => $horaConSegundos,
                ]);

            Log::info('Cita modificada', [
                'id_cita'        => $id,
                'fecha_anterior' => $fechaAnterior,
                'fecha_nueva'    => $validated['fecha'],
                'hora_anterior'  => $horaAnterior,
                'hora_nueva'     => $horaConSegundos,
                'por_usuario'    => $user['usuario'] ?? null,
                'ip'             => $request->ip(),
            ]);

            try {
                $citaActualizada = DB::table('citas')->where('id_cita', $id)->first();
                \App\Jobs\SendWhatsAppJob::dispatch($citaActualizada, 'modificacion');
            } catch (\Exception $e) {
                Log::warning('Error al encolar WhatsApp de modificacion: ' . $e->getMessage());
            }

            CacheInvalidator::indicadores();

            return response()->json(['success' => true, 'message' => 'Cita modificada correctamente.']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error al modificar cita:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error al modificar la cita.'], 500);
        }
    }

    // Cancela una cita con o sin liberacion de horario
    public function cancelarCita(Request $request, $id)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            $cita = DB::table('citas')->where('id_cita', $id)->first();

            if (!$cita) {
                return response()->json(['error' => 'Cita no encontrada'], 404);
            }

            if ($user['rol'] == 'Formador' && $cita->id_usuario != $user['id_usuario']) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            if (in_array($cita->estado, ['cancelada', 'cancelada_liberada'])) {
                return response()->json(['error' => 'La cita ya esta cancelada.'], 422);
            }

            $request->validate([
                'nota_cancelacion' => 'nullable|string|max:500',
                'liberar_horario'  => 'nullable|boolean',
            ]);

            $notaCancelacion = trim((string) $request->get('nota_cancelacion', ''));
            $liberarHorario  = (int) $request->get('liberar_horario', 1) === 1;

            $nuevoEstado = $liberarHorario ? 'cancelada_liberada' : 'cancelada';

            $notaFinal = $cita->notas;
            if ($notaCancelacion !== '') {
                $notaFinal = $cita->notas
                    ? $cita->notas . "\n\n" . $notaCancelacion
                    : $notaCancelacion;
            }

            DB::table('citas')
                ->where('id_cita', $id)
                ->update([
                    'estado' => $nuevoEstado,
                    'notas'  => $notaFinal,
                ]);

            Log::warning('Cita cancelada', [
                'id_cita'         => $id,
                'estado_anterior' => $cita->estado,
                'estado_nuevo'    => $nuevoEstado,
                'nota'            => $notaCancelacion,
                'por_usuario'     => $user['usuario'] ?? null,
                'ip'              => $request->ip(),
            ]);

            try {
                $citaActualizada = DB::table('citas')->where('id_cita', $id)->first();
                \App\Jobs\SendWhatsAppJob::dispatch($citaActualizada, 'cancelacion');
            } catch (\Exception $e) {
                Log::warning('Error al encolar WhatsApp de cancelacion: ' . $e->getMessage());
            }

            CacheInvalidator::indicadores();

            return response()->json([
                'success' => true,
                'message' => $liberarHorario
                    ? 'Cita cancelada. El horario quedo disponible.'
                    : 'Cita cancelada. El horario quedo bloqueado.'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error al cancelar cita:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error al cancelar la cita.'], 500);
        }
    }

    // Devuelve las horas disponibles de un formador en una fecha
    public function disponibilidadParaModificar(Request $request)
    {
        $user = Session::get('user');
        if (!$user) {
            return response()->json([]);
        }

        $request->validate([
            'usuario_id' => 'nullable|integer',
            'fecha'      => 'nullable|date',
            'cita_id'    => 'nullable|integer',
        ]);

        $usuarioId = $request->get('usuario_id');
        $fecha     = $request->get('fecha');
        $citaId    = $request->get('cita_id');

        if (!$usuarioId || !$fecha) {
            return response()->json([]);
        }

        // Formador solo puede consultar su propia disponibilidad
        if ($user['rol'] === 'Formador' && (int) $usuarioId !== (int) $user['id_usuario']) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $diaSemana = strtolower(now()->parse($fecha)->locale('es')->dayName);

        $horarios = DB::table('horarios')
            ->where('id_usuario', $usuarioId)
            ->where('dia_semana', $diaSemana)
            ->pluck('hora_inicio')
            ->toArray();

        $citasOcupadas = DB::table('citas')
            ->where('id_usuario', $usuarioId)
            ->where('fecha', $fecha)
            ->whereIn('estado', ['programada', 'completada', 'cancelada'])
            ->when($citaId, function ($query, $citaId) {
                return $query->where('id_cita', '!=', $citaId);
            })
            ->pluck('hora')
            ->map(function ($hora) {
                return substr($hora, 0, 5);
            })
            ->toArray();

        $horasDisponibles = array_diff($horarios, $citasOcupadas);

        return response()->json(array_values($horasDisponibles));
    }

    // Actualiza una cita completa (version antigua)
    public function update(Request $request, $id)
    {
        $user = Session::get('user');
        if (!$user) {
            abort(403, 'No autorizado.');
        }

        $cita = DB::table('citas')->where('id_cita', $id)->first();

        if (!$cita) {
            abort(404);
        }

        if ($user['rol'] == 'Formador' && $cita->id_usuario != $user['id_usuario']) {
            abort(403);
        }

        $validated = $request->validate([
            'clasificacion' => 'nullable|in:académica,familiar,emocional,espiritual,institucional',
            'notas'         => 'nullable|string|max:2000',
            'asistencia'    => 'nullable|in:pendiente,asistió,no asistió',
            'estado'        => 'required|in:programada,cancelada,completada,cancelada_liberada',
        ]);

        $estadoAnterior = $cita->estado;

        DB::table('citas')
            ->where('id_cita', $id)
            ->update([
                'clasificacion' => $validated['clasificacion'] ?? null,
                'notas'         => $validated['notas'] ?? null,
                'asistencia'    => $validated['asistencia'] ?? 'pendiente',
                'estado'        => $validated['estado'],
            ]);

        Log::info('Cita actualizada (update)', [
            'id_cita'         => $id,
            'estado_anterior' => $estadoAnterior,
            'estado_nuevo'    => $validated['estado'],
            'por_usuario'     => $user['usuario'] ?? null,
            'ip'              => $request->ip(),
        ]);

        if (
            $estadoAnterior !== $validated['estado'] &&
            in_array($validated['estado'], ['cancelada', 'cancelada_liberada'])
        ) {
            try {
                $citaActualizada = DB::table('citas')->where('id_cita', $id)->first();
                \App\Jobs\SendWhatsAppJob::dispatch($citaActualizada, 'cancelacion');
            } catch (\Exception $e) {
                Log::warning('Error al encolar WhatsApp de cancelacion: ' . $e->getMessage());
            }
        }

        CacheInvalidator::indicadores();

        return redirect()->route('citas.index')->with('success', 'Cita actualizada exitosamente.');
    }
}