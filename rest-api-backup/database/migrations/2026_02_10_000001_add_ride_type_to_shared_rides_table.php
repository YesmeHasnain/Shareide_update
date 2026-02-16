<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shared_rides', function (Blueprint $table) {
            $table->enum('ride_type', ['single', 'daily', 'weekly', 'monthly'])->default('single')->after('status');
            $table->json('recurring_days')->nullable()->after('ride_type');
            $table->date('end_date')->nullable()->after('recurring_days');
        });
    }

    public function down(): void
    {
        Schema::table('shared_rides', function (Blueprint $table) {
            $table->dropColumn(['ride_type', 'recurring_days', 'end_date']);
        });
    }
};
