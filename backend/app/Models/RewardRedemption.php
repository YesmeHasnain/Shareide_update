<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardRedemption extends Model
{
    protected $fillable = [
        'user_id',
        'loyalty_reward_id',
        'points_spent',
        'reward_code',
        'status',
        'used_at',
        'expires_at',
    ];

    protected $casts = [
        'used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(LoyaltyReward::class, 'loyalty_reward_id');
    }

    public static function redeem(User $user, LoyaltyReward $reward): ?self
    {
        if (!$reward->canBeRedeemedBy($user)) {
            return null;
        }

        // Deduct points
        $pointsTransaction = LoyaltyPoint::redeemPoints(
            $user,
            $reward->points_required,
            "Redeemed: {$reward->name}"
        );

        if (!$pointsTransaction) {
            return null;
        }

        // Create redemption
        $redemption = self::create([
            'user_id' => $user->id,
            'loyalty_reward_id' => $reward->id,
            'points_spent' => $reward->points_required,
            'reward_code' => strtoupper(substr(md5(uniqid()), 0, 8)),
            'status' => 'active',
            'expires_at' => now()->addMonth(),
        ]);

        // Update reward redemption count
        $reward->increment('current_redemptions');

        return $redemption;
    }

    public function markAsUsed(): void
    {
        $this->update([
            'status' => 'used',
            'used_at' => now(),
        ]);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
