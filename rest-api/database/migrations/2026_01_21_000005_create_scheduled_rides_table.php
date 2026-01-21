<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scheduled_rides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Pickup details
            $table->string('pickup_address');
            $table->decimal('pickup_lat', 10, 8);
            $table->decimal('pickup_lng', 11, 8);

            // Drop details
            $table->string('drop_address');
            $table->decimal('drop_lat', 10, 8);
            $table->decimal('drop_lng', 11, 8);

            // Schedule details
            $table->date('scheduled_date');
            $table->time('scheduled_time');
            $table->timestamp('scheduled_at')->nullable(); // Combined datetime for easier querying

            // Ride preferences
            $table->enum('vehicle_type', ['bike', 'rickshaw', 'car', 'ac_car'])->default('car');
            $table->string('payment_method')->default('cash');
            $table->decimal('estimated_fare', 10, 2)->nullable();
            $table->decimal('distance_km', 10, 2)->nullable();

            // Status tracking
            $table->enum('status', [
                'pending',      // Scheduled, waiting for time
                'processing',   // Finding driver
                'booked',       // Driver found, ride created
                'completed',    // Ride completed
                'cancelled',    // User cancelled
                'failed'        // Could not find driver
            ])->default('pending');

            // Link to actual ride when booked
            $table->foreignId('ride_request_id')->nullable()->constrained()->onDelete('set null');

            // Additional info
            $table->text('notes')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('last_retry_at')->nullable();
            $table->text('failure_reason')->nullable();

            // Notification tracking
            $table->boolean('reminder_30min_sent')->default(false);
            $table->boolean('reminder_10min_sent')->default(false);
            $table->boolean('booking_notification_sent')->default(false);

            $table->timestamps();

            // Indexes for cron job queries
            $table->index(['status', 'scheduled_at']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scheduled_rides');
    }
};
