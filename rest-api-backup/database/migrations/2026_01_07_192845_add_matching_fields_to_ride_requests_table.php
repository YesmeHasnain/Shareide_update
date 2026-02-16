<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            // Check and add only if column doesn't exist
            
            if (!Schema::hasColumn('ride_requests', 'schedule_id')) {
                $table->foreignId('schedule_id')->nullable()->constrained('schedules')->onDelete('set null');
            }
            
            if (!Schema::hasColumn('ride_requests', 'match_score')) {
                $table->decimal('match_score', 5, 2)->nullable();
            }
            
            if (!Schema::hasColumn('ride_requests', 'matched_at')) {
                $table->timestamp('matched_at')->nullable();
            }
            
            if (!Schema::hasColumn('ride_requests', 'accepted_at')) {
                $table->timestamp('accepted_at')->nullable();
            }
            
            if (!Schema::hasColumn('ride_requests', 'started_at')) {
                $table->timestamp('started_at')->nullable();
            }
            
            if (!Schema::hasColumn('ride_requests', 'completed_at')) {
                $table->timestamp('completed_at')->nullable();
            }
            
            if (!Schema::hasColumn('ride_requests', 'cancelled_at')) {
                $table->timestamp('cancelled_at')->nullable();
            }
            
            if (!Schema::hasColumn('ride_requests', 'payment_method')) {
                $table->enum('payment_method', ['cash', 'card', 'wallet'])->default('cash');
            }
            
            if (!Schema::hasColumn('ride_requests', 'payment_status')) {
                $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            }
            
            if (!Schema::hasColumn('ride_requests', 'commission_amount')) {
                $table->decimal('commission_amount', 10, 2)->default(0);
            }
            
            if (!Schema::hasColumn('ride_requests', 'driver_earning')) {
                $table->decimal('driver_earning', 10, 2)->default(0);
            }
            
            if (!Schema::hasColumn('ride_requests', 'distance_km')) {
                $table->decimal('distance_km', 10, 2)->nullable();
            }
            
            if (!Schema::hasColumn('ride_requests', 'duration_minutes')) {
                $table->integer('duration_minutes')->nullable();
            }
            
            if (!Schema::hasColumn('ride_requests', 'cancellation_reason')) {
                $table->text('cancellation_reason')->nullable();
            }
            
            if (!Schema::hasColumn('ride_requests', 'cancelled_by')) {
                $table->enum('cancelled_by', ['rider', 'driver', 'admin'])->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            // Only drop if exists
            $columns = [
                'schedule_id', 'match_score', 'matched_at', 'accepted_at',
                'started_at', 'completed_at', 'cancelled_at', 'payment_method',
                'payment_status', 'commission_amount', 'driver_earning',
                'distance_km', 'duration_minutes', 'cancellation_reason', 'cancelled_by'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('ride_requests', $column)) {
                    if ($column === 'schedule_id') {
                        $table->dropForeign(['schedule_id']);
                    }
                    $table->dropColumn($column);
                }
            }
        });
    }
};