<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change enum to string for more flexibility
        if (Schema::hasColumn('ride_requests', 'payment_method')) {
            DB::statement("ALTER TABLE ride_requests MODIFY COLUMN payment_method VARCHAR(20) DEFAULT 'cash'");
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('ride_requests', 'payment_method')) {
            DB::statement("ALTER TABLE ride_requests MODIFY COLUMN payment_method ENUM('cash', 'card', 'wallet') DEFAULT 'cash'");
        }
    }
};
