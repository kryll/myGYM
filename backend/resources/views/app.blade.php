<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>myGYM - Tu Entrenador Personal con IA</title>
    <meta name="description" content="Aplicación de fitness con IA, planes personalizados y seguimiento completo">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#00D4FF">
    <!-- Apple PWA -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="myGYM">
</head>
<body class="bg-gray-950">
    <div id="root"></div>
    @viteReactRefresh
    @vite(['resources/js/main.tsx'])
</body>
</html>
