<?php
// app/Http/Middleware/HandleInertiaRequests.php

namespace App\Http\Middleware;

use App\Http\Controllers\Panel\EstudianteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    // Devuelve la version de los assets para cache busting
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    // Comparte props globales con el frontend, filtrando datos sensibles
    public function share(Request $request): array
    {
        $sessionUser = $request->session()->get('user');

        // Solo exponemos campos NO sensibles. Nunca enviamos 'clave' al frontend.
        $userSafe = $sessionUser ? [
            'id_usuario'          => $sessionUser['id_usuario'] ?? null,
            'usuario'             => $sessionUser['usuario'] ?? null,
            'nombre'              => $sessionUser['nombre'] ?? null,
            'rol'                 => $sessionUser['rol'] ?? null,
            'visibilidad_usuario' => $sessionUser['visibilidad_usuario'] ?? null,
        ] : null;

        // Configuracion publica (para Welcome y otras paginas)
        $configPublica = $this->leerConfiguracionPublica();

        return [
            ...parent::share($request),

            'user' => $userSafe,
            'auth' => [
                'user' => $userSafe,
            ],

            // Flash messages (success / error) — Laravel los deja en la sesion tras un redirect
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],

            // Config publica para todas las paginas
            'solicitudCitasActiva' => $configPublica['solicitud_citas_activa'],
            'mensajeCierreCitas'   => $configPublica['mensaje_cierre_citas'],

            // Solo Coordinadores reciben el estado de importacion
            'alerta_importacion' => function () use ($userSafe) {
                if (!$userSafe || ($userSafe['rol'] ?? null) !== 'Coordinador') {
                    return null;
                }
                return EstudianteController::estadoImportacion();
            },
        ];
    }

    // Lee las claves publicas de configuracion (con fallback seguro)
    private function leerConfiguracionPublica(): array
    {
        $defaults = [
            'solicitud_citas_activa' => true,
            'mensaje_cierre_citas'   => 'Por el momento no estamos agendando citas nuevas. Vuelve a intentarlo más tarde.',
        ];

        try {
            $claves = ['solicitud_citas_activa', 'mensaje_cierre_citas'];
            $rows = DB::table('configuracion')
                ->whereIn('clave', $claves)
                ->pluck('valor', 'clave');

            return [
                'solicitud_citas_activa' => ($rows['solicitud_citas_activa'] ?? '1') === '1',
                'mensaje_cierre_citas'   => $rows['mensaje_cierre_citas'] ?? $defaults['mensaje_cierre_citas'],
            ];
        } catch (\Exception $e) {
            return $defaults;
        }
    }
}