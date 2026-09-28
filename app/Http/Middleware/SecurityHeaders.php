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

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        $response->headers->set(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
        );

        if (app()->environment('production')) {
            $csp = "default-src 'self'; "
                 . "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                 . "style-src 'self' 'unsafe-inline' https://fonts.bunny.net; "
                 . "font-src 'self' https://fonts.bunny.net data:; "
                 . "img-src 'self' data: blob:; "
                 . "connect-src 'self'; "
                 . "frame-src 'self' blob:; "
                 . "object-src 'self' blob:; "
                 . "frame-ancestors 'none'; "
                 . "base-uri 'self'; "
                 . "form-action 'self';";
            $response->headers->set('Content-Security-Policy', $csp);

            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        return $response;
    }
}