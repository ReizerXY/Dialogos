<?php
// app/Http/Middleware/SecurityHeaders.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Evita que el navegador adivine el tipo MIME
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Bloquea iframes (clickjacking)
        $response->headers->set('X-Frame-Options', 'DENY');

        // No filtrar URLs internas al salir del sitio
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Desactivar APIs del navegador que no usamos
        $response->headers->set(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
        );

        // ============================================================
        // CSP: solo en producción. En local, Vite sirve los scripts
        // desde http://[::1]:5173 o http://localhost:5173 y el CSP
        // los bloquearía, dejando la página en blanco.
        // ============================================================
        if (app()->environment('production')) {
            $csp = "default-src 'self'; "
                 . "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                 . "style-src 'self' 'unsafe-inline' https://fonts.bunny.net; "
                 . "font-src 'self' https://fonts.bunny.net data:; "
                 . "img-src 'self' data: blob:; "
                 . "connect-src 'self'; "
                 . "frame-ancestors 'none'; "
                 . "base-uri 'self'; "
                 . "form-action 'self';";
            $response->headers->set('Content-Security-Policy', $csp);

            // HSTS solo en producción (HTTPS)
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        return $response;
    }
}