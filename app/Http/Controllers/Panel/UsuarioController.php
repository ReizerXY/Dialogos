<?php
// app/Http/Controllers/Panel/UsuarioController.php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use App\Services\CacheInvalidator;
use App\Services\SnapshotService;  

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
            'user'     => $user,
        ]);
    }

    // Crea un usuario nuevo (con auditoria)
    public function store(Request $request)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'usuario' => 'required|string|max:50|unique:usuarios,usuario',
            'clave'   => 'required|string|min:8',
            'nombre'  => 'required|string|max:100',
            'rol'     => 'required|in:Coordinador,Formador',
        ], [
            'usuario.unique' => 'Ese nombre de usuario ya existe.',
            'clave.min'      => 'La clave debe tener al menos 8 caracteres.',
        ]);

        $idNuevo = DB::table('usuarios')->insertGetId([
            'usuario'             => $validated['usuario'],
            'clave'               => Hash::make($validated['clave']),
            'nombre'              => $validated['nombre'],
            'rol'                 => $validated['rol'],
            'visibilidad_usuario' => 1,
            'acceso_usuario'      => 1,
        ]);

        Log::info('Usuario creado', [
            'id_nuevo'      => $idNuevo,
            'usuario_nuevo' => $validated['usuario'],
            'rol_nuevo'     => $validated['rol'],
            'por_usuario'   => $user['usuario'] ?? null,
            'ip'            => $request->ip(),
        ]);

        CacheInvalidator::indicadores();

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    // Actualiza un usuario existente (con auditoria)
    public function update(Request $request, $id_usuario)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'usuario' => 'required|string|max:50|unique:usuarios,usuario,' . $id_usuario . ',id_usuario',
            'clave'   => 'nullable|string|min:8',
            'nombre'  => 'required|string|max:100',
            'rol'     => 'required|in:Coordinador,Formador',
        ], [
            'usuario.unique' => 'Ese nombre de usuario ya existe.',
            'clave.min'      => 'La clave debe tener al menos 8 caracteres.',
        ]);

        $usuarioAnterior = DB::table('usuarios')->where('id_usuario', $id_usuario)->first();
        if (!$usuarioAnterior) {
            return redirect()->route('usuarios.index')->with('error', 'Usuario no encontrado.');
        }

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

        Log::info('Usuario actualizado', [
            'id_usuario'      => $id_usuario,
            'usuario_previo'  => $usuarioAnterior->usuario,
            'usuario_nuevo'   => $validated['usuario'],
            'rol_previo'      => $usuarioAnterior->rol,
            'rol_nuevo'       => $validated['rol'],
            'clave_cambiada'  => !empty($validated['clave']),
            'por_usuario'     => $user['usuario'] ?? null,
            'ip'              => $request->ip(),
        ]);

        CacheInvalidator::indicadores();

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    // Alterna la visibilidad de un formador en los selectores de citas
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
            return redirect()->route('usuarios.index')->with('error', 'Usuario no encontrado.');
        }

        if ($usuario->rol !== 'Formador') {
            return redirect()->route('usuarios.index')
                ->with('error', 'La visibilidad en citas solo aplica a Formadores.');
        }

        $nuevoEstado = $usuario->visibilidad_usuario == 1 ? 0 : 1;

        DB::table('usuarios')
            ->where('id_usuario', $id_usuario)
            ->update(['visibilidad_usuario' => $nuevoEstado]);

        Log::info('Visibilidad de formador cambiada', [
            'id_usuario'   => $id_usuario,
            'usuario'      => $usuario->usuario,
            'nuevo_estado' => $nuevoEstado,
            'por_usuario'  => $user['usuario'] ?? null,
            'ip'           => request()->ip(),
        ]);

        CacheInvalidator::indicadores();

        $mensaje = $nuevoEstado == 1
            ? 'Formador visible. Volvera a aparecer al agendar nuevas citas.'
            : 'Formador oculto. Ya no aparecera al agendar nuevas citas, pero puede seguir ingresando a la plataforma.';

        return redirect()->route('usuarios.index')->with('success', $mensaje);
    }

    // Alterna el acceso de un usuario a la plataforma
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
            return redirect()->route('usuarios.index')->with('error', 'Usuario no encontrado.');
        }

        $nuevoAcceso = $usuario->acceso_usuario == 1 ? 0 : 1;

        $data = ['acceso_usuario' => $nuevoAcceso];

        if ($usuario->rol === 'Formador') {
            $data['visibilidad_usuario'] = $nuevoAcceso;
        }

        DB::table('usuarios')
            ->where('id_usuario', $id_usuario)
            ->update($data);

        Log::info('Acceso de usuario cambiado', [
            'id_usuario'   => $id_usuario,
            'usuario'      => $usuario->usuario,
            'rol'          => $usuario->rol,
            'nuevo_acceso' => $nuevoAcceso,
            'por_usuario'  => $user['usuario'] ?? null,
            'ip'           => request()->ip(),
        ]);

        CacheInvalidator::indicadores();

        if ($nuevoAcceso === 0) {
            $mensaje = $usuario->rol === 'Formador'
                ? 'Acceso suspendido. El formador tampoco aparecera en los selectores de citas.'
                : 'Acceso suspendido. El usuario ya no podra iniciar sesion.';
        } else {
            $mensaje = $usuario->rol === 'Formador'
                ? 'Acceso restaurado. El formador vuelve a estar disponible para agendar citas.'
                : 'Acceso restaurado. El usuario podra ingresar a la plataforma nuevamente.';
        }

        return redirect()->route('usuarios.index')->with('success', $mensaje);
    }

    // Elimina un usuario (con auditoria)
    public function destroy($id_usuario)
    {
        $user = Session::get('user');
        if ($user['rol'] != 'Coordinador') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        if ((int) $id_usuario === (int) $user['id_usuario']) {
            return redirect()->route('usuarios.index')->with('error', 'No puedes eliminarte a ti mismo.');
        }

        $usuario = DB::table('usuarios')->where('id_usuario', $id_usuario)->first();
        if (!$usuario) {
            return redirect()->route('usuarios.index')->with('error', 'Usuario no encontrado.');
        }

        // Verificar que no sea el ultimo Coordinador
        if ($usuario->rol === 'Coordinador') {
            $totalCoordinadores = DB::table('usuarios')->where('rol', 'Coordinador')->count();
            if ($totalCoordinadores <= 1) {
                return redirect()->route('usuarios.index')
                    ->with('error', 'No puedes eliminar al ultimo Coordinador del sistema.');
            }
        }

        // Snapshot antes de eliminar
        SnapshotService::crear('eliminar_usuario', [
            'id_usuario' => $id_usuario,
            'usuario'    => $usuario->usuario,
            'rol'        => $usuario->rol,
        ]);

        DB::transaction(function () use ($id_usuario) {
            DB::table('citas')->where('id_usuario', $id_usuario)->update(['id_usuario' => null]);
            DB::table('horarios')->where('id_usuario', $id_usuario)->delete();
            DB::table('usuarios')->where('id_usuario', $id_usuario)->delete();
        });

        Log::info('Usuario eliminado', [
            'id_usuario_eliminado' => $id_usuario,
            'usuario_eliminado'    => $usuario->usuario,
            'rol_eliminado'        => $usuario->rol,
            'por_usuario'          => $user['usuario'] ?? null,
            'ip'                   => request()->ip(),
        ]);

        CacheInvalidator::indicadores();

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario eliminado permanentemente. Su historial de citas se conserva.');
    }
}