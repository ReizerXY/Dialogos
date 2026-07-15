<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class UsuarioController extends Controller
{
    public function index()
    {
        $user = Session::get('user');
        $usuarios = DB::table('usuarios')->orderBy('id')->get();

        return inertia('Panel/Usuarios', [
            'user' => $user,
            'usuarios' => $usuarios,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'usuario' => 'required|string|max:50|unique:usuarios,usuario',
            'nombre' => 'required|string|max:100',
            'password' => 'required|string|min:4',
            'rol' => 'required|in:Coordinador,Formador',
        ]);

        // Obtener el último id y sumar 1 (para id manual)
        $lastId = DB::table('usuarios')->max('id') ?? 0;
        $newId = $lastId + 1;

        DB::table('usuarios')->insert([
            'id' => $newId,
            'usuario' => $validated['usuario'],
            'nombre' => $validated['nombre'],
            'password' => $validated['password'],
            'rol' => $validated['rol'],
        ]);

        return redirect()->route('usuarios.index')->with('success', 'Usuario creado exitosamente.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'usuario' => 'required|string|max:50|unique:usuarios,usuario,' . $id,
            'nombre' => 'required|string|max:100',
            'password' => 'nullable|string|min:4',
            'rol' => 'required|in:Coordinador,Formador',
        ]);

        $data = [
            'usuario' => $validated['usuario'],
            'nombre' => $validated['nombre'],
            'rol' => $validated['rol'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = $validated['password'];
        }

        DB::table('usuarios')
            ->where('id', $id)
            ->update($data);

        return redirect()->route('usuarios.index')->with('success', 'Usuario actualizado exitosamente.');
    }

    public function destroy($id)
    {
        // No permitir eliminar al usuario actual
        $user = Session::get('user');
        if ($user['id'] == $id) {
            return redirect()->route('usuarios.index')->with('error', 'No puedes eliminar tu propio usuario.');
        }

        // Verificar si tiene citas asociadas
        $hasCitas = DB::table('citas')->where('usuario_id', $id)->exists();
        if ($hasCitas) {
            return redirect()->route('usuarios.index')->with('error', 'No se puede eliminar el usuario porque tiene citas asociadas.');
        }

        DB::table('usuarios')->where('id', $id)->delete();

        return redirect()->route('usuarios.index')->with('success', 'Usuario eliminado exitosamente.');
    }
}