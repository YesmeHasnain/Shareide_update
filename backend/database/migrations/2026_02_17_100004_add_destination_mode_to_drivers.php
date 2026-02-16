<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->decimal('destination_lat', 10, 7)->nullable()->after('current_lng');
            $table->decimal('destination_lng', 10, 7)->nullable()->after('destination_lat');
            $table->boolean('destination_active')->default(false)->after('destination_lng');
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn(['destination_lat', 'destination_lng', 'destination_active']);
        });
    }
};
