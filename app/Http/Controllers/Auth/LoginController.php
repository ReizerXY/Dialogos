<?php
// app/Http/Controllers/Auth/LoginController.php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class LoginController extends Controller
{
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

        $user = DB::table('usuarios')
            ->where('usuario', $credentials['usuario'])
            ->first();

        if (!$user || !Hash::check($credentials['clave'], $user->clave)) {
            return back()->withErrors([
                'usuario' => 'Usuario o clave incorrectos.',
            ]);
        }

        if (isset($user->activo) && $user->activo == 0) {
            return back()->withErrors([
                'usuario' => 'Este usuario está dado de baja. Contacta al coordinador.',
            ]);
        }

        Session::put('user', (array) $user);
        Session::put('last_activity_at', time());

        $request->session()->regenerate();

        if ($user->rol === 'Coordinador') {
            return Inertia::location(route('indicadores.index'));
        }
        return Inertia::location(route('horarios.index'));
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

    /**
     * Devuelve true si hay un usuario en sesión Y su última actividad
     * está dentro del tiempo permitido (SESSION_LIFETIME minutos).
     */
    private function tieneSesionActiva(): bool
    {
        if (!Session::has('user')) {
            return false;
        }

        $lastActivity = Session::get('last_activity_at');
        if (!$lastActivity) {
            // Sesión sin timestamp (de versiones viejas) → considerar inactiva
            Session::forget('user');
            return false;
        }

        $lifetimeSegundos = ((int) config('session.lifetime', 30)) * 60;
        $dentroDeTiempo = (time() - (int) $lastActivity) <= $lifetimeSegundos;

        if (!$dentroDeTiempo) {
            // Expiró por inactividad → limpiar
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

        $route = ($rol === 'Coordinador') ? 'indicadores.index' : 'horarios.index';
        return redirect()->route($route);
    }
}