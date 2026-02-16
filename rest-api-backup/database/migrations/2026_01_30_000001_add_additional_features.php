<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Push Notifications - Device Tokens
        if (!Schema::hasTable('device_tokens')) {
            Schema::create('device_tokens', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('token');
                $table->enum('platform', ['android', 'ios', 'web'])->default('android');
                $table->string('device_name')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamp('last_used_at')->nullable();
                $table->timestamps();
                $table->index(['user_id', 'is_active']);
            });
        }

        // 2. Push Notifications Log
        if (!Schema::hasTable('push_notifications')) {
            Schema::create('push_notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
                $table->string('title');
                $table->text('body');
                $table->json('data')->nullable();
                $table->enum('type', ['ride', 'booking', 'chat', 'promo', 'system', 'loyalty'])->default('system');
                $table->boolean('is_read')->default(false);
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
                $table->index(['user_id', 'is_read']);
            });
        }

        // 3. Chat Improvements - Add voice/image support
        Schema::table('chat_messages', function (Blueprint $table) {
            if (!Schema::hasColumn('chat_messages', 'message_type')) {
                $table->enum('message_type', ['text', 'image', 'voice', 'location'])->default('text')->after('message');
            }
            if (!Schema::hasColumn('chat_messages', 'media_url')) {
                $table->string('media_url')->nullable()->after('message_type');
            }
            if (!Schema::hasColumn('chat_messages', 'media_duration')) {
                $table->integer('media_duration')->nullable()->after('media_url'); // For voice messages in seconds
            }
            if (!Schema::hasColumn('chat_messages', 'is_read')) {
                $table->boolean('is_read')->default(false)->after('media_duration');
            }
            if (!Schema::hasColumn('chat_messages', 'read_at')) {
                $table->timestamp('read_at')->nullable()->after('is_read');
            }
            if (!Schema::hasColumn('chat_messages', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('read_at');
            }
        });

        // 4. Ride Bidding System
        if (!Schema::hasTable('ride_bids')) {
            Schema::create('ride_bids', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ride_request_id')->constrained()->onDelete('cascade');
                $table->foreignId('driver_id')->constrained('users')->onDelete('cascade');
                $table->decimal('bid_amount', 10, 2);
                $table->integer('eta_minutes')->nullable(); // Estimated arrival time
                $table->text('note')->nullable(); // Driver's note to passenger
                $table->enum('status', ['pending', 'accepted', 'rejected', 'expired', 'withdrawn'])->default('pending');
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
                $table->index(['ride_request_id', 'status']);
                $table->index(['driver_id', 'status']);
            });
        }

        // Add bidding fields to ride_requests
        Schema::table('ride_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('ride_requests', 'is_bidding_enabled')) {
                $table->boolean('is_bidding_enabled')->default(false)->after('status');
            }
            if (!Schema::hasColumn('ride_requests', 'max_bid_amount')) {
                $table->decimal('max_bid_amount', 10, 2)->nullable()->after('is_bidding_enabled');
            }
            if (!Schema::hasColumn('ride_requests', 'min_bid_amount')) {
                $table->decimal('min_bid_amount', 10, 2)->nullable()->after('max_bid_amount');
            }
            if (!Schema::hasColumn('ride_requests', 'bid_duration_minutes')) {
                $table->integer('bid_duration_minutes')->default(5)->after('min_bid_amount');
            }
        });

        // 5. Loyalty/Rewards Program
        if (!Schema::hasTable('loyalty_tiers')) {
            Schema::create('loyalty_tiers', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // Bronze, Silver, Gold, Platinum
                $table->integer('min_points');
                $table->integer('max_points')->nullable();
                $table->decimal('discount_percentage', 5, 2)->default(0);
                $table->decimal('points_multiplier', 3, 2)->default(1.00);
                $table->json('benefits')->nullable(); // Array of benefits
                $table->string('badge_color')->default('#CD7F32');
                $table->string('icon')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('loyalty_points')) {
            Schema::create('loyalty_points', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->integer('points');
                $table->enum('type', ['earned', 'redeemed', 'expired', 'bonus', 'referral'])->default('earned');
                $table->string('source')->nullable(); // ride, referral, promo, bonus
                $table->unsignedBigInteger('source_id')->nullable(); // ride_id, referral_id etc
                $table->text('description')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
                $table->index(['user_id', 'type']);
            });
        }

        // Add loyalty fields to users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'total_loyalty_points')) {
                $table->integer('total_loyalty_points')->default(0)->after('remember_token');
            }
            if (!Schema::hasColumn('users', 'available_loyalty_points')) {
                $table->integer('available_loyalty_points')->default(0)->after('total_loyalty_points');
            }
            if (!Schema::hasColumn('users', 'loyalty_tier_id')) {
                $table->foreignId('loyalty_tier_id')->nullable()->after('available_loyalty_points');
            }
        });

        // 6. Rewards/Achievements
        if (!Schema::hasTable('achievements')) {
            Schema::create('achievements', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description');
                $table->string('icon')->nullable();
                $table->string('badge_image')->nullable();
                $table->integer('points_reward')->default(0);
                $table->string('type'); // rides_completed, referrals, total_spent, rating, shared_rides, etc.
                $table->integer('target_value'); // e.g., 10 rides, 5 referrals
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('user_achievements')) {
            Schema::create('user_achievements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('achievement_id')->constrained()->onDelete('cascade');
                $table->integer('current_progress')->default(0);
                $table->boolean('is_completed')->default(false);
                $table->timestamp('completed_at')->nullable();
                $table->boolean('reward_claimed')->default(false);
                $table->timestamps();
                $table->unique(['user_id', 'achievement_id']);
            });
        }

        // 7. Reward Redemptions
        if (!Schema::hasTable('loyalty_rewards')) {
            Schema::create('loyalty_rewards', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description');
                $table->integer('points_required');
                $table->string('reward_type'); // discount_fixed, discount_percentage, free_ride, priority_booking
                $table->decimal('reward_value', 10, 2);
                $table->string('image')->nullable();
                $table->text('terms_conditions')->nullable();
                $table->integer('max_redemptions')->nullable(); // null = unlimited
                $table->integer('current_redemptions')->default(0);
                $table->timestamp('valid_from')->nullable();
                $table->timestamp('valid_until')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('reward_redemptions')) {
            Schema::create('reward_redemptions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('loyalty_reward_id')->constrained()->onDelete('cascade');
                $table->integer('points_spent');
                $table->string('reward_code')->unique();
                $table->enum('status', ['active', 'used', 'expired'])->default('active');
                $table->timestamp('used_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
                $table->index(['user_id', 'status']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_redemptions');
        Schema::dropIfExists('loyalty_rewards');
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');

        Schema::table('users', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('users', 'total_loyalty_points')) {
                $columnsToDrop[] = 'total_loyalty_points';
            }
            if (Schema::hasColumn('users', 'available_loyalty_points')) {
                $columnsToDrop[] = 'available_loyalty_points';
            }
            if (Schema::hasColumn('users', 'loyalty_tier_id')) {
                $columnsToDrop[] = 'loyalty_tier_id';
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });

        Schema::dropIfExists('loyalty_points');
        Schema::dropIfExists('loyalty_tiers');

        Schema::table('ride_requests', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('ride_requests', 'is_bidding_enabled')) {
                $columnsToDrop[] = 'is_bidding_enabled';
            }
            if (Schema::hasColumn('ride_requests', 'max_bid_amount')) {
                $columnsToDrop[] = 'max_bid_amount';
            }
            if (Schema::hasColumn('ride_requests', 'min_bid_amount')) {
                $columnsToDrop[] = 'min_bid_amount';
            }
            if (Schema::hasColumn('ride_requests', 'bid_duration_minutes')) {
                $columnsToDrop[] = 'bid_duration_minutes';
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });

        Schema::dropIfExists('ride_bids');

        Schema::table('chat_messages', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('chat_messages', 'message_type')) {
                $columnsToDrop[] = 'message_type';
            }
            if (Schema::hasColumn('chat_messages', 'media_url')) {
                $columnsToDrop[] = 'media_url';
            }
            if (Schema::hasColumn('chat_messages', 'media_duration')) {
                $columnsToDrop[] = 'media_duration';
            }
            if (Schema::hasColumn('chat_messages', 'is_read')) {
                $columnsToDrop[] = 'is_read';
            }
            if (Schema::hasColumn('chat_messages', 'read_at')) {
                $columnsToDrop[] = 'read_at';
            }
            if (Schema::hasColumn('chat_messages', 'delivered_at')) {
                $columnsToDrop[] = 'delivered_at';
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });

        Schema::dropIfExists('push_notifications');
        Schema::dropIfExists('device_tokens');
    }
};
