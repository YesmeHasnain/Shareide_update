<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_rides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('users')->onDelete('cascade');

            // Route Information
            $table->string('from_address');
            $table->decimal('from_lat', 10, 8);
            $table->decimal('from_lng', 11, 8);
            $table->string('to_address');
            $table->decimal('to_lat', 10, 8);
            $table->decimal('to_lng', 11, 8);

            // Timing
            $table->dateTime('departure_time');
            $table->integer('estimated_duration')->nullable(); // in minutes

            // Seats & Pricing
            $table->integer('total_seats');
            $table->integer('available_seats');
            $table->decimal('price_per_seat', 10, 2);
            $table->decimal('total_distance', 10, 2)->nullable(); // in km

            // Vehicle Info (from driver profile or custom)
            $table->string('vehicle_type')->default('car'); // car, bike, van
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_color')->nullable();
            $table->string('plate_number')->nullable();

            // Preferences
            $table->boolean('women_only')->default(false);
            $table->boolean('ac_available')->default(true);
            $table->boolean('luggage_allowed')->default(true);
            $table->boolean('smoking_allowed')->default(false);
            $table->boolean('pets_allowed')->default(false);
            $table->text('notes')->nullable();

            // Status
            $table->enum('status', [
                'open',           // Accepting bookings
                'full',           // All seats booked
                'in_progress',    // Ride started
                'completed',      // Ride finished
                'cancelled'       // Ride cancelled
            ])->default('open');

            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['status', 'departure_time']);
            $table->index(['from_lat', 'from_lng']);
            $table->index(['to_lat', 'to_lng']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_rides');
    }
};
