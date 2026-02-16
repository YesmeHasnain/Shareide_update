<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ride_request_id')->constrained('ride_requests')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Rider
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            
            // Payment details
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['cash', 'card', 'wallet', 'jazzcash', 'easypaisa']);
            $table->enum('payment_type', ['ride_fare', 'tip', 'refund'])->default('ride_fare');
            
            // Status
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded'])->default('pending');
            
            // Gateway details (for card/wallet payments)
            $table->string('transaction_id')->nullable()->unique();
            $table->string('gateway')->nullable(); // stripe, payfast, jazzcash, easypaisa
            $table->json('gateway_response')->nullable();
            
            // Commission breakdown
            $table->decimal('commission_amount', 10, 2)->default(0);
            $table->decimal('driver_earning', 10, 2)->default(0);
            $table->decimal('commission_rate', 5, 2)->default(20); // 20%
            
            // Timestamps
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->text('failure_reason')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['driver_id', 'status']);
            $table->index(['ride_request_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};