<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // ⛔ Desactivado: ya NO se auto-caducan las citas por paso del tiempo.
        //    El estado solo cambia manualmente desde el modal de Notas
        //    cuando el formador registra la asistencia.
        //    Para reactivarlo, descomenta la línea de abajo.
        //
        // $schedule->command('citas:vencer')->everyFiveMinutes();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}