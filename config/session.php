<?php
// config/session.php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Session Driver
    |--------------------------------------------------------------------------
    */

    'driver' => env('SESSION_DRIVER', 'database'),

    /*
    |--------------------------------------------------------------------------
    | Session Lifetime
    |--------------------------------------------------------------------------
    | 30 minutos de inactividad para cerrar sesión automáticamente.
    | Ajusta con SESSION_LIFETIME en el .env si necesitas más.
    */

    'lifetime' => env('SESSION_LIFETIME', 30),

    'expire_on_close' => false,

    /*
    |--------------------------------------------------------------------------
    | Session Encryption
    |--------------------------------------------------------------------------
    */

    'encrypt' => true,

    'files' => storage_path('framework/sessions'),

    'connection' => env('SESSION_CONNECTION'),

    'table' => 'sessions',

    'store' => env('SESSION_STORE'),

    'lottery' => [2, 100],

    'cookie' => env(
        'SESSION_COOKIE',
        Str::slug(env('APP_NAME', 'Dialogos'), '_').'_session'
    ),

    'path' => '/',

    'domain' => env('SESSION_DOMAIN'),

    /*
    |--------------------------------------------------------------------------
    | HTTPS Only Cookies
    |--------------------------------------------------------------------------
    | Auto-detecta según el entorno:
    |   - local      → secure = false (permite http://)
    |   - production → secure = true  (solo https://)
    |
    | Puedes sobreescribir con SESSION_SECURE_COOKIE en el .env si lo necesitas.
    */

    'secure' => env('SESSION_SECURE_COOKIE', env('APP_ENV', 'production') === 'production'),

    'http_only' => true,

    'same_site' => 'lax',

];