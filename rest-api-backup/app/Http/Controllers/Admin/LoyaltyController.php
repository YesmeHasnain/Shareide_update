<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyTier;
use App\Models\LoyaltyReward;
use App\Models\Achievement;
use App\Models\LoyaltyPoint;
use App\Models\RewardRedemption;
use App\Models\User;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    public function index()
    {
        $stats = [
            'total_points_earned' => LoyaltyPoint::where('type', 'earned')->sum('points'),
            'total_points_redeemed' => abs(LoyaltyPoint::where('type', 'redeemed')->sum('points')),
            'total_redemptions' => RewardRedemption::count(),
            'active_rewards' => LoyaltyReward::where('is_active', true)->count(),
        ];

        $tiers = LoyaltyTier::withCount('users')->orderBy('min_points')->get();
        $rewards = LoyaltyReward::latest()->take(5)->get();
        $recentRedemptions = RewardRedemption::with(['user', 'reward'])->latest()->take(10)->get();

        return view('admin.loyalty.index', compact('stats', 'tiers', 'rewards', 'recentRedemptions'));
    }

    public function tiers()
    {
        $tiers = LoyaltyTier::withCount('users')->orderBy('min_points')->get();
        return view('admin.loyalty.tiers', compact('tiers'));
    }

    public function storeTier(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'min_points' => 'required|integer|min:0',
            'max_points' => 'nullable|integer|gt:min_points',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'points_multiplier' => 'required|numeric|min:1|max:10',
            'badge_color' => 'required|string',
        ]);

        LoyaltyTier::create($request->all());

        return redirect()->route('admin.loyalty.tiers')->with('success', 'Tier created successfully');
    }

    public function updateTier(Request $request, $id)
    {
        $tier = LoyaltyTier::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'min_points' => 'required|integer|min:0',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'points_multiplier' => 'required|numeric|min:1|max:10',
        ]);

        $tier->update($request->all());

        return redirect()->route('admin.loyalty.tiers')->with('success', 'Tier updated successfully');
    }

    public function rewards()
    {
        $rewards = LoyaltyReward::latest()->paginate(20);
        return view('admin.loyalty.rewards', compact('rewards'));
    }

    public function storeReward(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'points_required' => 'required|integer|min:1',
            'reward_type' => 'required|string',
            'reward_value' => 'required|numeric|min:0',
        ]);

        LoyaltyReward::create($request->all());

        return redirect()->route('admin.loyalty.rewards')->with('success', 'Reward created successfully');
    }

    public function updateReward(Request $request, $id)
    {
        $reward = LoyaltyReward::findOrFail($id);
        $reward->update($request->all());

        return redirect()->route('admin.loyalty.rewards')->with('success', 'Reward updated successfully');
    }

    public function toggleReward($id)
    {
        $reward = LoyaltyReward::findOrFail($id);
        $reward->update(['is_active' => !$reward->is_active]);

        return redirect()->back()->with('success', 'Reward status updated');
    }

    public function achievements()
    {
        $achievements = Achievement::withCount(['userAchievements as completed_count' => function ($q) {
            $q->where('is_completed', true);
        }])->get();

        return view('admin.loyalty.achievements', compact('achievements'));
    }

    public function storeAchievement(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:achievements',
            'description' => 'required|string',
            'type' => 'required|string',
            'target_value' => 'required|integer|min:1',
            'points_reward' => 'required|integer|min:0',
        ]);

        Achievement::create($request->all());

        return redirect()->route('admin.loyalty.achievements')->with('success', 'Achievement created successfully');
    }

    public function redemptions()
    {
        $redemptions = RewardRedemption::with(['user', 'reward'])
            ->latest()
            ->paginate(20);

        return view('admin.loyalty.redemptions', compact('redemptions'));
    }

    public function userPoints($userId)
    {
        $user = User::with('loyaltyTier')->findOrFail($userId);
        $points = LoyaltyPoint::where('user_id', $userId)->latest()->paginate(20);

        return view('admin.loyalty.user-points', compact('user', 'points'));
    }

    public function addPoints(Request $request, $userId)
    {
        $request->validate([
            'points' => 'required|integer|min:1',
            'description' => 'required|string|max:255',
        ]);

        $user = User::findOrFail($userId);

        LoyaltyPoint::earnPoints($user, $request->points, 'admin_bonus', null, $request->description);

        return redirect()->back()->with('success', "Added {$request->points} points to {$user->name}");
    }
}
