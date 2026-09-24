<?php
// app/Http/Middleware/AuthenticateSession.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateSession
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1) Sin usuario en sesión → al login
        if (!Session::has('user')) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'No autenticado'], 401);
            }
            return redirect()->route('login');
        }

        // 2) Verificar inactividad (rolling session)
        $ultimaActividad = Session::get('last_activity_at');
        $lifetimeSegundos = ((int) config('session.lifetime', 30)) * 60;

        if ($ultimaActividad && (time() - (int) $ultimaActividad) > $lifetimeSegundos) {
            // Sesión expirada por inactividad → cerrar
            Session::forget('user');
            Session::forget('last_activity_at');
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->expectsJson()) {
                return response()->json(['error' => 'Sesión expirada'], 401);
            }
            return redirect()->route('login')->withErrors([
                'usuario' => 'Tu sesión expiró por inactividad. Vuelve a iniciar sesión.',
            ]);
        }

        // 3) ✅ Refrescar el timestamp: la sesión caduca a los 30 min
        //    de INACTIVIDAD, no desde el login.
        Session::put('last_activity_at', time());

        return $next($request);
    }
}