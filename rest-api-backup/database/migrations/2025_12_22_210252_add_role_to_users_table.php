<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->unique()->after('email');
            $table->enum('role', ['rider', 'driver', 'admin'])->default('rider')->after('phone');
            $table->enum('status', ['active', 'blocked'])->default('active')->after('role');
            
            // Email nullable karo
            $table->string('email')->nullable()->change();
            // Password nullable karo
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'role', 'status']);
        });
    }
};