<?php
// config/csp.php

return [
    /*
     * Al poner 'policy' en null, obligamos a Spatie a construir la política
     * usando los presets y las directivas de abajo.
     */
    'policy' => null,

    'presets' => [
        Spatie\Csp\Presets\CloudflareTurnstile::class,
        Spatie\Csp\Presets\CloudflareWebAnalytics::class,
    ],

    'directives' => [
        [Spatie\Csp\Directive::SCRIPT, "'self'", "'unsafe-inline'", "'unsafe-eval'", "https://challenges.cloudflare.com", "https://static.cloudflareinsights.com"],
        [Spatie\Csp\Directive::STYLE, "'self'", "'unsafe-inline'", "https://fonts.bunny.net"],
        [Spatie\Csp\Directive::FONT, "'self'", "https://fonts.bunny.net", "data:"],
        [Spatie\Csp\Directive::IMG, "'self'", "data:", "blob:"],
        [Spatie\Csp\Directive::CONNECT, "'self'", "data:", "https://challenges.cloudflare.com", "https://*.challenges.cloudflare.com", "https://cloudflareinsights.com"],
    ],

    'report_only_presets' => [],
    'report_only_directives' => [],
    'report_uri' => env('CSP_REPORT_URI', ''),
    'enabled' => env('CSP_ENABLED', true),
    'enabled_while_hot_reloading' => env('CSP_ENABLED_WHILE_HOT_RELOADING', false),
    'nonce_generator' => Spatie\Csp\Nonce\RandomString::class,
    'nonce_enabled' => env('CSP_NONCE_ENABLED', false),
];