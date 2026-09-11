<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;

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
            'clave' => 'required|string',
        ]);

        $user = DB::table('usuarios')
            ->where('usuario', $credentials['usuario'])
            ->first();

        if (!$user || !Hash::check($credentials['clave'], $user->clave)) {
            return back()->withErrors([
                'usuario' => 'Usuario o clave incorrectos.',
            ]);
        }

        // ✅ Bloquear el acceso si el usuario está dado de baja
        if (isset($user->activo) && $user->activo == 0) {
            return back()->withErrors([
                'usuario' => 'Este usuario está dado de baja. Contacta al coordinador.',
            ]);
        }

        Session::put('user', (array) $user);

        if ($user->rol === 'Coordinador') {
            return redirect()->route('indicadores.index');
        } else {
            return redirect()->route('horarios.index');
        }
    }

    public function logout()
    {
        Session::forget('user');
        return redirect()->route('login');
    }
}