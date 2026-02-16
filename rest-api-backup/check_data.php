<?php
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== ALL USERS ===\n";
$users = App\Models\User::with(["riderProfile","riderWallet"])->get();
foreach($users as $u){
    echo "User #{$u->id}: name={$u->name}, phone={$u->phone}, role={$u->role}\n";
    if($u->riderProfile) {
        echo "  Profile: full_name={$u->riderProfile->full_name}, gender={$u->riderProfile->gender}, avatar_path={$u->riderProfile->avatar_path}\n";
    } else {
        echo "  Profile: NONE\n";
    }
    if($u->riderWallet) {
        echo "  Wallet: balance={$u->riderWallet->balance}\n";
    }
    echo "\n";
}

// Check storage directory for avatars
echo "=== AVATAR FILES ===\n";
$storagePath = storage_path('app/public');
if(is_dir($storagePath)) {
    $files = glob($storagePath . '/{avatars,profiles,uploads}/*', GLOB_BRACE);
    if(empty($files)) {
        // Try recursively
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($storagePath));
        $count = 0;
        foreach($iterator as $file) {
            if($file->isFile() && $count < 20) {
                echo "  " . str_replace($storagePath, '', $file->getPathname()) . "\n";
                $count++;
            }
        }
        if($count == 0) echo "  No files found in storage/app/public\n";
    } else {
        foreach($files as $f) {
            echo "  " . basename($f) . "\n";
        }
    }
} else {
    echo "  storage/app/public directory not found\n";
}

// Check storage symlink
echo "\n=== STORAGE LINK ===\n";
$publicStorage = base_path('public/storage');
echo "public/storage exists: " . (file_exists($publicStorage) ? "YES" : "NO") . "\n";
echo "public/storage is link: " . (is_link($publicStorage) ? "YES" : "NO") . "\n";

// Check personal_access_tokens to see active sessions
echo "\n=== ACTIVE TOKENS ===\n";
$tokens = DB::table('personal_access_tokens')->select('id','tokenable_id','name','last_used_at','created_at')->orderBy('id','desc')->limit(5)->get();
foreach($tokens as $t) {
    echo "  Token #{$t->id}: user_id={$t->tokenable_id}, name={$t->name}, last_used={$t->last_used_at}, created={$t->created_at}\n";
}
