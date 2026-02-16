<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            
            // Code details
            $table->string('code')->unique();
            $table->text('description')->nullable();
            
            // Discount details
            $table->enum('discount_type', ['percentage', 'fixed']); // % or Rs.
            $table->decimal('discount_value', 10, 2); // 10% or Rs. 50
            $table->decimal('max_discount', 10, 2)->nullable(); // Max Rs. 200
            $table->decimal('min_ride_amount', 10, 2)->default(0); // Min fare Rs. 100
            
            // Usage limits
            $table->integer('total_usage_limit')->nullable(); // Total uses allowed
            $table->integer('per_user_limit')->default(1); // Uses per user
            $table->integer('times_used')->default(0); // Current usage count
            
            // Validity
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            
            // Target users (optional)
            $table->enum('user_type', ['all', 'new', 'existing'])->default('all');
            
            $table->timestamps();
            
            // Indexes
            $table->index(['code', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promo_codes');
    }
};