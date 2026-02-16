<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            
            // Route Details
            $table->string('from_location');
            $table->decimal('from_latitude', 10, 8);
            $table->decimal('from_longitude', 11, 8);
            
            $table->string('to_location');
            $table->decimal('to_latitude', 10, 8);
            $table->decimal('to_longitude', 11, 8);
            
            // Timing
            $table->time('departure_time');
            
            // Days (JSON: ["monday", "tuesday", "wednesday"])
            $table->json('days');
            
            // Stats
            $table->integer('matched_rides')->default(0);
            $table->decimal('total_earnings', 10, 2)->default(0);
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};