<?php
// app/Console/Commands/MantenimientoCommand.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MantenimientoCommand extends Command
{
    // Uso:
    //   php artisan sistema:mantenimiento on
    //   php artisan sistema:mantenimiento off
    //   php artisan sistema:mantenimiento status
    protected $signature = 'sistema:mantenimiento {accion : on | off | status}';

    protected $description = 'Activa, desactiva o consulta el modo mantenimiento del sistema';

    public function handle(): int
    {
        $accion = strtolower($this->argument('accion'));

        // Leer estado actual
        $actual = DB::table('configuracion')
            ->where('clave', 'modo_mantenimiento')
            ->value('valor') ?? '0';

        $activoActual = $actual === '1';

        // ---- STATUS ----
        if ($accion === 'status') {
            $this->line('');
            if ($activoActual) {
                $this->warn('  Estado: MANTENIMIENTO ACTIVO');
                $this->line('  Los usuarios ven la pagina de aviso.');
            } else {
                $this->info('  Estado: Sistema operativo normal');
                $this->line('  Los usuarios pueden usar el sistema.');
            }
            $this->line('');
            return self::SUCCESS;
        }

        // ---- ON ----
        if ($accion === 'on') {
            if ($activoActual) {
                $this->warn('El modo mantenimiento ya estaba activo.');
                return self::SUCCESS;
            }

            if (!$this->confirm('¿Activar el modo mantenimiento ahora?', true)) {
                $this->line('Operacion cancelada.');
                return self::SUCCESS;
            }

            $this->setValor('1');

            Log::warning('Modo mantenimiento ACTIVADO via comando artisan', [
                'ip' => '127.0.0.1 (CLI)',
            ]);

            $this->info('');
            $this->info('  Modo mantenimiento ACTIVADO');
            $this->line('  Los usuarios veran la pagina de aviso.');
            $this->line('  Tu, como Coordinador, sigues teniendo acceso completo.');
            $this->info('');
            return self::SUCCESS;
        }

        // ---- OFF ----
        if ($accion === 'off') {
            if (!$activoActual) {
                $this->warn('El modo mantenimiento ya estaba desactivado.');
                return self::SUCCESS;
            }

            $this->setValor('0');

            Log::info('Modo mantenimiento DESACTIVADO via comando artisan', [
                'ip' => '127.0.0.1 (CLI)',
            ]);

            $this->info('');
            $this->info('  Modo mantenimiento DESACTIVADO');
            $this->line('  Los usuarios pueden volver a usar el sistema.');
            $this->info('');
            return self::SUCCESS;
        }

        // ---- Accion desconocida ----
        $this->error("Accion desconocida: '{$accion}'. Usa: on | off | status");
        return self::FAILURE;
    }

    // Guarda el valor en la tabla configuracion
    private function setValor(string $valor): void
    {
        DB::table('configuracion')->updateOrInsert(
            ['clave' => 'modo_mantenimiento'],
            ['valor' => $valor, 'updated_at' => now()]
        );
    }
}