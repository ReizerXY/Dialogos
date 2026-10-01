<?php
// app/Http/Controllers/Auth/LoginController.php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class LoginController extends Controller
{
    // Máximo de intentos FALLIDOS antes de bloquear
    private const MAX_INTENTOS = 5;
    // Ventana en segundos para contar intentos fallidos
    private const VENTANA_SEGUNDOS = 60;

    /**
     * Muestra el formulario de login.
     * Si ya hay una sesión activa (y no expirada), redirige al panel del usuario.
     */
    public function showLoginForm()
    {
        if ($this->tieneSesionActiva()) {
            return $this->redirectAlPanel();
        }

        return inertia('Auth/LoginCustom');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'usuario' => 'required|string',
            'clave'   => 'required|string',
        ]);

        // ✅ Clave única para el rate limiter: IP + usuario
        //    Solo cuenta intentos FALLIDOS. Un login correcto limpia el contador.
        $throttleKey = 'login|' . $request->ip() . '|' . strtolower($credentials['usuario']);

        // Bloqueo si ya acumuló demasiados fallos
        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_INTENTOS)) {
            $segundos = RateLimiter::availableIn($throttleKey);
            return back()->withErrors([
                'usuario' => "Demasiados intentos fallidos. Intenta de nuevo en {$segundos} segundos.",
            ]);
        }

        $user = DB::table('usuarios')
            ->where('usuario', $credentials['usuario'])
            ->first();

        if (!$user || !Hash::check($credentials['clave'], $user->clave)) {
            // ✅ Solo aquí contamos el intento (fallo de credenciales)
            RateLimiter::hit($throttleKey, self::VENTANA_SEGUNDOS);

            return back()->withErrors([
                'usuario' => 'Usuario o clave incorrectos.',
            ]);
        }

        // ✅ Login exitoso: limpiamos el contador de intentos fallidos
        RateLimiter::clear($throttleKey);

        // ✅ Ya NO bloqueamos el login si activo = 0. Un usuario con atención
        //    suspendida puede seguir ingresando a consultar y gestionar sus citas.
        Session::put('user', (array) $user);
        Session::put('last_activity_at', time());

        $request->session()->regenerate();

        // ✅ El Formador ahora entra directo a "Gestionar mis citas" (antes era horarios)
        if ($user->rol === 'Coordinador') {
            return Inertia::location(route('indicadores.index'));
        }
        return Inertia::location(route('citas.index'));
    }

    public function logout(Request $request)
    {
        Session::forget('user');
        Session::forget('last_activity_at');

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Inertia::location(route('login'));
    }

    // ==================================================================
    // Helpers
    // ==================================================================

    private function tieneSesionActiva(): bool
    {
        if (!Session::has('user')) {
            return false;
        }

        $lastActivity = Session::get('last_activity_at');
        if (!$lastActivity) {
            Session::forget('user');
            return false;
        }

        $lifetimeSegundos = ((int) config('session.lifetime', 30)) * 60;
        $dentroDeTiempo = (time() - (int) $lastActivity) <= $lifetimeSegundos;

        if (!$dentroDeTiempo) {
            Session::forget('user');
            Session::forget('last_activity_at');
            return false;
        }

        return true;
    }

    /**
     * Redirige al panel correspondiente según el rol del usuario.
     */
    private function redirectAlPanel()
    {
        $user = Session::get('user');
        $rol = $user['rol'] ?? '';

        // ✅ Formador ahora entra a "Gestionar mis citas"
        $route = ($rol === 'Coordinador') ? 'indicadores.index' : 'citas.index';
        return redirect()->route($route);
    }
}