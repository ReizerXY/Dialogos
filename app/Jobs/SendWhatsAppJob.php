<?php
// app/Jobs/SendWhatsAppJob.php

namespace App\Jobs;

use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SendWhatsAppJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [10, 30, 60];
    public $timeout = 30;

    protected $cita;
    protected $tipo;

    public function __construct($cita, string $tipo)
    {
        $this->cita = $cita;
        $this->tipo = $tipo;
    }

    // Envia el WhatsApp segun el tipo; omite si el envio global esta desactivado
    public function handle(): void
    {
        // 1) Verificar si WhatsApp esta activo globalmente
        $config = DB::table('configuracion')->where('clave', 'whatsapp_activo')->first();
        $activo = $config && (string) $config->valor === '1';

        if (!$activo) {
            Log::info("[SendWhatsAppJob] WhatsApp desactivado. Saltando envio tipo '{$this->tipo}'.");
            return;
        }

        // 2) Enviar el mensaje segun el tipo
        $whatsapp = new WhatsAppService();

        $enviado = match ($this->tipo) {
            'confirmacion' => $whatsapp->sendConfirmation($this->cita),
            'modificacion' => $whatsapp->sendModification($this->cita),
            'cancelacion'  => $whatsapp->sendCancellation($this->cita),
            default        => false,
        };

        // 3) Si fallo, lanzar excepcion SIN exponer datos personales
        if (!$enviado) {
            throw new \RuntimeException(
                "SendWhatsAppJob: no se pudo enviar WhatsApp tipo '{$this->tipo}' (id_cita={$this->cita->id_cita})."
            );
        }
    }

    // Se ejecuta cuando el job falla definitivamente (despues de los reintentos)
    public function failed(\Throwable $exception): void
    {
        Log::error('[SendWhatsAppJob] Fallo definitivo tras reintentos', [
            'id_cita' => $this->cita->id_cita ?? null,
            'tipo'    => $this->tipo,
            'error'   => $exception->getMessage(),
        ]);
    }
}