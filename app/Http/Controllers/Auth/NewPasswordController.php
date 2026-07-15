<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Display the password reset view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Here we will attempt to reset the user's password. If it is successful we
        // will update the password on an actual user model and persist it to the
        // database. Otherwise we will parse the error and return the response.
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        // If the password was successfully reset, we will redirect the user back to
        // the application's home authenticated view. If there is an error we can
        // redirect them back to where they came from with their error message.
        if ($status == Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Session::get('user');

        $cita = DB::table('citas')->where('id', $id)->first();
        if (!$cita) {
            abort(404);
        }

        if ($user['rol'] == 'Formador' && $cita->usuario_id != $user['id']) {
            abort(403);
        }

        $validated = $request->validate([
            'clasificacion' => 'nullable|in:académica,familiar,emocional,espiritual,institucional',
            'notas' => 'nullable|string',
            'asistencia' => 'nullable|in:pendiente,asistió,no asistió',
            'estado' => 'required|in:programada,cancelada,completada',
        ]);

        DB::table('citas')
            ->where('id', $id)
            ->update([
                'clasificacion' => $validated['clasificacion'] ?? null,
                'notas' => $validated['notas'] ?? null,
                'asistencia' => $validated['asistencia'] ?? 'pendiente',
                'estado' => $validated['estado'],
            ]);

        return redirect()->route('citas.index')->with('success', 'Cita actualizada exitosamente.');
    }
}
