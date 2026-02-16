<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update category column to allow website_contact
        DB::statement("ALTER TABLE support_tickets MODIFY COLUMN category ENUM('payment', 'ride_issue', 'driver_behavior', 'app_bug', 'account', 'other', 'website_contact') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE support_tickets MODIFY COLUMN category ENUM('payment', 'ride_issue', 'driver_behavior', 'app_bug', 'account', 'other') NOT NULL");
    }
};
