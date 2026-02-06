<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL allows modifying ENUM columns - add new types for driver notifications
        DB::statement("ALTER TABLE push_notifications MODIFY COLUMN type ENUM('ride', 'booking', 'chat', 'promo', 'system', 'loyalty', 'driver_approved', 'driver_rejected', 'ride_request', 'ride_accepted', 'ride_started', 'ride_completed', 'ride_cancelled', 'new_message', 'withdrawal_approved', 'withdrawal_rejected', 'payment_received', 'rating_received') DEFAULT 'system'");

        // Add is_sent and sent_at columns for tracking notification delivery
        Schema::table('push_notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('push_notifications', 'is_sent')) {
                $table->boolean('is_sent')->default(false)->after('is_read');
            }
            if (!Schema::hasColumn('push_notifications', 'sent_at')) {
                $table->timestamp('sent_at')->nullable()->after('is_sent');
            }
        });
    }

    public function down(): void
    {
        Schema::table('push_notifications', function (Blueprint $table) {
            if (Schema::hasColumn('push_notifications', 'is_sent')) {
                $table->dropColumn('is_sent');
            }
            if (Schema::hasColumn('push_notifications', 'sent_at')) {
                $table->dropColumn('sent_at');
            }
        });

        DB::statement("ALTER TABLE push_notifications MODIFY COLUMN type ENUM('ride', 'booking', 'chat', 'promo', 'system', 'loyalty') DEFAULT 'system'");
    }
};
