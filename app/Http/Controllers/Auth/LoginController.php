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

        // Guardamos la sesión y regeneramos ID + token CSRF
        Session::put('user', (array) $user);
        $request->session()->regenerate();

        // ✅ Inertia::location fuerza un full reload del navegador,
        //    así el meta tag <meta name="csrf-token"> se actualiza
        //    con el token nuevo. Sin esto, el siguiente POST daría 419.
        if ($user->rol === 'Coordinador') {
            return Inertia::location(route('indicadores.index'));
        }
        return Inertia::location(route('horarios.index'));
    }

    public function logout(Request $request)
    {
        // Limpiar el usuario de nuestra sesión personalizada
        Session::forget('user');

        // Invalidar sesión y regenerar token
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // ✅ Full reload para que el meta tag CSRF se actualice.
        return Inertia::location(route('login'));
    }
}