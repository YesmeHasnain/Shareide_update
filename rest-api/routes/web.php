<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Website\WebsiteController;

/*
|--------------------------------------------------------------------------
| Web Routes - SHAREIDE Website
|--------------------------------------------------------------------------
*/

// Main Pages
Route::get('/', [WebsiteController::class, 'home'])->name('home');
Route::get('/about', [WebsiteController::class, 'about'])->name('about');
Route::get('/features', [WebsiteController::class, 'features'])->name('features');
Route::get('/safety', [WebsiteController::class, 'safety'])->name('safety');

// Contact & Support
Route::get('/contact', [WebsiteController::class, 'contact'])->name('contact');
Route::post('/contact', [WebsiteController::class, 'submitContact'])->name('contact.submit');

// Legal Pages
Route::get('/privacy', [WebsiteController::class, 'privacy'])->name('privacy');
Route::get('/privacy-policy', [WebsiteController::class, 'privacy']);
Route::get('/terms', [WebsiteController::class, 'terms'])->name('terms');
Route::get('/terms-of-service', [WebsiteController::class, 'terms']);
Route::get('/refund', [WebsiteController::class, 'refund'])->name('refund');
Route::get('/refund-policy', [WebsiteController::class, 'refund']);

// Help & FAQ
Route::get('/faq', [WebsiteController::class, 'faq'])->name('faq');
Route::get('/help', [WebsiteController::class, 'faq']);

// Driver
Route::get('/drive', [WebsiteController::class, 'drive'])->name('drive');
Route::get('/driver', [WebsiteController::class, 'drive']);
Route::get('/become-a-driver', [WebsiteController::class, 'drive']);

// Downloads - Smart redirect based on platform
Route::get('/download', [WebsiteController::class, 'download'])->name('download');
Route::get('/download/apk', [WebsiteController::class, 'downloadApk'])->name('download.apk');
Route::get('/download/driver', [WebsiteController::class, 'downloadDriver'])->name('download.driver');
Route::get('/get', [WebsiteController::class, 'download']);

// App Redirects
Route::get('/app', fn() => redirect()->route('download'));
Route::get('/rider', fn() => redirect()->route('download'));
