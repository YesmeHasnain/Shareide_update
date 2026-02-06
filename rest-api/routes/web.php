<?php

use Illuminate\Support\Facades\Route;

// API is at api.shareide.com - no web routes needed here
// Admin routes are in routes/admin.php

Route::get('/', function () {
    return redirect('https://shareide.com');
});
