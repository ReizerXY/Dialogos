<?php
// app/Providers/RouteServiceProvider.php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Ruta a la que se redirige tras login (la usamos vía Inertia, pero por si acaso).
     */
    public const HOME = '/';

    public function boot(): void
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }

    protected function configureRateLimiting(): void
    {
        // ------------------------------------------------------------
        // Login público — 15 intentos por minuto POR IP
        // (suficiente para reintentos legítimos, sigue bloqueando fuerza bruta)
        // ------------------------------------------------------------
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(15)->by($request->ip());
        });

        // ------------------------------------------------------------
        // Solicitar cita (público) — 5 por minuto por IP
        // ------------------------------------------------------------
        RateLimiter::for('solicitar-cita', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // ------------------------------------------------------------
        // APIs públicas (verificar estudiante, disponibilidad) — 30/min por IP
        // ------------------------------------------------------------
        RateLimiter::for('api-publica', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });

        // ------------------------------------------------------------
        // Rutas autenticadas — 500 por minuto POR USUARIO
        //
        // Clave: usar id_usuario en vez de IP para que:
        //   - Cada usuario tenga su propio cupo.
        //   - Usuarios detrás del mismo proxy/NAT no se bloqueen entre sí.
        //   - Cambiar de pestaña / cerrar sesión / volver a entrar no te agote.
        //
        // Fallback a IP si no hay sesión (p. ej. durante logout).
        // ------------------------------------------------------------
        RateLimiter::for('autenticado', function (Request $request) {
            $user = Session::get('user');
            $key = $user['id_usuario'] ?? $request->ip();
            return Limit::perMinute(500)->by('user:' . $key);
        });
    }
}