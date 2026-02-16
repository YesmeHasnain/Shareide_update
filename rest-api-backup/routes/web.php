<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WebsiteController;

// Website Pages
Route::get('/', [WebsiteController::class, 'home'])->name('home');
Route::get('/about', [WebsiteController::class, 'about'])->name('about');
Route::get('/shareide-fleet', [WebsiteController::class, 'shareideFleet'])->name('shareide-fleet');
Route::get('/shareide-app', [WebsiteController::class, 'shareideApp'])->name('shareide-app');
Route::get('/how-it-works', [WebsiteController::class, 'howItWorks'])->name('how-it-works');
Route::get('/safety', [WebsiteController::class, 'safety'])->name('safety');
Route::get('/download', [WebsiteController::class, 'download'])->name('download');
Route::get('/carpool', [WebsiteController::class, 'carpool'])->name('carpool');
Route::get('/loyalty', [WebsiteController::class, 'loyalty'])->name('loyalty');
Route::get('/drive-with-us', [WebsiteController::class, 'driveWithUs'])->name('drive-with-us');
Route::get('/cities', [WebsiteController::class, 'cities'])->name('cities');
Route::get('/faq', [WebsiteController::class, 'faq'])->name('faq');
Route::get('/support', [WebsiteController::class, 'support'])->name('support');
Route::get('/blog', [WebsiteController::class, 'blog'])->name('blog');
Route::get('/privacy', [WebsiteController::class, 'privacy'])->name('privacy');
Route::get('/terms', [WebsiteController::class, 'terms'])->name('terms');
Route::get('/refund', [WebsiteController::class, 'refund'])->name('refund');

// Public Support Ticket View (for guests to reply)
Route::get('/support/ticket/{token}', function ($token) {
    return view('support.ticket', ['token' => $token]);
})->name('support.ticket');
