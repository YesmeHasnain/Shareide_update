<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add CNIC to drivers table
        Schema::table('drivers', function (Blueprint $table) {
            $table->string('cnic', 15)->nullable()->after('user_id'); // Format: 12345-1234567-1
            $table->string('cnic_name')->nullable()->after('cnic'); // Name as per CNIC
            $table->text('ban_reason')->nullable()->after('status');
            $table->timestamp('banned_at')->nullable()->after('ban_reason');
        });

        // Add vehicle images to driver_documents
        Schema::table('driver_documents', function (Blueprint $table) {
            $table->string('vehicle_front')->nullable()->after('vehicle_registration');
            $table->string('vehicle_back')->nullable()->after('vehicle_front');
            $table->string('vehicle_interior')->nullable()->after('vehicle_back');
            $table->string('vehicle_with_plate')->nullable()->after('vehicle_interior');
        });

        // Create banned_cnics table
        Schema::create('banned_cnics', function (Blueprint $table) {
            $table->id();
            $table->string('cnic', 15)->unique();
            $table->string('name')->nullable();
            $table->text('reason');
            $table->foreignId('banned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('original_driver_id')->nullable(); // Reference to original driver
            $table->timestamps();

            $table->index('cnic');
        });

        // Create live_selfie_verifications table for online verification
        Schema::create('live_selfie_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->string('selfie_image');
            $table->enum('status', ['pending', 'verified', 'failed'])->default('pending');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('device_info')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index(['driver_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn(['cnic', 'cnic_name', 'ban_reason', 'banned_at']);
        });

        Schema::table('driver_documents', function (Blueprint $table) {
            $table->dropColumn(['vehicle_front', 'vehicle_back', 'vehicle_interior', 'vehicle_with_plate']);
        });

        Schema::dropIfExists('live_selfie_verifications');
        Schema::dropIfExists('banned_cnics');
    }
};
