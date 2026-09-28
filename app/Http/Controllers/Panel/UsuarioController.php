<?php
// app/Http/Controllers/Panel/UsuarioController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use App\Services\CacheInvalidator;

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

        DB::table('usuarios')->insert([
            'usuario' => $validated['usuario'],
            'clave'   => Hash::make($validated['clave']),
            'nombre'  => $validated['nombre'],
            'rol'     => $validated['rol'],
            'activo'  => 1,
        ]);

        CacheInvalidator::indicadores();

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

        CacheInvalidator::indicadores();

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Dar de baja o reactivar un usuario.
     *
     * COMPORTAMIENTO ACTUAL:
     *   activo = 0 → el usuario PUEDE iniciar sesión y ver sus citas,
     *                pero NO aparece en los selectores al agendar nuevas citas.
     *   activo = 1 → el usuario aparece normalmente y puede recibir nuevas citas.
     *
     * Esto aplica a:
     *   - Formadores: no aparecen en el formulario público de agendar cita
     *     ni en el modal de modificar cita.
     *   - Coordinadores: no aparecen como opción para asignar horarios en
     *     admin/horarios (por consistencia).
     */
    public function toggleActivo($id_usuario)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

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

        CacheInvalidator::indicadores();

        $mensaje = $nuevoEstado == 1
            ? 'Usuario reactivado. Volverá a aparecer al agendar nuevas citas.'
            : 'Usuario dado de baja. Ya no aparecerá al agendar nuevas citas, pero puede seguir ingresando a la plataforma para consultar sus citas e históricos.';

        return redirect()->route('usuarios.index')->with('success', $mensaje);
    }

    /**
     * Eliminar un usuario definitivamente de la base de datos.
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
            DB::table('citas')
                ->where('id_usuario', $id_usuario)
                ->update(['id_usuario' => null]);

            DB::table('horarios')
                ->where('id_usuario', $id_usuario)
                ->delete();

            DB::table('usuarios')
                ->where('id_usuario', $id_usuario)
                ->delete();
        });

        CacheInvalidator::indicadores();

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario eliminado permanentemente. Su historial de citas se conserva.');
    }
}