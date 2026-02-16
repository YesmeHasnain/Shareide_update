<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('promo_code_usage', function (Blueprint $table) {
            $table->decimal('discount_applied', 10, 2)->default(0)->after('discount_amount');
        });

        // Copy existing data from discount_amount to discount_applied
        DB::statement('UPDATE promo_code_usage SET discount_applied = discount_amount');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promo_code_usage', function (Blueprint $table) {
            $table->dropColumn('discount_applied');
        });
    }
};
