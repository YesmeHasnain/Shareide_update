<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'success' => true,
        'message' => 'Shareide API is running',
        'version' => '1.0',
    ]);
});

// Public Support Ticket View (for guests to reply)
Route::get('/support/ticket/{token}', function ($token) {
    return view('support.ticket', ['token' => $token]);
})->name('support.ticket');
