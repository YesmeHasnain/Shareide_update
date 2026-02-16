<?php

use Illuminate\Support\Facades\Route;

// Public Support Ticket View (for guests to reply)
Route::get('/support/ticket/{token}', function ($token) {
    return view('support.ticket', ['token' => $token]);
})->name('support.ticket');
