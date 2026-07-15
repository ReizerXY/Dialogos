<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class CheckRole
{
    public function handle(Request $request, Closure $next, $rol)
    {
        $user = Session::get('user');
        if (!$user) {
            return redirect()->route('login')->withErrors(['auth' => 'Sesión no encontrada']);
        }

        // Normalizar roles: convertir a minúsculas para comparación sin importar mayúsculas
        $userRol = strtolower($user['rol'] ?? '');
        $rolRequerido = strtolower($rol);

        if ($userRol !== $rolRequerido) {
            abort(403, "No autorizado. Tu rol es '{$user['rol']}', se requiere '{$rol}'.");
        }

        return $next($request);
    }
}