<?php
// app/Services/WhatsAppService.php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected $url;
    protected $timeout;
    protected $enabled;

    public function __construct()
    {
        $this->url     = config('services.whatsapp.microservice_url', 'http://localhost:3001');
        $this->timeout = config('services.whatsapp.microservice_timeout', 15);
        $this->enabled = config('services.whatsapp.enabled', true);
    }

    /**
     * Envía un mensaje (con o sin archivo adjunto) a través del microservicio Node.js.
     * Retorna true si el microservicio aceptó el envío.
     */
    public function sendMessage($to, $message, $filePath = null)
    {
        if (!$this->enabled) {
            Log::info("📱 WhatsApp [DESHABILITADO] Para: $to | Mensaje: $message");
            return false;
        }

        // Normalizar número: quitar todo lo que no sea dígito
        $to = preg_replace('/\D/', '', (string) $to);

        if (empty($to)) {
            Log::warning("WhatsApp: número vacío o inválido.");
            return false;
        }

        $payload = [
            'number'  => $to,
            'message' => $message,
        ];

        if ($filePath) {
            $payload['filePath'] = $filePath;
        }

        try {
            $response = Http::timeout($this->timeout)
                ->acceptJson()
                ->post("{$this->url}/send", $payload);

            if ($response->successful()) {
                Log::info("✅ WhatsApp enviado a $to");
                return true;
            }

            if ($response->status() === 503) {
                Log::warning("⚠️ Microservicio WhatsApp no conectado (503). ¿Escaneaste el QR?");
                return false;
            }

            Log::error("❌ Error microservicio WhatsApp ({$response->status()}): " . $response->body());
            return false;

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error("❌ No se pudo conectar al microservicio WhatsApp en {$this->url}. ¿Está corriendo 'node index.js'?");
            return false;
        } catch (\Exception $e) {
            Log::error("❌ Excepción WhatsApp: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene el teléfono del estudiante por su ID (preferido) o por nombre.
     */
    public function getPhoneByStudent($idEstudiante = null, $nombre = null)
    {
        $query = DB::table('estudiantes');

        if ($idEstudiante) {
            $query->where('id_estudiante', $idEstudiante);
        } elseif ($nombre) {
            $query->where('nombre', $nombre);
        } else {
            return null;
        }

        $estudiante = $query->first();

        // ✅ El campo ahora se llama 'contacto' (antes 'telefono_estudiante')
        if ($estudiante && !empty($estudiante->contacto)) {
            return $this->normalizarTelefono($estudiante->contacto);
        }

        return null;
    }

    /**
     * Normaliza un teléfono a formato E.164 sin '+' (ej. "5212711234567").
     */
    protected function normalizarTelefono($tel)
    {
        if (empty($tel)) return null;

        $tel = preg_replace('/\D/', '', $tel);

        // Ya normalizado (12 o 13 dígitos con prefijo 52)
        if (strlen($tel) === 12 && substr($tel, 0, 2) === '52') return $tel;
        if (strlen($tel) === 13 && substr($tel, 0, 2) === '52') return $tel;

        // 10 dígitos locales → prepend 52 + 1
        if (strlen($tel) === 10) {
            return '521' . $tel;
        }

        return $tel;
    }

    /**
     * Obtiene el nombre del formador por su ID.
     */
    protected function getFormadorName($idUsuario)
    {
        $usuario = DB::table('usuarios')->where('id_usuario', $idUsuario)->first();
        return $usuario ? $usuario->nombre : 'Formador';
    }

    // ==================== MÉTODOS POR EVENTO ====================

    /**
     * Confirmación de cita (al crear).
     */
    public function sendConfirmation($cita)
    {
        $phone = $this->getPhoneByStudent($cita->id_estudiante, $cita->nombre_estudiante);
        if (!$phone) {
            Log::warning("WhatsApp: no se encontró teléfono para {$cita->nombre_estudiante}");
            return false;
        }

        $formador = $cita->nombre_formador ?: $this->getFormadorName($cita->id_usuario);

        $mensaje = "¡Hola {$cita->nombre_estudiante}! 👋\n\n" .
                   "Tu cita ha sido confirmada.\n" .
                   "📅 Fecha: {$cita->fecha}\n" .
                   "🕐 Hora: " . substr($cita->hora, 0, 5) . "\n" .
                   "👤 Formador: {$formador}\n\n" .
                   "Por favor llega puntual. ¡Te esperamos!";

        return $this->sendMessage($phone, $mensaje);
    }

    /**
     * Modificación de cita.
     */
    public function sendModification($cita)
    {
        $phone = $this->getPhoneByStudent($cita->id_estudiante, $cita->nombre_estudiante);
        if (!$phone) return false;

        $formador = $cita->nombre_formador ?: $this->getFormadorName($cita->id_usuario);

        $mensaje = "¡Hola {$cita->nombre_estudiante}! 👋\n\n" .
                   "Tu cita ha sido modificada.\n" .
                   "📅 Nueva fecha: {$cita->fecha}\n" .
                   "🕐 Nueva hora: " . substr($cita->hora, 0, 5) . "\n" .
                   "👤 Formador: {$formador}\n\n" .
                   "Si no solicitaste este cambio, contacta al coordinador.";

        return $this->sendMessage($phone, $mensaje);
    }

    /**
     * Cancelación de cita.
     */
    public function sendCancellation($cita)
    {
        $phone = $this->getPhoneByStudent($cita->id_estudiante, $cita->nombre_estudiante);
        if (!$phone) return false;

        $mensaje = "¡Hola {$cita->nombre_estudiante}! 👋\n\n" .
                   "Lamentamos informarte que tu cita del " .
                   "📅 {$cita->fecha} a las 🕐 " . substr($cita->hora, 0, 5) . " ha sido cancelada.\n\n" .
                   "Si necesitas reagendar, contacta al coordinador.";

        return $this->sendMessage($phone, $mensaje);
    }
}