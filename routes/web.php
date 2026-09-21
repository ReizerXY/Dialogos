<?php
// routes/web.php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Panel\IndicadoresController;
use App\Http\Controllers\Panel\HorarioController;
use App\Http\Controllers\Panel\CitaController as CitaPanelController;
use App\Http\Controllers\Panel\ExpedienteController;
use App\Http\Controllers\Panel\UsuarioController;
use App\Http\Controllers\Panel\HorarioAdminController;
use App\Http\Controllers\Panel\EstudianteController;
use App\Http\Controllers\Panel\ReporteController;
use App\Http\Controllers\Panel\MiHorarioController;
use App\Http\Controllers\Panel\BackupController;
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

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('/solicitar-cita', [CitaPublicController::class, 'index'])->name('cita.solicitar');

// Limitar el POST de cita a 3 por minuto (evita spam masivo)
Route::post('/solicitar-cita', [CitaPublicController::class, 'store'])
    ->middleware('throttle:3,1')
    ->name('cita.store');

// APIs públicas sensibles — 10/min para evitar adivinar matrículas
Route::middleware('throttle:10,1')->group(function () {
    Route::get('/api/verificar-estudiante/{id_estudiante}', [CitaPublicController::class, 'verificarIdEstudiante']);
    Route::get('/api/estudiantes', [CitaPublicController::class, 'estudiantes'])->name('api.estudiantes');
    Route::get('/api/disponibilidad', [CitaPublicController::class, 'disponibilidad'])->name('api.disponibilidad');
});

// =============================================
// AUTENTICACIÓN PERSONALIZADA
// =============================================

Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1')->name('login.post');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// =============================================
// RUTAS PROTEGIDAS (requieren sesión activa)
// =============================================

Route::middleware(['auth.session', 'throttle:120,1'])->group(function () {

    // ---------- COORDINADOR ----------
    Route::get('/indicadores', [IndicadoresController::class, 'index'])
        ->middleware('check.role:Coordinador')
        ->name('indicadores.index');

    Route::get('/reportes', [ReporteController::class, 'index'])
        ->middleware('check.role:Coordinador')
        ->name('reportes.index');
    Route::get('/reportes/generar', [ReporteController::class, 'generarPDF'])
        ->middleware('check.role:Coordinador')
        ->name('reportes.generar');

    // ✅ Backups: página principal + descargas
    Route::get('/admin/backups', [BackupController::class, 'index'])
        ->middleware('check.role:Coordinador')
        ->name('admin.backups.index');

    Route::get('/admin/backup/citas', [BackupController::class, 'descargarCitas'])
        ->middleware('check.role:Coordinador')
        ->name('admin.backup.citas');

    Route::get('/admin/backup/completo', [BackupController::class, 'descargarCompleto'])
        ->middleware('check.role:Coordinador')
        ->name('admin.backup.completo');

    // Gestión de estudiantes
    Route::prefix('estudiantes')->middleware('check.role:Coordinador')->group(function () {
        Route::get('/', [EstudianteController::class, 'index'])->name('estudiantes.index');
        Route::post('/', [EstudianteController::class, 'store'])->name('estudiantes.store');
        Route::post('/importar', [EstudianteController::class, 'import'])->name('estudiantes.importar');
        Route::delete('/todos', [EstudianteController::class, 'destroyAll'])->name('estudiantes.destroyAll');
        Route::put('/{id_estudiante}', [EstudianteController::class, 'update'])->name('estudiantes.update');
        Route::delete('/{id_estudiante}', [EstudianteController::class, 'destroy'])->name('estudiantes.destroy');
    });

    // Gestión de usuarios
    Route::prefix('usuarios')->middleware('check.role:Coordinador')->group(function () {
        Route::get('/', [UsuarioController::class, 'index'])->name('usuarios.index');
        Route::post('/', [UsuarioController::class, 'store'])->name('usuarios.store');
        Route::put('/{id_usuario}', [UsuarioController::class, 'update'])->name('usuarios.update');
        Route::put('/{id_usuario}/toggle-activo', [UsuarioController::class, 'toggleActivo'])->name('usuarios.toggleActivo');
        Route::delete('/{id_usuario}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');
    });

    // Modificar horarios (coordinador)
    Route::prefix('admin/horarios')->middleware('check.role:Coordinador')->group(function () {
        Route::get('/', [HorarioAdminController::class, 'index'])->name('admin.horarios.index');
        Route::post('/', [HorarioAdminController::class, 'store'])->name('admin.horarios.store');
        Route::put('/{usuario_id}/{dia_semana}/{hora_inicio}', [HorarioAdminController::class, 'update'])->name('admin.horarios.update');
        Route::delete('/{usuario_id}/{dia_semana}/{hora_inicio}', [HorarioAdminController::class, 'destroy'])->name('admin.horarios.destroy');
    });

    // Gestionar mis propios horarios
    Route::prefix('mis-horarios')->middleware('check.role:Formador')->group(function () {
        Route::get('/', [MiHorarioController::class, 'index'])->name('mis-horarios.index');
        Route::post('/', [MiHorarioController::class, 'store'])->name('mis-horarios.store');
        Route::put('/{dia_semana}/{hora_inicio}', [MiHorarioController::class, 'update'])->name('mis-horarios.update');
        Route::delete('/{dia_semana}/{hora_inicio}', [MiHorarioController::class, 'destroy'])->name('mis-horarios.destroy');
    });

    // ---------- AMBOS ROLES ----------
    Route::get('/horarios', [HorarioController::class, 'index'])->name('horarios.index');

    Route::prefix('citas')->group(function () {
        Route::get('/', [CitaPanelController::class, 'index'])->name('citas.index');
        Route::get('/{id}', [CitaPanelController::class, 'show'])->name('citas.show');
        Route::put('/{id}/notas', [CitaPanelController::class, 'actualizarNotas'])->name('citas.notas');
        Route::put('/{id}/modificar', [CitaPanelController::class, 'modificarCita'])->name('citas.modificar');
        Route::delete('/{id}/cancelar', [CitaPanelController::class, 'cancelarCita'])->name('citas.cancelar');
        Route::put('/{id}', [CitaPanelController::class, 'update'])->name('citas.update');
    });

    Route::get('/api/disponibilidad-para-modificar', [CitaPanelController::class, 'disponibilidadParaModificar'])
        ->name('api.disponibilidad.modificar');

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

    Route::get('/expediente/{id_estudiante}', [ExpedienteController::class, 'show'])->name('expediente.show');

    Route::get('/api/expediente/estudiantes', [ExpedienteController::class, 'buscarEstudiantes'])
        ->name('api.expediente.estudiantes');
});