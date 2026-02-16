<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('support_tickets', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['user_id']);

            // Make user_id nullable
            $table->foreignId('user_id')->nullable()->change();

            // Re-add foreign key with nullable
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            // Add website_contact category
            // Make user_type nullable for guest submissions
            $table->string('user_type')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->change();
            $table->enum('user_type', ['rider', 'driver'])->change();
        });
    }
};
