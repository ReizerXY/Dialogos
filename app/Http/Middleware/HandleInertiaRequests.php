<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Panel\EstudianteController;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Este proyecto guarda el usuario en sesión (no usa el guard de Laravel)
        $sessionUser = $request->session()->get('user');

        return [
            ...parent::share($request),

            // Lo compartimos tanto en raíz (lo lee AuthenticatedLayout) como en 'auth' (compatibilidad)
            'user' => $sessionUser,
            'auth' => [
                'user' => $sessionUser,
            ],

            // Solo Coordinadores reciben el estado de importación
            'alerta_importacion' => function () use ($sessionUser) {
                if (!$sessionUser || ($sessionUser['rol'] ?? null) !== 'Coordinador') {
                    return null;
                }
                return EstudianteController::estadoImportacion();
            },
        ];
    }
}