<?php
// app/Jobs/SendWhatsAppJob.php

namespace App\Jobs;

use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;               // 3 intentos
    public $backoff = [10, 30, 60];   // Esperas entre reintentos (segundos)

    protected $cita;
    protected $tipo;

    /**
     * @param object $cita  El objeto de la cita (stdClass de DB::table)
     * @param string $tipo  'confirmacion' | 'modificacion' | 'cancelacion'
     */
    public function __construct($cita, string $tipo)
    {
        $this->cita = $cita;
        $this->tipo = $tipo;
    }

    public function handle(): void
    {
        $whatsapp = new WhatsAppService();

        switch ($this->tipo) {
            case 'confirmacion':
                $whatsapp->sendConfirmation($this->cita);
                break;

            case 'modificacion':
                $whatsapp->sendModification($this->cita);
                break;

            case 'cancelacion':
                $whatsapp->sendCancellation($this->cita);
                break;

            default:
                Log::warning("SendWhatsAppJob: tipo desconocido '{$this->tipo}'");
        }
    }
}