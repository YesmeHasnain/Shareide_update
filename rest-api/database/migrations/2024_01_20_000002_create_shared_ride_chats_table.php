<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_ride_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ride_id')->constrained('shared_rides')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            $table->text('message');
            $table->timestamps();

            $table->index(['ride_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_ride_chats');
    }
};
