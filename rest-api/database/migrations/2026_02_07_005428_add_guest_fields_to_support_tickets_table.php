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
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->string('guest_name', 100)->nullable()->after('user_id');
            $table->string('guest_email', 100)->nullable()->after('guest_name');
            $table->string('guest_phone', 20)->nullable()->after('guest_email');
            $table->string('reply_token', 64)->nullable()->unique()->after('guest_phone');
            $table->timestamp('last_reply_at')->nullable()->after('resolved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropColumn(['guest_name', 'guest_email', 'guest_phone', 'reply_token', 'last_reply_at']);
        });
    }
};
