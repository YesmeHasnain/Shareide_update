<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            $table->string('driver_negative_reason', 500)->nullable()->after('driver_comment');
            $table->string('rider_negative_reason', 500)->nullable()->after('rider_comment');
        });
    }

    public function down(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropColumn(['driver_negative_reason', 'rider_negative_reason']);
        });
    }
};
