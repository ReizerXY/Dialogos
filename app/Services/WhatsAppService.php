<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class WhatsAppService
{
    protected $enabled;
    protected $driver;
    protected $phoneNumberId;
    protected $accessToken;

    public function __construct()
    {
        $this->enabled       = config('services.whatsapp.enabled', false);
        $this->driver        = config('services.whatsapp.driver', 'log');
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');
        $this->accessToken   = config('services.whatsapp.access_token');
    }

    /**
     * Envía un mensaje (o lo registra en log si está en modo prueba)
     */
    public function sendMessage($to, $message)
    {
        if (!$this->enabled) {
            Log::info("📱 WhatsApp [DESHABILITADO] Para: $to | Mensaje: $message");
            return false;
        }

        switch ($this->driver) {
            case 'log':
                Log::info("📱 WhatsApp [LOG] Para: $to | Mensaje: $message");
                return true;

            case 'meta':
                return $this->sendViaMeta($to, $message);

            case 'twilio':
                return $this->sendViaTwilio($to, $message);

            default:
                Log::warning("Driver WhatsApp no soportado: {$this->driver}");
                return false;
        }
    }

    /**
     * Envío real usando la API de Meta (WhatsApp Cloud API)
     */
    protected function sendViaMeta($to, $message)
    {
        if (empty($this->phoneNumberId) || empty($this->accessToken)) {
            Log::error('Faltan credenciales de WhatsApp Meta (phone_number_id o access_token)');
            return false;
        }

        $url = "https://graph.facebook.com/v18.0/{$this->phoneNumberId}/messages";

        $payload = [
            'messaging_product' => 'whatsapp',
            'to'   => $to,
            'type' => 'text',
            'text' => ['body' => $message],
        ];

        try {
            $response = Http::withToken($this->accessToken)->post($url, $payload);

            if ($response->successful()) {
                Log::info("✅ WhatsApp enviado exitosamente a $to");
                return true;
            } else {
                Log::error("❌ Error WhatsApp Meta: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("❌ Excepción WhatsApp: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envío usando Twilio (opcional, pendiente de implementar)
     */
    protected function sendViaTwilio($to, $message)
    {
        Log::info("📱 Twilio (simulado) a $to: $message");
        return true;
    }

    /**
     * Obtiene el teléfono del estudiante por su ID (preferido).
     * Si no se encuentra por ID, intenta por nombre.
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

        if ($estudiante && !empty($estudiante->telefono_estudiante)) {
            return $this->normalizarTelefono($estudiante->telefono_estudiante);
        }

        return null;
    }

    /**
     * Normaliza un teléfono a formato E.164 (sin +) para la API de Meta.
     * Ej: "2711604451" → "5212711604451"
     */
    protected function normalizarTelefono($tel)
    {
        if (empty($tel)) return null;

        // Quitar todo lo que no sea dígito
        $tel = preg_replace('/\D/', '', $tel);

        // Si ya tiene 12 dígitos y empieza con 52, ya está normalizado
        if (strlen($tel) === 12 && substr($tel, 0, 2) === '52') {
            return $tel;
        }

        // Si tiene 13 dígitos (52 + 1 + 10) lo dejamos
        if (strlen($tel) === 13 && substr($tel, 0, 2) === '52') {
            return $tel;
        }

        // Si tiene 10 dígitos, asumimos México → prepend 52
        if (strlen($tel) === 10) {
            return '52' . $tel;
        }

        // Cualquier otra cosa, lo devolvemos como está
        return $tel;
    }

    /**
     * Obtiene el nombre del formador por su ID
     */
    protected function getFormadorName($idUsuario)
    {
        $usuario = DB::table('usuarios')->where('id_usuario', $idUsuario)->first();
        return $usuario ? $usuario->nombre : 'Formador';
    }

    // ==================== MÉTODOS POR EVENTO ====================

    /**
     * Confirmación de cita (al crear)
     */
    public function sendConfirmation($cita)
    {
        $phone = $this->getPhoneByStudent($cita->id_estudiante, $cita->nombre_estudiante);

        if (!$phone) {
            Log::warning("No se encontró teléfono para estudiante: {$cita->nombre_estudiante}");
            return false;
        }

        $formador = $this->getFormadorName($cita->id_usuario);

        $mensaje = "¡Hola {$cita->nombre_estudiante}! 👋\n\n" .
                   "Tu cita ha sido confirmada.\n" .
                   "📅 Fecha: {$cita->fecha}\n" .
                   "🕐 Hora: " . substr($cita->hora, 0, 5) . "\n" .
                   "👤 Formador: {$formador}\n\n" .
                   "Por favor llega puntual. ¡Te esperamos!";

        return $this->sendMessage($phone, $mensaje);
    }

    /**
     * Modificación de cita
     */
    public function sendModification($cita)
    {
        $phone = $this->getPhoneByStudent($cita->id_estudiante, $cita->nombre_estudiante);
        if (!$phone) return false;

        $formador = $this->getFormadorName($cita->id_usuario);

        $mensaje = "¡Hola {$cita->nombre_estudiante}! 👋\n\n" .
                   "Tu cita ha sido modificada.\n" .
                   "📅 Nueva fecha: {$cita->fecha}\n" .
                   "🕐 Nueva hora: " . substr($cita->hora, 0, 5) . "\n" .
                   "👤 Formador: {$formador}\n\n" .
                   "Si no solicitaste este cambio, contacta al coordinador.";

        return $this->sendMessage($phone, $mensaje);
    }

    /**
     * Cancelación de cita
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