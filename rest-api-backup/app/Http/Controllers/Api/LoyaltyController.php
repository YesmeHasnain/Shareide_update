<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\LoyaltyPoint;
use App\Models\LoyaltyReward;
use App\Models\LoyaltyTier;
use App\Models\RewardRedemption;
use App\Models\UserAchievement;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    // Get user's loyalty dashboard
    public function getDashboard()
    {
        $user = auth()->user();
        $user->load('loyaltyTier');

        // Get next tier
        $nextTier = LoyaltyTier::where('is_active', true)
            ->where('min_points', '>', $user->total_loyalty_points)
            ->orderBy('min_points', 'asc')
            ->first();

        $pointsToNextTier = $nextTier ? $nextTier->min_points - $user->total_loyalty_points : 0;

        // Get recent points history
        $recentPoints = LoyaltyPoint::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get completed achievements count
        $completedAchievements = UserAchievement::where('user_id', $user->id)
            ->where('is_completed', true)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_points' => $user->total_loyalty_points,
                'available_points' => $user->available_loyalty_points,
                'current_tier' => $user->loyaltyTier,
                'next_tier' => $nextTier,
                'points_to_next_tier' => $pointsToNextTier,
                'recent_points' => $recentPoints,
                'completed_achievements' => $completedAchievements,
            ],
        ]);
    }

    // Get all loyalty tiers
    public function getTiers()
    {
        $tiers = LoyaltyTier::where('is_active', true)
            ->orderBy('min_points', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tiers,
        ]);
    }

    // Get points history
    public function getPointsHistory(Request $request)
    {
        $points = LoyaltyPoint::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $points,
        ]);
    }

    // Get available rewards
    public function getRewards()
    {
        $rewards = LoyaltyReward::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', now());
            })
            ->where(function ($query) {
                $query->whereNull('max_redemptions')
                    ->orWhereRaw('current_redemptions < max_redemptions');
            })
            ->orderBy('points_required', 'asc')
            ->get();

        $user = auth()->user();

        // Add canRedeem flag to each reward
        $rewards = $rewards->map(function ($reward) use ($user) {
            $reward->can_redeem = $reward->canBeRedeemedBy($user);
            return $reward;
        });

        return response()->json([
            'success' => true,
            'data' => $rewards,
        ]);
    }

    // Redeem a reward
    public function redeemReward($rewardId)
    {
        $reward = LoyaltyReward::findOrFail($rewardId);
        $user = auth()->user();

        if (!$reward->canBeRedeemedBy($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot redeem this reward. Check points balance or availability.',
            ], 400);
        }

        $redemption = RewardRedemption::redeem($user, $reward);

        if (!$redemption) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to redeem reward',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Reward redeemed successfully!',
            'data' => $redemption->load('reward'),
        ]);
    }

    // Get user's redemptions
    public function getMyRedemptions()
    {
        $redemptions = RewardRedemption::where('user_id', auth()->id())
            ->with('reward')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $redemptions,
        ]);
    }

    // Get all achievements
    public function getAchievements()
    {
        $achievements = Achievement::where('is_active', true)
            ->orderBy('target_value', 'asc')
            ->get();

        $userAchievements = UserAchievement::where('user_id', auth()->id())
            ->pluck('current_progress', 'achievement_id')
            ->toArray();

        $completedIds = UserAchievement::where('user_id', auth()->id())
            ->where('is_completed', true)
            ->pluck('achievement_id')
            ->toArray();

        $achievements = $achievements->map(function ($achievement) use ($userAchievements, $completedIds) {
            $achievement->current_progress = $userAchievements[$achievement->id] ?? 0;
            $achievement->is_completed = in_array($achievement->id, $completedIds);
            $achievement->progress_percentage = min(100, round(($achievement->current_progress / $achievement->target_value) * 100));
            return $achievement;
        });

        return response()->json([
            'success' => true,
            'data' => $achievements,
        ]);
    }

    // Get user's completed achievements
    public function getMyAchievements()
    {
        $achievements = UserAchievement::where('user_id', auth()->id())
            ->with('achievement')
            ->orderBy('completed_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $achievements,
        ]);
    }
}
