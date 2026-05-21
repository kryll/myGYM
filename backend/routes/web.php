<?php

use Illuminate\Support\Facades\Route;

// Catch-all for SPA (React app)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api|sanctum|broadcasting).*$');
