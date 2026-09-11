<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;

class UsuarioController extends Controller
{
    public function index()
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        $usuarios = DB::table('usuarios')
            ->select('id_usuario', 'usuario', 'nombre', 'rol', 'activo')
            ->orderByRaw("FIELD(rol, 'Coordinador', 'Formador')")
            ->orderBy('id_usuario', 'asc')
            ->get();

        return inertia('Panel/Usuarios', [
            'usuarios' => $usuarios,
            'user' => $user,
        ]);
    }

    public function store(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'usuario' => 'required|string|max:50|unique:usuarios,usuario',
            'clave' => 'required|string|min:4',
            'nombre' => 'required|string|max:100',
            'rol' => 'required|in:Coordinador,Formador',
        ]);

        $lastId = DB::table('usuarios')->max('id_usuario') ?? 0;
        $newId = $lastId + 1;

        DB::table('usuarios')->insert([
            'id_usuario' => $newId,
            'usuario' => $validated['usuario'],
            'clave' => Hash::make($validated['clave']),
            'nombre' => $validated['nombre'],
            'rol' => $validated['rol'],
            'activo' => 1,
        ]);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    public function update(Request $request, $id_usuario)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'usuario' => 'required|string|max:50|unique:usuarios,usuario,' . $id_usuario . ',id_usuario',
            'clave' => 'nullable|string|min:4',
            'nombre' => 'required|string|max:100',
            'rol' => 'required|in:Coordinador,Formador',
        ]);

        $data = [
            'usuario' => $validated['usuario'],
            'nombre' => $validated['nombre'],
            'rol' => $validated['rol'],
        ];

        if (!empty($validated['clave'])) {
            $data['clave'] = Hash::make($validated['clave']);
        }

        DB::table('usuarios')
            ->where('id_usuario', $id_usuario)
            ->update($data);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Dar de baja o reactivar un usuario.
     * activo = 0 → no puede iniciar sesión, pero sus citas se conservan.
     * activo = 1 → puede iniciar sesión normalmente.
     */
    public function toggleActivo($id_usuario)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // No permitir darse de baja a sí mismo
        if ((int) $id_usuario === (int) $user['id_usuario']) {
            return redirect()->route('usuarios.index')
                ->with('error', 'No puedes darte de baja a ti mismo.');
        }

        $usuario = DB::table('usuarios')->where('id_usuario', $id_usuario)->first();
        if (!$usuario) {
            return redirect()->route('usuarios.index')
                ->with('error', 'Usuario no encontrado.');
        }

        $nuevoEstado = $usuario->activo == 1 ? 0 : 1;

        DB::table('usuarios')
            ->where('id_usuario', $id_usuario)
            ->update(['activo' => $nuevoEstado]);

        $mensaje = $nuevoEstado == 1
            ? 'Usuario reactivado correctamente.'
            : 'Usuario dado de baja. Sus datos históricos se conservan.';

        return redirect()->route('usuarios.index')->with('success', $mensaje);
    }
}