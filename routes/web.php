<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Panel\MetricasController;
use App\Http\Controllers\Panel\HorarioController;
use App\Http\Controllers\Panel\CitaController as CitaPanelController;
use App\Http\Controllers\Panel\ExpedienteController;
use App\Http\Controllers\Panel\UsuarioController;
use App\Http\Controllers\Panel\HorarioAdminController;
use App\Http\Controllers\CitaController as CitaPublicController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Session;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// =============================================
// RUTAS PÚBLICAS (sin autenticación)
// =============================================

// Página de inicio
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

// Formulario público para solicitar cita
Route::get('/solicitar-cita', [CitaPublicController::class, 'index'])->name('cita.solicitar');
Route::post('/solicitar-cita', [CitaPublicController::class, 'store'])->name('cita.store');

// =============================================
// RUTAS DE API PÚBLICAS
// =============================================
Route::prefix('api')->group(function () {
    Route::get('/estudiantes', [CitaPublicController::class, 'estudiantes'])->name('api.estudiantes');
    Route::get('/disponibilidad', [CitaPublicController::class, 'disponibilidad'])->name('api.disponibilidad');
});

// =============================================
// AUTENTICACIÓN PERSONALIZADA (con throttle)
// =============================================

Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login'])
    ->middleware('throttle:5,1') // ✅ 5 intentos por minuto
    ->name('login.post');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// =============================================
// RUTAS PROTEGIDAS (requieren sesión activa)
// =============================================

Route::middleware(['auth.session'])->group(function () {

    // ---------- COORDINADOR ----------
    // Métricas (dashboard del coordinador)
    Route::get('/metricas', [MetricasController::class, 'index'])
        ->middleware('check.role:Coordinador')
        ->name('metricas.index');

    // Gestión de usuarios (solo coordinador)
    Route::prefix('usuarios')->middleware('check.role:Coordinador')->group(function () {
        Route::get('/', [UsuarioController::class, 'index'])->name('usuarios.index');
        Route::post('/', [UsuarioController::class, 'store'])->name('usuarios.store');
        Route::put('/{id}', [UsuarioController::class, 'update'])->name('usuarios.update');
        Route::delete('/{id}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');
    });

    // Modificar horarios (solo coordinador) - SIN columna id
    Route::prefix('admin/horarios')->middleware('check.role:Coordinador')->group(function () {
        Route::get('/', [HorarioAdminController::class, 'index'])->name('admin.horarios.index');
        Route::post('/', [HorarioAdminController::class, 'store'])->name('admin.horarios.store');
        Route::put('/{usuario_id}/{dia_semana}/{hora_inicio}', [HorarioAdminController::class, 'update'])->name('admin.horarios.update');
        Route::delete('/{usuario_id}/{dia_semana}/{hora_inicio}', [HorarioAdminController::class, 'destroy'])->name('admin.horarios.destroy');
    });

    // ---------- AMBOS ROLES (Coordinador y Formador) ----------

    // Horarios (solo consulta, con filtros)
    Route::get('/horarios', [HorarioController::class, 'index'])->name('horarios.index');

    // Gestión de citas (con permisos en el controlador)
    Route::prefix('citas')->group(function () {
        Route::get('/', [CitaPanelController::class, 'index'])->name('citas.index');
        Route::get('/{id}', [CitaPanelController::class, 'show'])->name('citas.show');
        Route::put('/{id}/notas', [CitaPanelController::class, 'actualizarNotas'])->name('citas.notas');
        Route::put('/{id}/modificar', [CitaPanelController::class, 'modificarCita'])->name('citas.modificar');
        Route::delete('/{id}/cancelar', [CitaPanelController::class, 'cancelarCita'])->name('citas.cancelar');
        Route::put('/{id}', [CitaPanelController::class, 'update'])->name('citas.update');
    });

    // Expediente de estudiantes (buscador + detalle)
    Route::get('/expediente', function () {
        return inertia('Panel/Expediente', [
            'estudiante' => null,
            'citas' => [],
            'totalCitas' => 0,
            'citasProgramadas' => 0,
            'citasCompletadas' => 0,
            'citasCanceladas' => 0,
            'user' => Session::get('user'),
        ]);
    })->name('expediente.index');

    Route::get('/expediente/{id}', [ExpedienteController::class, 'show'])->name('expediente.show');

    // API para autocompletado de estudiantes (usado por el buscador) - protegida
    Route::get('/api/expediente/estudiantes', [ExpedienteController::class, 'buscarEstudiantes'])
        ->name('api.expediente.estudiantes');
});