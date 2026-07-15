<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;

class UsuarioController extends Controller
{
    /**
     * Listado de usuarios ordenados por rol y luego por id.
     */
    public function index()
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        $usuarios = DB::table('usuarios')
            ->orderByRaw("FIELD(rol, 'Coordinador', 'Formador')")
            ->orderBy('id', 'asc')
            ->get();

        return inertia('Panel/Usuarios', [
            'usuarios' => $usuarios,
            'user' => $user,
        ]);
    }

    /**
     * Crear un nuevo usuario (contraseña en texto plano → se hashea automáticamente)
     */
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

        $lastId = DB::table('usuarios')->max('id') ?? 0;
        $newId = $lastId + 1;

        DB::table('usuarios')->insert([
            'id' => $newId,
            'usuario' => $validated['usuario'],
            'clave' => Hash::make($validated['clave']), // ✅ Hash automático
            'nombre' => $validated['nombre'],
            'rol' => $validated['rol'],
        ]);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Actualizar un usuario existente (si se proporciona nueva contraseña, se hashea)
     */
    public function update(Request $request, $id)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'usuario' => 'required|string|max:50|unique:usuarios,usuario,' . $id,
            'clave' => 'nullable|string|min:4', // opcional
            'nombre' => 'required|string|max:100',
            'rol' => 'required|in:Coordinador,Formador',
        ]);

        $data = [
            'usuario' => $validated['usuario'],
            'nombre' => $validated['nombre'],
            'rol' => $validated['rol'],
        ];

        // Si se envió una nueva contraseña, se hashea y se guarda
        if (!empty($validated['clave'])) {
            $data['clave'] = Hash::make($validated['clave']); // ✅ Hash automático
        }

        DB::table('usuarios')
            ->where('id', $id)
            ->update($data);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Eliminar un usuario (solo si no tiene citas asociadas)
     */
    public function destroy($id)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $citas = DB::table('citas')->where('usuario_id', $id)->count();
        if ($citas > 0) {
            return redirect()->route('usuarios.index')
                ->with('error', 'No se puede eliminar el usuario porque tiene citas asociadas.');
        }

        DB::table('usuarios')->where('id', $id)->delete();

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario eliminado exitosamente.');
    }
}