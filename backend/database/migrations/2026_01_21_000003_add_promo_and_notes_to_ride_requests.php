<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('ride_requests', 'promo_code')) {
                $table->string('promo_code')->nullable()->after('payment_status');
            }

            if (!Schema::hasColumn('ride_requests', 'notes')) {
                $table->text('notes')->nullable()->after('promo_code');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ride_requests', function (Blueprint $table) {
            if (Schema::hasColumn('ride_requests', 'promo_code')) {
                $table->dropColumn('promo_code');
            }

            if (Schema::hasColumn('ride_requests', 'notes')) {
                $table->dropColumn('notes');
            }
        });
    }
};
