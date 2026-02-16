<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ride_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ride_request_id')->constrained()->onDelete('cascade');
            $table->string('address');
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->integer('stop_order')->default(1);
            $table->timestamp('arrived_at')->nullable();
            $table->timestamps();

            $table->index(['ride_request_id', 'stop_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ride_stops');
    }
};
