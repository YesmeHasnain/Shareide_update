<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            // Negotiation
            $table->string('negotiation_status')->default('none')->after('status'); // none, open, locked, completed

            // Tips
            $table->decimal('tip_amount', 10, 2)->default(0)->after('driver_earning');

            // Ride Preferences
            $table->text('special_requests')->nullable()->after('notes');
            $table->boolean('is_pet_friendly')->default(false)->after('special_requests');
            $table->boolean('is_luggage')->default(false)->after('is_pet_friendly');
            $table->boolean('is_ac_required')->default(false)->after('is_luggage');

            // Service Type
            $table->string('service_type')->default('city')->after('negotiation_status'); // city, intercity, delivery, freight

            // Intercity
            $table->boolean('is_intercity')->default(false)->after('service_type');
            $table->timestamp('departure_datetime')->nullable()->after('scheduled_at');
            $table->integer('max_passengers')->default(1)->after('seats');

            // Share Trip
            $table->string('share_token')->nullable()->unique()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            $table->dropColumn([
                'negotiation_status', 'tip_amount', 'special_requests',
                'is_pet_friendly', 'is_luggage', 'is_ac_required',
                'service_type', 'is_intercity', 'departure_datetime',
                'max_passengers', 'share_token',
            ]);
        });
    }
};
