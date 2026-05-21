<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        env('APP_URL', 'http://localhost:8000'),
    ],

    'allowed_origins_patterns' => [
        // Allow subdomains for multi-tenant
        '#^https?://[a-z0-9-]+\.' . preg_quote(parse_url(env('APP_URL', 'http://localhost'), PHP_URL_HOST), '#') . '#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
