<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_ride_bids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ride_id')->constrained('shared_rides')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('bid_amount');
            $table->integer('seats_requested')->default(1);
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();

            $table->unique(['ride_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_ride_bids');
    }
};
