<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add IP tracking to users
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_ip', 45)->nullable()->after('remember_token');
            $table->timestamp('last_login_at')->nullable()->after('last_ip');
        });

        // Add IP to support tickets
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->string('ip_address', 45)->nullable()->after('source');
            $table->string('user_agent')->nullable()->after('ip_address');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['last_ip', 'last_login_at']);
        });

        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropColumn(['ip_address', 'user_agent']);
        });
    }
};
