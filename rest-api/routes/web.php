<?php

use Illuminate\Support\Facades\Route;

// Home page - served from Laravel
Route::get('/', function () {
    return view('website.home');
});

// Public Support Ticket View (for guests to reply)
Route::get('/support/ticket/{token}', function ($token) {
    return view('support.ticket', ['token' => $token]);
})->name('support.ticket');
