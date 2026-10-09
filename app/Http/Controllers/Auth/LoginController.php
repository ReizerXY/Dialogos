<?php
// app/Http/Controllers/Auth/LoginController.php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    private const MAX_INTENTOS = 5;
    private const VENTANA_SEGUNDOS = 60;

    // Muestra el formulario de login.
    // Si ya hay una sesión activa (y no expirada), redirige al panel del usuario.
    public function showLoginForm()
    {
        if ($this->tieneSesionActiva()) {
            return $this->redirectAlPanel();
        }

        return inertia('Auth/LoginCustom');
    }

    // Procesa el login. Regenera la sesión antes de guardar los datos del usuario.
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'usuario' => 'required|string',
            'clave'   => 'required|string',
        ]);

        // Clave única para el rate limiter: IP + usuario.
        // Solo cuenta intentos FALLIDOS. Un login correcto limpia el contador.
        $throttleKey = 'login|' . $request->ip() . '|' . strtolower($credentials['usuario']);

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
            RateLimiter::hit($throttleKey, self::VENTANA_SEGUNDOS);
            return back()->withErrors([
                'usuario' => 'Usuario o clave incorrectos.',
            ]);
        }

        // ✅ Chequeo de acceso ANTES de contar como intento válido.
        //    No se incrementa el rate limiter porque las credenciales fueron correctas.
        if ((int) $user->acceso_usuario === 0) {
            return back()->withErrors([
                'usuario' => 'Acceso deshabilitado. Contacta al coordinador del programa.',
            ]);
        }

        // Login exitoso: limpiamos el contador
        RateLimiter::clear($throttleKey);

        // Orden correcto: regenerar primero, luego guardar, luego save()
        $request->session()->regenerate();

        Session::put('user', (array) $user);
        Session::put('last_activity_at', time());

        Session::save();

        // Redirección 302 estándar (más confiable que Inertia::location)
        if ($user->rol === 'Coordinador') {
            return redirect()->route('indicadores.index');
        }
        return redirect()->route('citas.index');
    }

    // Cierra la sesión y vuelve al login.
    public function logout(Request $request)
    {
        Session::forget('user');
        Session::forget('last_activity_at');

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    // ==================================================================
    // Helpers
    // ==================================================================

    // Devuelve true si hay una sesión activa dentro del lifetime configurado.
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

    // Redirige al panel correspondiente según el rol del usuario.
    private function redirectAlPanel()
    {
        $user = Session::get('user');
        $rol = $user['rol'] ?? '';

        $route = ($rol === 'Coordinador') ? 'indicadores.index' : 'citas.index';
        return redirect()->route($route);
    }
}