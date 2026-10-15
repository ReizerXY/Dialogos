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
    protected $apiKey;

    public function __construct()
    {
        $this->url     = config('services.whatsapp.microservice_url', 'http://127.0.0.1:3001');
        $this->timeout = config('services.whatsapp.microservice_timeout', 15);
        $this->enabled = config('services.whatsapp.enabled', true);
        $this->apiKey  = config('services.whatsapp.api_key');
    }

    // Enmascara un telefono para no exponerlo en logs
    protected function maskPhone($phone)
    {
        if (empty($phone) || !is_string($phone)) return '***';
        if (strlen($phone) <= 4) return '***';
        return substr($phone, 0, 2) . '***' . substr($phone, -2);
    }

    // Envia un mensaje al microservicio Node.js. Retorna true si fue aceptado.
    public function sendMessage($to, $message, $filePath = null)
    {
        if (!$this->enabled) {
            Log::info('[WhatsApp] Deshabilitado por .env. Se omite envio.');
            return false;
        }

        // Normalizar numero: quitar todo lo que no sea digito
        $to = preg_replace('/\D/', '', (string) $to);

        if (empty($to)) {
            Log::warning('[WhatsApp] Numero vacio o invalido.');
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
            $request = Http::timeout($this->timeout)
                ->acceptJson();

            // Agregar API_KEY si esta configurada
            if (!empty($this->apiKey)) {
                $request = $request->withHeaders([
                    'X-API-KEY' => $this->apiKey,
                ]);
            } else {
                Log::warning('[WhatsApp] API_KEY no configurada. El microservicio rechazara el envio.');
            }

            $response = $request->post("{$this->url}/send", $payload);

            if ($response->successful()) {
                Log::info('[WhatsApp] Enviado a ' . $this->maskPhone($to));
                return true;
            }

            if ($response->status() === 401) {
                Log::error('[WhatsApp] No autorizado por microservicio. Verifica API_KEY.');
                return false;
            }

            if ($response->status() === 503) {
                Log::warning('[WhatsApp] Microservicio no conectado (503). Revisa el QR.');
                return false;
            }

            Log::error('[WhatsApp] Error microservicio (' . $response->status() . '): ' . $response->body());
            return false;

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('[WhatsApp] Sin conexion al microservicio en ' . $this->url);
            return false;
        } catch (\Exception $e) {
            Log::error('[WhatsApp] Excepcion: ' . $e->getMessage());
            return false;
        }
    }

    // Obtiene el telefono del estudiante por su ID o por nombre
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

        if ($estudiante && !empty($estudiante->contacto)) {
            return $this->normalizarTelefono($estudiante->contacto);
        }

        return null;
    }

    // Normaliza un telefono a formato E.164 sin '+' (ej. "5212711234567")
    protected function normalizarTelefono($tel)
    {
        if (empty($tel)) return null;

        $tel = preg_replace('/\D/', '', $tel);

        if (strlen($tel) === 12 && substr($tel, 0, 2) === '52') return $tel;
        if (strlen($tel) === 13 && substr($tel, 0, 2) === '52') return $tel;

        if (strlen($tel) === 10) {
            return '521' . $tel;
        }

        return $tel;
    }

    // Obtiene el nombre del formador por su ID
    protected function getFormadorName($idUsuario)
    {
        $usuario = DB::table('usuarios')->where('id_usuario', $idUsuario)->first();
        return $usuario ? $usuario->nombre : 'Formador';
    }

    // ==================== METODOS POR EVENTO ====================

    // Confirmacion de cita (al crear)
    public function sendConfirmation($cita)
    {
        $phone = $this->getPhoneByStudent($cita->id_estudiante, $cita->nombre_estudiante);
        if (!$phone) {
            Log::warning('[WhatsApp] Sin telefono para id_cita=' . ($cita->id_cita ?? '?'));
            return false;
        }

        $formador = $cita->nombre_formador ?: $this->getFormadorName($cita->id_usuario);

        $mensaje = "Hola {$cita->nombre_estudiante}.\n\n" .
                   "Tu cita ha sido confirmada.\n" .
                   "Fecha: {$cita->fecha}\n" .
                   "Hora: " . substr($cita->hora, 0, 5) . "\n" .
                   "Formador: {$formador}\n\n" .
                   "Por favor llega puntual. Te esperamos.";

        return $this->sendMessage($phone, $mensaje);
    }

    // Modificacion de cita
    public function sendModification($cita)
    {
        $phone = $this->getPhoneByStudent($cita->id_estudiante, $cita->nombre_estudiante);
        if (!$phone) return false;

        $formador = $cita->nombre_formador ?: $this->getFormadorName($cita->id_usuario);

        $mensaje = "Hola {$cita->nombre_estudiante}.\n\n" .
                   "Tu cita ha sido modificada.\n" .
                   "Nueva fecha: {$cita->fecha}\n" .
                   "Nueva hora: " . substr($cita->hora, 0, 5) . "\n" .
                   "Formador: {$formador}\n\n" .
                   "Si no solicitaste este cambio, contacta al coordinador.";

        return $this->sendMessage($phone, $mensaje);
    }

    // Cancelacion de cita
    public function sendCancellation($cita)
    {
        $phone = $this->getPhoneByStudent($cita->id_estudiante, $cita->nombre_estudiante);
        if (!$phone) return false;

        $mensaje = "Hola {$cita->nombre_estudiante}.\n\n" .
                   "Lamentamos informarte que tu cita del " .
                   "{$cita->fecha} a las " . substr($cita->hora, 0, 5) . " ha sido cancelada.\n\n" .
                   "Si necesitas reagendar, contacta al coordinador.";

        return $this->sendMessage($phone, $mensaje);
    }
}