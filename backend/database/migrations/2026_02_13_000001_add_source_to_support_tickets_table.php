<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->string('source', 30)->default('contact_form')->after('resolution_note');
            $table->foreignId('resolved_by')->nullable()->after('resolved_at')->constrained('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropColumn('source');
            $table->dropForeign(['resolved_by']);
            $table->dropColumn('resolved_by');
        });
    }
};
