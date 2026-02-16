<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_ride_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shared_ride_id')->constrained()->onDelete('cascade');
            $table->foreignId('passenger_id')->constrained('users')->onDelete('cascade');

            // Booking Details
            $table->integer('seats_booked')->default(1);
            $table->decimal('amount', 10, 2); // Total amount for this booking

            // Custom Pickup/Drop (optional - for intermediate stops)
            $table->string('pickup_address')->nullable();
            $table->decimal('pickup_lat', 10, 8)->nullable();
            $table->decimal('pickup_lng', 11, 8)->nullable();
            $table->string('drop_address')->nullable();
            $table->decimal('drop_lat', 10, 8)->nullable();
            $table->decimal('drop_lng', 11, 8)->nullable();

            // Status Flow: pending -> accepted/rejected -> confirmed -> picked_up -> dropped_off
            $table->enum('status', [
                'pending',      // Passenger requested, waiting for driver
                'accepted',     // Driver accepted, waiting for payment
                'rejected',     // Driver rejected
                'confirmed',    // Payment done, confirmed
                'picked_up',    // Passenger picked up
                'dropped_off',  // Passenger dropped
                'cancelled',    // Cancelled by passenger
                'no_show'       // Passenger didn't show up
            ])->default('pending');

            // Payment
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('transaction_id')->nullable();

            // Timestamps
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('dropped_off_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            // Rating (after ride)
            $table->tinyInteger('driver_rating')->nullable(); // 1-5
            $table->text('driver_review')->nullable();
            $table->tinyInteger('passenger_rating')->nullable(); // Given by driver
            $table->text('passenger_review')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['shared_ride_id', 'status']);
            $table->index(['passenger_id', 'status']);
            $table->unique(['shared_ride_id', 'passenger_id']); // One booking per passenger per ride
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_ride_bookings');
    }
};
