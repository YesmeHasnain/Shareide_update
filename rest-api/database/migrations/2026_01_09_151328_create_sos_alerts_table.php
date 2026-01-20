<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sos_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('ride_request_id')->nullable()->constrained('ride_requests')->onDelete('set null');
            
            // Location at time of SOS
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('location_address')->nullable();
            
            // Alert details
            $table->text('message')->nullable();
            $table->enum('type', ['emergency', 'unsafe', 'accident', 'other'])->default('emergency');
            
            // Status
            $table->enum('status', ['active', 'resolved', 'false_alarm'])->default('active');
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_note')->nullable();
            
            // Notified parties
            $table->boolean('contacts_notified')->default(false);
            $table->boolean('admin_notified')->default(false);
            $table->boolean('police_notified')->default(false);
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sos_alerts');
    }
};