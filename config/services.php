<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'turnstile' => [
        'site_key'   => env('TURNSTILE_SITE_KEY'),
        'secret_key' => env('TURNSTILE_SECRET_KEY'),
    ],

    'whatsapp' => [
        'enabled'               => env('WHATSAPP_ENABLED', true),
        'microservice_url'      => env('WHATSAPP_MICROSERVICE_URL', 'http://127.0.0.1:3001'),
        'microservice_timeout'  => env('WHATSAPP_MICROSERVICE_TIMEOUT', 15),
        'api_key'               => env('WHATSAPP_API_KEY'),
    ],

    'zavu' => [
        'api_key'   => env('ZAVU_API_KEY'),
        'sender_id' => env('ZAVU_SENDER_ID'),
        'templates' => [
            'confirmacion' => env('ZAVU_TEMPLATE_CONFIRMACION'),
            'modificacion' => env('ZAVU_TEMPLATE_MODIFICACION'),
            'cancelacion'  => env('ZAVU_TEMPLATE_CANCELACION'),
        ],
    ],

];