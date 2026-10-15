<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>Sistema Diálogos - Prepa Anáhuac Veracruz</title>

        <meta name="description" content="Sistema Diálogos - Programa de acompañamiento integral para estudiantes de bachillerato. Prepa Anáhuac Veracruz, campus Córdoba-Orizaba.">
        <meta name="author" content="Prepa Anáhuac Veracruz">
        <meta name="robots" content="noindex, nofollow">

        <!-- Open Graph -->
        <meta property="og:title" content="Sistema Diálogos - Prepa Anáhuac Veracruz">
        <meta property="og:description" content="Programa de acompañamiento integral para estudiantes de bachillerato.">
        <meta property="og:type" content="website">
        <meta property="og:locale" content="es_MX">

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="/favicon.png">
        <link rel="shortcut icon" type="image/png" href="/favicon.png">
        <link rel="apple-touch-icon" href="/favicon.png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>