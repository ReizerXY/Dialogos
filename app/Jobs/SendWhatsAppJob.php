<?php
// app/Jobs/SendWhatsAppJob.php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
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

    public function handle(): void
    {
        // 1) Verificar toggle
        $config = DB::table('configuracion')->where('clave', 'whatsapp_activo')->first();
        if (!$config || (string) $config->valor !== '1') {
            Log::info("[ZavuJob] Desactivado en DB. Skip tipo '{$this->tipo}'.");
            return;
        }

        // 2) Idempotencia
        $columna = match ($this->tipo) {
            'confirmacion' => 'whatsapp_confirmacion_enviada_at',
            'modificacion' => 'whatsapp_modificacion_enviada_at',
            'cancelacion'  => 'whatsapp_cancelacion_enviada_at',
            default        => null,
        };

        if ($columna && DB::table('citas')->where('id_cita', $this->cita->id_cita)->value($columna)) {
            Log::info("[ZavuJob] Ya enviado tipo '{$this->tipo}'. Skip.");
            return;
        }

        // 3) Seleccionar Template ID
        $templateId = config("services.zavu.templates.{$this->tipo}");
        if (!$templateId) {
            Log::error("[ZavuJob] No hay Template ID configurado para el tipo '{$this->tipo}'.");
            return;
        }

        // 4) OBTENER EL TELÉFONO CORRECTO DESDE LA TABLA ESTUDIANTES
        $estudiante = DB::table('estudiantes')
            ->where('id_estudiante', $this->cita->id_estudiante)
            ->first();

        if (!$estudiante || empty($estudiante->contacto)) {
            Log::error("[ZavuJob] No se encontró teléfono para el estudiante ID: {$this->cita->id_estudiante}");
            return; // No podemos enviar sin número
        }

        // Limpiar el número y asegurar formato E.164 (+521 + 10 dígitos)
        $numeroLimpio = preg_replace('/\D/', '', $estudiante->contacto);
        
        // Si el número ya tiene 12 o 13 dígitos (con 52), lo usamos tal cual; si tiene 10, le agregamos 521.
        if (strlen($numeroLimpio) === 10) {
            $telefono = '+521' . $numeroLimpio;
        } elseif (strlen($numeroLimpio) === 12 && str_starts_with($numeroLimpio, '52')) {
            $telefono = '+' . $numeroLimpio;
        } elseif (strlen($numeroLimpio) === 13 && str_starts_with($numeroLimpio, '521')) {
            $telefono = '+' . $numeroLimpio;
        } else {
            $telefono = '+' . $numeroLimpio; // Fallback
        }

        // 5) Enviar con Http de Laravel
        try {
            $variables = match ($this->tipo) {
                'confirmacion', 'modificacion' => [
                    '1' => $this->cita->nombre_estudiante,
                    '2' => $this->cita->fecha,
                    '3' => substr($this->cita->hora, 0, 5),
                    '4' => $this->cita->nombre_formador ?? 'Formador',
                ],
                'cancelacion' => [
                    '1' => $this->cita->nombre_estudiante,
                    '2' => $this->cita->fecha,
                    '3' => substr($this->cita->hora, 0, 5),
                ],
                default => []
            };

            $response = Http::withToken(config('services.zavu.api_key'))
                ->withHeaders(['Zavu-Sender' => config('services.zavu.sender_id')])
                ->post('https://api.zavu.dev/v1/messages', [
                    'to' => $telefono,
                    'messageType' => 'template',
                    'content' => [
                        'templateId' => $templateId,
                        'templateVariables' => $variables,
                    ],
                    'attachments' => [] 
                ]);

            if ($response->successful()) {
                $msgId = $response->json('message.id') ?? 'N/A';
                Log::info("[ZavuJob] Mensaje encolado a {$telefono} tipo '{$this->tipo}'. ID: {$msgId}");

                if ($columna) {
                    DB::table('citas')->where('id_cita', $this->cita->id_cita)->update([$columna => now()]);
                }
            } else {
                Log::error("[ZavuJob] Error de Zavu (" . $response->status() . "): " . $response->body());
                throw new \RuntimeException("Fallo en API de Zavu");
            }

        } catch (\Exception $e) {
            Log::error("[ZavuJob] Excepción: " . $e->getMessage());
            throw $e;
        }
    }
}