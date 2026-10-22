<?php
// config/csp.php

return [

    /*
     * Presets para Cloudflare (Turnstile y Analytics).
     */
    'presets' => [
        Spatie\Csp\Presets\CloudflareTurnstile::class,
        Spatie\Csp\Presets\CloudflareWebAnalytics::class,
    ],

    /*
     * Directivas adicionales globales.
     * Agregamos permisos para Vite (desarrollo), Bunny Fonts y estilos inline.
     */
    'directives' => [
        // Scripts: permitir inline/eval (Vite/React) y el servidor de Vite
        [Spatie\Csp\Directive::SCRIPT, 
            "'unsafe-inline'", 
            "'unsafe-eval'", 
            "http://localhost:5173", 
            "http://127.0.0.1:5173"
        ],
        // Estilos: permitir inline y Bunny Fonts
        [Spatie\Csp\Directive::STYLE, 
            "'unsafe-inline'", 
            "https://fonts.bunny.net"
        ],
        // Fuentes: Bunny Fonts y data:
        [Spatie\Csp\Directive::FONT, 
            "https://fonts.bunny.net", 
            "data:"
        ],
        // Imágenes: data: y blob:
        [Spatie\Csp\Directive::IMG, 
            "data:", 
            "blob:"
        ],
        // Conexiones: Vite WebSocket, data: y Cloudflare
        [Spatie\Csp\Directive::CONNECT, 
            "'self'", 
            "data:", 
            "http://localhost:5173", 
            "ws://localhost:5173", 
            "http://127.0.0.1:5173", 
            "ws://127.0.0.1:5173",
            "https://challenges.cloudflare.com"
        ],
    ],

    'report_only_presets' => [],
    'report_only_directives' => [],
    'report_uri' => env('CSP_REPORT_URI', ''),
    'enabled' => env('CSP_ENABLED', true),
    
    // ⬇️ CRÍTICO: Desactiva el CSP cuando Vite está en hot reloading (desarrollo)
    'enabled_while_hot_reloading' => env('CSP_ENABLED_WHILE_HOT_RELOADING', false),

    'nonce_generator' => Spatie\Csp\Nonce\RandomString::class,
    'nonce_enabled' => env('CSP_NONCE_ENABLED', false),
];