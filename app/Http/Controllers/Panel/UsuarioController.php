<?php
// app/Http/Controllers/Panel/UsuarioController.php

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
            'clave'   => 'required|string|min:4',
            'nombre'  => 'required|string|max:100',
            'rol'     => 'required|in:Coordinador,Formador',
        ]);

        // ✅ MySQL asigna el id_usuario por AUTO_INCREMENT (thread-safe).
        //    No calculamos max(id) + 1 porque puede colisionar si dos
        //    coordinadores crean usuarios al mismo tiempo.
        DB::table('usuarios')->insert([
            'usuario' => $validated['usuario'],
            'clave'   => Hash::make($validated['clave']),
            'nombre'  => $validated['nombre'],
            'rol'     => $validated['rol'],
            'activo'  => 1,
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
            'clave'   => 'nullable|string|min:4',
            'nombre'  => 'required|string|max:100',
            'rol'     => 'required|in:Coordinador,Formador',
        ]);

        $data = [
            'usuario' => $validated['usuario'],
            'nombre'  => $validated['nombre'],
            'rol'     => $validated['rol'],
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

    /**
     * Eliminar un usuario definitivamente de la base de datos.
     *
     * Antes de borrarlo:
     * - Sus citas históricas conservan `nombre_formador` (snapshot), pero
     *   `id_usuario` se pone en NULL porque el usuario ya no existirá.
     * - Se eliminan sus horarios (no tiene sentido dejarlos huérfanos).
     *
     * No se permite eliminar al propio usuario en sesión, ni al usuario 'admin'.
     */
    public function destroy($id_usuario)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        if ((int) $id_usuario === (int) $user['id_usuario']) {
            return redirect()->route('usuarios.index')
                ->with('error', 'No puedes eliminarte a ti mismo.');
        }

        $usuario = DB::table('usuarios')->where('id_usuario', $id_usuario)->first();
        if (!$usuario) {
            return redirect()->route('usuarios.index')
                ->with('error', 'Usuario no encontrado.');
        }

        if ($usuario->usuario === 'admin') {
            return redirect()->route('usuarios.index')
                ->with('error', 'El usuario admin no puede ser eliminado.');
        }

        DB::transaction(function () use ($id_usuario) {
            // Conservar el histórico de citas: nombre_formador ya quedó guardado
            // al crear cada cita, así que solo desvinculamos el id.
            DB::table('citas')
                ->where('id_usuario', $id_usuario)
                ->update(['id_usuario' => null]);

            // Eliminar horarios del usuario (admin y propios usan la misma tabla)
            DB::table('horarios')
                ->where('id_usuario', $id_usuario)
                ->delete();

            // Eliminar el usuario
            DB::table('usuarios')
                ->where('id_usuario', $id_usuario)
                ->delete();
        });

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario eliminado permanentemente. Su historial de citas se conserva.');
    }
}