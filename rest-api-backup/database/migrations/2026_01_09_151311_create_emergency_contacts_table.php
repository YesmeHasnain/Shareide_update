<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emergency_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->string('name');
            $table->string('phone');
            $table->string('relationship')->nullable(); // Mother, Father, Friend, etc
            
            $table->boolean('is_primary')->default(false);
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emergency_contacts');
    }
};