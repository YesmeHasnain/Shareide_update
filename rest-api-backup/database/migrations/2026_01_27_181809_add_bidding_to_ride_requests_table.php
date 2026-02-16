<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds bidding/upsale feature to ride requests
     */
    public function up(): void
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            // Bidding columns
            $table->decimal('base_fare', 10, 2)->nullable()->after('estimated_price');
            $table->decimal('bid_amount', 10, 2)->nullable()->after('base_fare');
            $table->decimal('bid_percentage', 5, 2)->default(0)->after('bid_amount'); // How much % above base fare
            $table->boolean('is_bidding', false)->default(false)->after('bid_percentage');
            $table->integer('bid_count')->default(0)->after('is_bidding'); // How many times user increased bid
            $table->timestamp('last_bid_at')->nullable()->after('bid_count');

            // Priority boost - higher bid = higher priority in driver's list
            $table->integer('priority_score')->default(0)->after('last_bid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            $table->dropColumn([
                'base_fare',
                'bid_amount',
                'bid_percentage',
                'is_bidding',
                'bid_count',
                'last_bid_at',
                'priority_score'
            ]);
        });
    }
};
