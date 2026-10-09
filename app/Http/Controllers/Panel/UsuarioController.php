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
    // Lista todos los usuarios con sus dos banderas de estado
    public function index()
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            abort(403, 'No autorizado.');
        }

        $usuarios = DB::table('usuarios')
            ->select('id_usuario', 'usuario', 'nombre', 'rol', 'visibilidad_usuario', 'acceso_usuario')
            ->orderByRaw("FIELD(rol, 'Coordinador', 'Formador')")
            ->orderBy('id_usuario', 'asc')
            ->get();

        return inertia('Panel/Usuarios', [
            'usuarios' => $usuarios,
            'user' => $user,
        ]);
    }

    // Crea un usuario nuevo con ambos accesos habilitados
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
            'usuario'             => $validated['usuario'],
            'clave'               => Hash::make($validated['clave']),
            'nombre'              => $validated['nombre'],
            'rol'                 => $validated['rol'],
            'visibilidad_usuario' => 1,
            'acceso_usuario'      => 1,
        ]);

        CacheInvalidator::indicadores();

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    // Actualiza los datos de un usuario (sin tocar las banderas de estado)
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
     * Alterna la visibilidad de un Formador (aparecer o no en selectores de citas).
     *
     * SOLO aplica a Formadores. Un Coordinador no aparece en selectores de citas,
     * por lo que este flag no tiene sentido para ellos.
     */
    public function toggleVisibilidad($id_usuario)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        if ((int) $id_usuario === (int) $user['id_usuario']) {
            return redirect()->route('usuarios.index')
                ->with('error', 'No puedes cambiar tu propia visibilidad.');
        }

        $usuario = DB::table('usuarios')->where('id_usuario', $id_usuario)->first();
        if (!$usuario) {
            return redirect()->route('usuarios.index')
                ->with('error', 'Usuario no encontrado.');
        }

        if ($usuario->rol !== 'Formador') {
            return redirect()->route('usuarios.index')
                ->with('error', 'La visibilidad en citas solo aplica a Formadores.');
        }

        $nuevoEstado = $usuario->visibilidad_usuario == 1 ? 0 : 1;

        DB::table('usuarios')
            ->where('id_usuario', $id_usuario)
            ->update(['visibilidad_usuario' => $nuevoEstado]);

        CacheInvalidator::indicadores();

        $mensaje = $nuevoEstado == 1
            ? 'Formador visible. Volverá a aparecer al agendar nuevas citas.'
            : 'Formador oculto. Ya no aparecerá al agendar nuevas citas, pero puede seguir ingresando a la plataforma.';

        return redirect()->route('usuarios.index')->with('success', $mensaje);
    }

    /**
     * Alterna el acceso a la plataforma de un usuario.
     *
     * acceso_usuario = 0 → NO puede iniciar sesión (aunque sus credenciales sean correctas).
     * acceso_usuario = 1 → puede iniciar sesión con normalidad.
     */
public function toggleAcceso($id_usuario)
{
    $user = Session::get('user');
    if ($user['rol'] != 'Coordinador') {
        return response()->json(['error' => 'No autorizado'], 403);
    }

    if ((int) $id_usuario === (int) $user['id_usuario']) {
        return redirect()->route('usuarios.index')
            ->with('error', 'No puedes suspender tu propio acceso.');
    }

    $usuario = DB::table('usuarios')->where('id_usuario', $id_usuario)->first();
    if (!$usuario) {
        return redirect()->route('usuarios.index')
            ->with('error', 'Usuario no encontrado.');
    }

    $nuevoAcceso = $usuario->acceso_usuario == 1 ? 0 : 1;

    $data = ['acceso_usuario' => $nuevoAcceso];

    // ✅ Para Formadores: sincronizar visibilidad con el acceso
    if ($usuario->rol === 'Formador') {
        $data['visibilidad_usuario'] = $nuevoAcceso;
    }

    DB::table('usuarios')
        ->where('id_usuario', $id_usuario)
        ->update($data);

    CacheInvalidator::indicadores();

    if ($nuevoAcceso === 0) {
        $mensaje = $usuario->rol === 'Formador'
            ? 'Acceso suspendido. El formador tampoco aparecerá en los selectores de citas. Su sesión activa, si existe, seguirá vigente hasta que expire.'
            : 'Acceso suspendido. El usuario ya no podrá iniciar sesión (su sesión activa, si existe, seguirá vigente hasta que expire).';
    } else {
        $mensaje = $usuario->rol === 'Formador'
            ? 'Acceso restaurado. El formador vuelve a estar disponible para agendar citas.'
            : 'Acceso restaurado. El usuario podrá ingresar a la plataforma nuevamente.';
    }

    return redirect()->route('usuarios.index')->with('success', $mensaje);
}

    // Elimina un usuario y limpia sus referencias en citas y horarios
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