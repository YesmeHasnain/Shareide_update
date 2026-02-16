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
        Schema::create('driver_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            
            // NIC Documents
            $table->string('nic_front')->nullable();
            $table->string('nic_back')->nullable();
            
            // License Documents
            $table->string('license_front')->nullable();
            $table->string('license_back')->nullable();
            
            // Vehicle Registration
            $table->string('vehicle_registration')->nullable();
            
            // Selfie Verification
            $table->string('selfie_with_nic')->nullable();
            $table->string('live_selfie')->nullable();
            
            // Verification Status
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('verified_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_documents');
    }
};