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
    private const VENTANA_SEGUNDOS = 300;

    // Muestra el formulario de login. Si ya hay sesion activa, redirige al panel.
    public function showLoginForm()
    {
        if ($this->tieneSesionActiva()) {
            return $this->redirectAlPanel();
        }

        return inertia('Auth/LoginCustom');
    }

    // Procesa el login. Regenera la sesion antes de guardar los datos del usuario.
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'usuario' => 'required|string|max:50',
            'clave'   => 'required|string|max:255',
        ], [
            'usuario.required' => 'Ingresa tu usuario.',
            'usuario.max'      => 'El usuario no es valido.',
            'clave.required'   => 'Ingresa tu clave.',
        ]);

        // Clave unica para el rate limiter: IP + usuario
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

        // Chequeo de acceso ANTES de contar como intento valido
        if ((int) $user->acceso_usuario === 0) {
            return back()->withErrors([
                'usuario' => 'Acceso deshabilitado. Contacta al coordinador del programa.',
            ]);
        }

        // Login exitoso: limpiar contador
        RateLimiter::clear($throttleKey);

        // Regenerar sesion (evita fijacion)
        $request->session()->regenerate();

        // Guardar SOLO los campos necesarios en sesion (NUNCA 'clave')
        Session::put('user', [
            'id_usuario'          => $user->id_usuario,
            'usuario'             => $user->usuario,
            'nombre'              => $user->nombre,
            'rol'                 => $user->rol,
            'visibilidad_usuario' => (int) $user->visibilidad_usuario,
        ]);
        Session::put('last_activity_at', time());

        Session::save();

        // Redireccion segun rol
        if ($user->rol === 'Coordinador') {
            return redirect()->route('indicadores.index');
        }
        return redirect()->route('citas.index');
    }

    // Cierra la sesion y vuelve al login.
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

    // Devuelve true si hay una sesion activa dentro del lifetime configurado.
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

    // Redirige al panel correspondiente segun el rol del usuario.
    private function redirectAlPanel()
    {
        $user = Session::get('user');
        $rol = $user['rol'] ?? '';

        $route = ($rol === 'Coordinador') ? 'indicadores.index' : 'citas.index';
        return redirect()->route($route);
    }
}