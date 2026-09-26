<?php
// app/Services/CacheInvalidator.php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CacheInvalidator
{
    public const INDICADORES_VERSION = 'indicadores.version';

    /**
     * Invalida el caché de Indicadores incrementando la versión.
     * Las entradas viejas quedan huérfanas y expiran por TTL.
     */
    public static function indicadores(): void
    {
        // Inicializar si no existe (primera vez)
        if (!Cache::has(self::INDICADORES_VERSION)) {
            Cache::forever(self::INDICADORES_VERSION, 1);
            return;
        }

        // Incrementar. Laravel soporta `increment` en file, database y redis.
        Cache::increment(self::INDICADORES_VERSION);
    }

    /**
     * Genera la clave de caché única por combinación de filtros + versión.
     * Al cambiar la versión, todas las claves viejas dejan de usarse.
     */
    public static function indicadoresKey(array $filtros): string
    {
        $version = Cache::get(self::INDICADORES_VERSION, 1);
        return 'indicadores:v' . $version . ':' . md5(json_encode($filtros));
    }
}