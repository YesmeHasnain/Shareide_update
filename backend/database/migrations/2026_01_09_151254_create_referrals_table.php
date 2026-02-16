<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            
            // Referrer (person who refers)
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade');
            
            // Referred (person who got referred)
            $table->foreignId('referred_id')->nullable()->constrained('users')->onDelete('cascade');
            
            // Referral code
            $table->string('referral_code')->unique();
            
            // Reward details
            $table->decimal('referrer_reward', 10, 2)->default(0); // Rs. 100 for referrer
            $table->decimal('referred_reward', 10, 2)->default(0); // Rs. 50 for new user
            
            // Status
            $table->enum('status', ['pending', 'completed', 'expired'])->default('pending');
            $table->boolean('reward_claimed')->default(false);
            $table->timestamp('completed_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['referrer_id']);
            $table->index(['referral_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};