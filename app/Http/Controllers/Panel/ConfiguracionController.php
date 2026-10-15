<?php
// app/Http/Controllers/Panel/ConfiguracionController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class ConfiguracionController extends Controller
{
    private const DIAS_ANTICIPACION_DEFAULT = 1;
    private const DIAS_ANTICIPACION_MAX     = 15;
    private const MENSAJE_CIERRE_DEFAULT    = 'Por el momento no estamos agendando citas nuevas. Vuelve a intentarlo más tarde.';

    // Muestra la pagina de ajustes del sistema (solo Coordinador)
    public function index()
    {
        $user = Session::get('user');
        if (($user['rol'] ?? '') != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        // WhatsApp
        $configWA = DB::table('configuracion')->where('clave', 'whatsapp_activo')->first();
        $whatsappActivo = $configWA && (string) $configWA->valor === '1';

        // Solicitud de citas
        $configSC = DB::table('configuracion')->where('clave', 'solicitud_citas_activa')->first();
        $solicitudActiva = $configSC && (string) $configSC->valor === '1';

        // Modo mantenimiento
        $configMM = DB::table('configuracion')->where('clave', 'modo_mantenimiento')->first();
        $modoMantenimiento = $configMM && (string) $configMM->valor === '1';

        // Dias de anticipacion
        $diasAnticipacion = $this->leerDiasAnticipacion();

        // Mensaje de cierre de citas
        $mensajeCierreCitas = DB::table('configuracion')
            ->where('clave', 'mensaje_cierre_citas')
            ->value('valor') ?: self::MENSAJE_CIERRE_DEFAULT;

        return inertia('Panel/Configuracion', [
            'user'               => [
                'id_usuario' => $user['id_usuario'] ?? null,
                'usuario'    => $user['usuario'] ?? null,
                'nombre'     => $user['nombre'] ?? null,
                'rol'        => $user['rol'] ?? null,
            ],
            'whatsappActivo'     => $whatsappActivo,
            'solicitudActiva'    => $solicitudActiva,
            'modoMantenimiento'  => $modoMantenimiento,
            'diasAnticipacion'   => $diasAnticipacion,
            'mensajeCierreCitas' => $mensajeCierreCitas,
        ]);
    }

    // Alterna el estado global de WhatsApp
    public function toggleWhatsApp()
    {
        $user = Session::get('user');
        if (($user['rol'] ?? '') != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $config = DB::table('configuracion')->where('clave', 'whatsapp_activo')->first();
        $estadoAnterior = $config ? (string) $config->valor : null;
        $nuevoEstado = ($estadoAnterior === '1') ? '0' : '1';

        if ($config) {
            DB::table('configuracion')->where('clave', 'whatsapp_activo')->update([
                'valor' => $nuevoEstado,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('configuracion')->insert([
                'clave' => 'whatsapp_activo',
                'valor' => $nuevoEstado,
                'updated_at' => now(),
            ]);
        }

        Log::info('Configuracion cambiada', [
            'clave'        => 'whatsapp_activo',
            'valor_previo' => $estadoAnterior,
            'valor_nuevo'  => $nuevoEstado,
            'id_usuario'   => $user['id_usuario'] ?? null,
            'usuario'      => $user['usuario'] ?? null,
            'ip'           => request()->ip(),
        ]);

        $mensaje = $nuevoEstado === '1'
            ? 'Notificaciones por WhatsApp activadas.'
            : 'Notificaciones por WhatsApp desactivadas.';

        return redirect()->route('configuracion.index')->with('success', $mensaje);
    }

    // Alterna el estado global de solicitud de citas
    public function toggleSolicitudCitas()
    {
        $user = Session::get('user');
        if (($user['rol'] ?? '') != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $config = DB::table('configuracion')->where('clave', 'solicitud_citas_activa')->first();
        $estadoAnterior = $config ? (string) $config->valor : null;
        $nuevoEstado = ($estadoAnterior === '1') ? '0' : '1';

        if ($config) {
            DB::table('configuracion')->where('clave', 'solicitud_citas_activa')->update([
                'valor' => $nuevoEstado,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('configuracion')->insert([
                'clave' => 'solicitud_citas_activa',
                'valor' => $nuevoEstado,
                'updated_at' => now(),
            ]);
        }

        Log::info('Configuracion cambiada', [
            'clave'        => 'solicitud_citas_activa',
            'valor_previo' => $estadoAnterior,
            'valor_nuevo'  => $nuevoEstado,
            'id_usuario'   => $user['id_usuario'] ?? null,
            'usuario'      => $user['usuario'] ?? null,
            'ip'           => request()->ip(),
        ]);

        $mensaje = $nuevoEstado === '1'
            ? 'Solicitud de citas activada.'
            : 'Solicitud de citas desactivada.';

        return redirect()->route('configuracion.index')->with('success', $mensaje);
    }

    // Alterna el modo mantenimiento
    public function toggleMantenimiento()
    {
        $user = Session::get('user');
        if (($user['rol'] ?? '') != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $config = DB::table('configuracion')->where('clave', 'modo_mantenimiento')->first();
        $estadoAnterior = $config ? (string) $config->valor : null;
        $nuevoEstado = ($estadoAnterior === '1') ? '0' : '1';

        if ($config) {
            DB::table('configuracion')->where('clave', 'modo_mantenimiento')->update([
                'valor' => $nuevoEstado,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('configuracion')->insert([
                'clave' => 'modo_mantenimiento',
                'valor' => $nuevoEstado,
                'updated_at' => now(),
            ]);
        }

        Log::warning('Modo mantenimiento cambiado', [
            'valor_previo' => $estadoAnterior,
            'valor_nuevo'  => $nuevoEstado,
            'id_usuario'   => $user['id_usuario'] ?? null,
            'usuario'      => $user['usuario'] ?? null,
            'ip'           => request()->ip(),
        ]);

        $mensaje = $nuevoEstado === '1'
            ? 'Modo mantenimiento activado. Los usuarios verán el aviso.'
            : 'Modo mantenimiento desactivado.';

        return redirect()->route('configuracion.index')->with('success', $mensaje);
    }

    // Guarda los dias de anticipacion minima
    public function guardarDiasAnticipacion(Request $request)
    {
        $user = Session::get('user');
        if (($user['rol'] ?? '') != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'dias_anticipacion' => 'required|integer|min:0|max:' . self::DIAS_ANTICIPACION_MAX,
        ], [
            'dias_anticipacion.required' => 'Ingresa un número de días.',
            'dias_anticipacion.integer'  => 'Debe ser un número entero.',
            'dias_anticipacion.min'      => 'El valor mínimo es 0.',
            'dias_anticipacion.max'      => 'El valor máximo es ' . self::DIAS_ANTICIPACION_MAX . '.',
        ]);

        $nuevoValor = (string) (int) $request->dias_anticipacion;
        $estadoAnterior = DB::table('configuracion')->where('clave', 'dias_anticipacion')->value('valor');

        DB::table('configuracion')->updateOrInsert(
            ['clave' => 'dias_anticipacion'],
            ['valor' => $nuevoValor, 'updated_at' => now()]
        );

        Log::info('Configuracion cambiada', [
            'clave'        => 'dias_anticipacion',
            'valor_previo' => $estadoAnterior,
            'valor_nuevo'  => $nuevoValor,
            'id_usuario'   => $user['id_usuario'] ?? null,
            'usuario'      => $user['usuario'] ?? null,
            'ip'           => $request->ip(),
        ]);

        return redirect()->route('configuracion.index')
            ->with('success', 'Días de anticipación actualizados.');
    }

    // Guarda el mensaje personalizado de cierre de citas
    public function guardarMensajeCierre(Request $request)
    {
        $user = Session::get('user');
        if (($user['rol'] ?? '') != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'mensaje_cierre_citas' => 'required|string|max:500',
        ], [
            'mensaje_cierre_citas.required' => 'Escribe un mensaje.',
            'mensaje_cierre_citas.max'      => 'El mensaje no puede exceder 500 caracteres.',
        ]);

        $nuevoValor = trim($request->mensaje_cierre_citas);
        $estadoAnterior = DB::table('configuracion')->where('clave', 'mensaje_cierre_citas')->value('valor');

        DB::table('configuracion')->updateOrInsert(
            ['clave' => 'mensaje_cierre_citas'],
            ['valor' => $nuevoValor, 'updated_at' => now()]
        );

        Log::info('Configuracion cambiada', [
            'clave'        => 'mensaje_cierre_citas',
            'valor_previo' => $estadoAnterior,
            'valor_nuevo'  => $nuevoValor,
            'id_usuario'   => $user['id_usuario'] ?? null,
            'usuario'      => $user['usuario'] ?? null,
            'ip'           => $request->ip(),
        ]);

        return redirect()->route('configuracion.index')
            ->with('success', 'Mensaje de cierre actualizado.');
    }

    // Lee los dias de anticipacion configurados
    private function leerDiasAnticipacion(): int
    {
        try {
            $valor = DB::table('configuracion')
                ->where('clave', 'dias_anticipacion')
                ->value('valor');

            if ($valor === null) return self::DIAS_ANTICIPACION_DEFAULT;

            $dias = (int) $valor;
            if ($dias < 0) $dias = 0;
            if ($dias > self::DIAS_ANTICIPACION_MAX) $dias = self::DIAS_ANTICIPACION_MAX;

            return $dias;
        } catch (\Exception $e) {
            return self::DIAS_ANTICIPACION_DEFAULT;
        }
    }
}