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
        // LOGIN — 30 intentos por minuto por IP
        // ------------------------------------------------------------
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });

        // ------------------------------------------------------------
        // SOLICITAR CITA (público) — 60 por minuto por IP
        //
        // El colegio comparte una sola IP pública (NAT). Con un límite
        // bajo, varios estudiantes agendando al mismo tiempo se bloquean
        // entre sí. 60/min permite ~1 cita por segundo, suficiente para
        // picos de uso sin sacrificar protección contra bots.
        // ------------------------------------------------------------
        RateLimiter::for('solicitar-cita', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        // ------------------------------------------------------------
        // APIs PÚBLICAS — 60/min por IP
        // ------------------------------------------------------------
        RateLimiter::for('api-publica', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        // ------------------------------------------------------------
        // RUTAS AUTENTICADAS — 500/min POR USUARIO
        //
        // Usamos id_usuario como clave, no la IP, para que:
        //   - Cada usuario tenga su propio cupo.
        //   - Varios usuarios detrás del mismo proxy/NAT no se bloqueen.
        //   - Navegar entre pestañas/apartados no agote nada.
        // Fallback a IP si no hay sesión (por ejemplo durante logout).
        // ------------------------------------------------------------
        RateLimiter::for('autenticado', function (Request $request) {
            $user = Session::get('user');
            $key = $user['id_usuario'] ?? $request->ip();
            return Limit::perMinute(500)->by('user:' . $key);
        });
    }
}