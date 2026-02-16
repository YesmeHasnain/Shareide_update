<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LoyaltyTier;
use App\Models\Achievement;
use App\Models\LoyaltyReward;

class LoyaltySeeder extends Seeder
{
    public function run(): void
    {
        // Create Loyalty Tiers
        $tiers = [
            [
                'name' => 'Bronze',
                'min_points' => 0,
                'max_points' => 499,
                'discount_percentage' => 0,
                'points_multiplier' => 1.0,
                'benefits' => ['Basic support', 'Earn 1 point per PKR 10 spent'],
                'badge_color' => '#CD7F32',
                'icon' => 'bronze-badge',
                'is_active' => true,
            ],
            [
                'name' => 'Silver',
                'min_points' => 500,
                'max_points' => 1499,
                'discount_percentage' => 5,
                'points_multiplier' => 1.25,
                'benefits' => ['5% ride discount', 'Priority support', '1.25x points multiplier'],
                'badge_color' => '#C0C0C0',
                'icon' => 'silver-badge',
                'is_active' => true,
            ],
            [
                'name' => 'Gold',
                'min_points' => 1500,
                'max_points' => 4999,
                'discount_percentage' => 10,
                'points_multiplier' => 1.5,
                'benefits' => ['10% ride discount', 'Priority support', '1.5x points multiplier', 'Free cancellation'],
                'badge_color' => '#FFD700',
                'icon' => 'gold-badge',
                'is_active' => true,
            ],
            [
                'name' => 'Platinum',
                'min_points' => 5000,
                'max_points' => null,
                'discount_percentage' => 15,
                'points_multiplier' => 2.0,
                'benefits' => ['15% ride discount', 'VIP support', '2x points multiplier', 'Free cancellation', 'Priority driver matching'],
                'badge_color' => '#E5E4E2',
                'icon' => 'platinum-badge',
                'is_active' => true,
            ],
        ];

        foreach ($tiers as $tier) {
            LoyaltyTier::firstOrCreate(
                ['name' => $tier['name']],
                $tier
            );
        }

        // Create Achievements
        $achievements = [
            // Ride-based achievements
            [
                'name' => 'First Ride',
                'slug' => 'first-ride',
                'description' => 'Complete your first ride',
                'icon' => 'car',
                'badge_image' => 'first-ride-badge',
                'points_reward' => 50,
                'type' => 'rides_completed',
                'target_value' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Regular Rider',
                'slug' => 'regular-rider',
                'description' => 'Complete 10 rides',
                'icon' => 'car-multiple',
                'badge_image' => 'regular-rider-badge',
                'points_reward' => 100,
                'type' => 'rides_completed',
                'target_value' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'Frequent Traveler',
                'slug' => 'frequent-traveler',
                'description' => 'Complete 50 rides',
                'icon' => 'road',
                'badge_image' => 'frequent-traveler-badge',
                'points_reward' => 300,
                'type' => 'rides_completed',
                'target_value' => 50,
                'is_active' => true,
            ],
            [
                'name' => 'Road Warrior',
                'slug' => 'road-warrior',
                'description' => 'Complete 100 rides',
                'icon' => 'trophy',
                'badge_image' => 'road-warrior-badge',
                'points_reward' => 500,
                'type' => 'rides_completed',
                'target_value' => 100,
                'is_active' => true,
            ],
            // Rating achievements
            [
                'name' => 'Polite Passenger',
                'slug' => 'polite-passenger',
                'description' => 'Maintain a 4.5+ rating after 10 rides',
                'icon' => 'star',
                'badge_image' => 'polite-passenger-badge',
                'points_reward' => 150,
                'type' => 'rating',
                'target_value' => 45, // 4.5 * 10
                'is_active' => true,
            ],
            // Referral achievements
            [
                'name' => 'Social Butterfly',
                'slug' => 'social-butterfly',
                'description' => 'Refer 5 friends who complete their first ride',
                'icon' => 'account-group',
                'badge_image' => 'social-butterfly-badge',
                'points_reward' => 200,
                'type' => 'referrals',
                'target_value' => 5,
                'is_active' => true,
            ],
            // Spending achievements
            [
                'name' => 'Big Spender',
                'slug' => 'big-spender',
                'description' => 'Spend PKR 10,000 on rides',
                'icon' => 'cash',
                'badge_image' => 'big-spender-badge',
                'points_reward' => 250,
                'type' => 'total_spent',
                'target_value' => 10000,
                'is_active' => true,
            ],
            // Eco achievements
            [
                'name' => 'Eco Warrior',
                'slug' => 'eco-warrior',
                'description' => 'Complete 10 shared/carpool rides',
                'icon' => 'leaf',
                'badge_image' => 'eco-warrior-badge',
                'points_reward' => 200,
                'type' => 'shared_rides',
                'target_value' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::firstOrCreate(
                ['slug' => $achievement['slug']],
                $achievement
            );
        }

        // Create sample rewards
        $rewards = [
            [
                'name' => 'PKR 50 Ride Discount',
                'description' => 'Get PKR 50 off on your next ride',
                'points_required' => 100,
                'reward_type' => 'discount_fixed',
                'reward_value' => 50,
                'image' => 'discount-50',
                'terms_conditions' => 'Valid for one ride. Cannot be combined with other offers.',
                'is_active' => true,
            ],
            [
                'name' => '10% Ride Discount',
                'description' => 'Get 10% off on your next ride (max PKR 100)',
                'points_required' => 150,
                'reward_type' => 'discount_percentage',
                'reward_value' => 10,
                'image' => 'discount-10-percent',
                'terms_conditions' => 'Valid for one ride. Maximum discount PKR 100.',
                'is_active' => true,
            ],
            [
                'name' => 'Free Ride (up to PKR 200)',
                'description' => 'Get a free ride worth up to PKR 200',
                'points_required' => 500,
                'reward_type' => 'free_ride',
                'reward_value' => 200,
                'image' => 'free-ride',
                'terms_conditions' => 'Valid for one ride. If ride exceeds PKR 200, pay the difference.',
                'is_active' => true,
            ],
            [
                'name' => 'Priority Booking for 7 Days',
                'description' => 'Get priority driver matching for 7 days',
                'points_required' => 300,
                'reward_type' => 'priority_booking',
                'reward_value' => 7,
                'image' => 'priority-booking',
                'terms_conditions' => 'Active for 7 days from redemption.',
                'is_active' => true,
            ],
        ];

        foreach ($rewards as $reward) {
            LoyaltyReward::firstOrCreate(
                ['name' => $reward['name']],
                $reward
            );
        }
    }
}
