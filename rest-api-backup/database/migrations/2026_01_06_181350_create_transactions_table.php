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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->foreignId('ride_request_id')->nullable()->constrained('ride_requests');
            
            $table->enum('type', ['earning', 'withdrawal', 'commission', 'refund', 'bonus']);
            $table->decimal('amount', 10, 2);
            $table->decimal('balance_after', 10, 2);
            
            $table->string('description')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};