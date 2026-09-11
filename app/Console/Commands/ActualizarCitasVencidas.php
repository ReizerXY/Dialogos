<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ActualizarCitasVencidas extends Command
{
    protected $signature = 'citas:vencer';
    protected $description = 'Cambia el estado de citas programadas a completadas si ya pasó la fecha y hora';

    public function handle()
    {
        $ahora = now();

        // Obtener citas programadas cuya fecha y hora ya pasaron
        $citas = DB::table('citas')
            ->where('estado', 'programada')
            ->where(function ($query) use ($ahora) {
                $query->where('fecha', '<', $ahora->toDateString())
                      ->orWhere(function ($q) use ($ahora) {
                          $q->where('fecha', '=', $ahora->toDateString())
                            ->where('hora', '<=', $ahora->toTimeString());
                      });
            })
            ->get();

        $count = 0;
        foreach ($citas as $cita) {
            DB::table('citas')
                ->where('id', $cita->id)
                ->update(['estado' => 'completada']);
            $count++;
        }

        Log::info("Citas vencidas actualizadas automáticamente: {$count} citas completadas.");
        $this->info("Se completaron {$count} citas vencidas.");
    }
}