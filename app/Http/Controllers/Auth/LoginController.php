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
    public function showLoginForm()
    {
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

        // Guardar usuario en sesión
        Session::put('user', (array) $user);

        // ✅ Guardar timestamp de inicio (para el sistema de inactividad)
        Session::put('last_activity_at', time());

        // Regenerar ID de sesión + token CSRF
        $request->session()->regenerate();

        // Inertia::location fuerza full reload para actualizar el meta tag CSRF
        if ($user->rol === 'Coordinador') {
            return Inertia::location(route('indicadores.index'));
        }
        return Inertia::location(route('horarios.index'));
    }

    public function logout(Request $request)
    {
        // Limpiar el usuario y el timestamp de actividad
        Session::forget('user');
        Session::forget('last_activity_at');

        // Invalidar sesión y regenerar token
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Inertia::location(route('login'));
    }
}