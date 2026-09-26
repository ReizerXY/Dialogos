<?php
// app/Console/Commands/ActualizarCitasVencidas.php

namespace App\Console\Commands;

use App\Services\CacheInvalidator;
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

        // ✅ CORRECCIÓN: se usa una sola query UPDATE en lugar de un foreach.
        //    Además, antes se filtraba por la columna 'id' (inexistente);
        //    ahora se hace por 'id_cita'. El comando no funcionaba antes.
        $count = DB::table('citas')
            ->where('estado', 'programada')
            ->where(function ($query) use ($ahora) {
                $query->where('fecha', '<', $ahora->toDateString())
                      ->orWhere(function ($q) use ($ahora) {
                          $q->where('fecha', '=', $ahora->toDateString())
                            ->where('hora', '<=', $ahora->toTimeString());
                      });
            })
            ->update(['estado' => 'completada']);

        if ($count > 0) {
            // ✅ Invalidar el caché de Indicadores solo si algo cambió
            CacheInvalidator::indicadores();

            Log::info("Citas vencidas actualizadas automáticamente: {$count} citas completadas.");
            $this->info("Se completaron {$count} citas vencidas.");
        } else {
            $this->info("No había citas vencidas pendientes.");
        }
    }
}