<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Admin Roles & Permissions
        Schema::create('admin_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // super_admin, support, finance, operations
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->json('permissions'); // Array of permission keys
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Add role_id to users table for admins
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('admin_role_id')->nullable()->after('role')->constrained('admin_roles')->onDelete('set null');
        });

        // 2. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('user_name')->nullable(); // Store name in case user deleted
            $table->string('action'); // create, update, delete, login, logout, approve, reject, block, etc.
            $table->string('model_type')->nullable(); // App\Models\Driver, etc.
            $table->unsignedBigInteger('model_id')->nullable();
            $table->string('description');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['model_type', 'model_id']);
            $table->index('action');
        });

        // 3. Support Tickets
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('user_type', ['rider', 'driver']);
            $table->foreignId('ride_request_id')->nullable()->constrained()->onDelete('set null');
            $table->string('subject');
            $table->text('description');
            $table->enum('category', ['payment', 'ride_issue', 'driver_behavior', 'app_bug', 'account', 'other']);
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['open', 'in_progress', 'waiting_response', 'resolved', 'closed'])->default('open');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_note')->nullable();
            $table->timestamps();

            $table->index(['status', 'priority']);
            $table->index('user_id');
        });

        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_ticket_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('sender_type', ['user', 'admin']);
            $table->text('message');
            $table->string('attachment')->nullable();
            $table->boolean('is_internal')->default(false); // Internal admin notes
            $table->timestamps();
        });

        // 4. Fare Settings & Zones
        Schema::create('fare_settings', function (Blueprint $table) {
            $table->id();
            $table->string('city');
            $table->enum('vehicle_type', ['car', 'bike']);
            $table->decimal('base_fare', 10, 2);
            $table->decimal('per_km_rate', 10, 2);
            $table->decimal('per_minute_rate', 10, 2)->default(0);
            $table->decimal('minimum_fare', 10, 2);
            $table->decimal('booking_fee', 10, 2)->default(0);
            $table->decimal('cancellation_fee', 10, 2)->default(0);
            $table->decimal('waiting_charge_per_min', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['city', 'vehicle_type']);
        });

        Schema::create('surge_pricing', function (Blueprint $table) {
            $table->id();
            $table->string('city');
            $table->decimal('multiplier', 3, 2); // 1.5x, 2.0x etc
            $table->string('reason')->nullable(); // rain, peak_hours, high_demand
            $table->boolean('is_auto')->default(false); // Auto-triggered or manual
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('commission_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['percentage', 'fixed']);
            $table->decimal('value', 10, 2);
            $table->string('city')->nullable(); // null = all cities
            $table->enum('vehicle_type', ['car', 'bike', 'all'])->default('all');
            $table->decimal('min_rides_for_discount', 10, 2)->nullable(); // Lower commission after X rides
            $table->decimal('discounted_value', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 5. Automated Alerts Configuration
        Schema::create('alert_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('alert_type'); // sos, low_balance, suspicious_activity, high_cancellation, etc.
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('conditions'); // Conditions that trigger the alert
            $table->json('actions'); // What to do when triggered (notify_admin, send_sms, etc.)
            $table->json('notify_roles')->nullable(); // Which admin roles to notify
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('system_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('alert_type');
            $table->string('title');
            $table->text('message');
            $table->enum('severity', ['info', 'warning', 'critical'])->default('info');
            $table->string('model_type')->nullable();
            $table->unsignedBigInteger('model_id')->nullable();
            $table->json('data')->nullable();
            $table->boolean('is_read')->default(false);
            $table->foreignId('read_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('read_at')->nullable();
            $table->boolean('is_resolved')->default(false);
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_note')->nullable();
            $table->timestamps();

            $table->index(['alert_type', 'is_resolved']);
            $table->index('severity');
        });

        // 6. Service Zones (Geofencing)
        Schema::create('service_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('city');
            $table->enum('type', ['service_area', 'restricted', 'high_demand', 'airport', 'special']);
            $table->json('coordinates'); // Polygon coordinates
            $table->decimal('fare_multiplier', 3, 2)->default(1.00);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_zones');
        Schema::dropIfExists('system_alerts');
        Schema::dropIfExists('alert_configurations');
        Schema::dropIfExists('commission_settings');
        Schema::dropIfExists('surge_pricing');
        Schema::dropIfExists('fare_settings');
        Schema::dropIfExists('ticket_messages');
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('audit_logs');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['admin_role_id']);
            $table->dropColumn('admin_role_id');
        });

        Schema::dropIfExists('admin_roles');
    }
};
