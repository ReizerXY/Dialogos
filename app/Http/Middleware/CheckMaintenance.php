<?php
// app/Http/Middleware/CheckMaintenance.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenance
{
    // Rutas que siempre son accesibles, incluso en mantenimiento
    private const RUTAS_EXENTAS = [
        'login',
        'login/*',
        'logout',
        'ajustes',
        'ajustes/*',
        'build/*',
        'storage/*',
        'favicon*',
        'robots.txt',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        // 1) Rutas exentas (login, logout, assets, ajustes)
        foreach (self::RUTAS_EXENTAS as $patron) {
            if ($request->is($patron)) {
                return $next($request);
            }
        }

        // 2) Leer el flag de mantenimiento desde la BD
        $activo = false;
        try {
            $valor = DB::table('configuracion')
                ->where('clave', 'modo_mantenimiento')
                ->value('valor');
            $activo = $valor === '1';
        } catch (\Exception $e) {
            // Si la tabla no existe, dejar pasar (primer arranque)
            return $next($request);
        }

        // 3) Si no está activo, seguir normal
        if (!$activo) {
            return $next($request);
        }

        // 4) El Coordinador puede pasar aunque esté en mantenimiento
        $user = Session::get('user');
        if ($user && ($user['rol'] ?? '') === 'Coordinador') {
            return $next($request);
        }

        // 5) Bloquear con página de mantenimiento

        // 5.a) Requests JSON/AJAX → respuesta JSON
        if ($request->expectsJson()) {
            return response()->json([
                'error'   => 'mantenimiento',
                'message' => 'El sistema está en mantenimiento. Intenta más tarde.',
            ], 503);
        }

        // 5.b) Requests normales → página Inertia de mantenimiento
        Log::info('Acceso bloqueado por mantenimiento', [
            'url' => $request->fullUrl(),
            'ip'  => $request->ip(),
        ]);

        $response = Inertia::render('Mantenimiento')->toResponse($request);
        $response->setStatusCode(503);
        $response->headers->set('Retry-After', '3600');

        return $response;
    }
}