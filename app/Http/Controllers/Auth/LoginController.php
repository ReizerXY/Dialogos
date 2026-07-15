<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash; // 👈 Importante

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

        // Buscar usuario por nombre de usuario
        $user = DB::table('usuarios')
            ->where('usuario', $credentials['usuario'])
            ->first();

        // Verificar si existe y si la contraseña coincide con el hash
        if (!$user || !Hash::check($credentials['clave'], $user->clave)) {
            return back()->withErrors([
                'usuario' => 'Usuario o clave incorrectos.',
            ]);
        }

        Session::put('user', (array) $user);

        // Redirigir según rol
        if ($user->rol === 'Coordinador') {
            return redirect()->route('metricas.index');
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