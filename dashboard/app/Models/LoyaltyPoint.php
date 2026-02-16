<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltyPoint extends Model
{
    protected $fillable = [
        'user_id',
        'points',
        'type',
        'source',
        'source_id',
        'description',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function earnPoints(User $user, int $points, string $source, ?int $sourceId = null, ?string $description = null): self
    {
        // Apply tier multiplier
        $multiplier = $user->loyaltyTier?->points_multiplier ?? 1.0;
        $actualPoints = (int) round($points * $multiplier);

        $loyaltyPoint = self::create([
            'user_id' => $user->id,
            'points' => $actualPoints,
            'type' => 'earned',
            'source' => $source,
            'source_id' => $sourceId,
            'description' => $description ?? "Earned {$actualPoints} points from {$source}",
            'expires_at' => now()->addYear(), // Points expire in 1 year
        ]);

        // Update user's points
        $user->increment('total_loyalty_points', $actualPoints);
        $user->increment('available_loyalty_points', $actualPoints);

        // Check for tier upgrade
        $user->updateLoyaltyTier();

        return $loyaltyPoint;
    }

    public static function deductPoints(User $user, int $points, string $source, ?int $sourceId = null, ?string $reason = null): self
    {
        $loyaltyPoint = self::create([
            'user_id' => $user->id,
            'points' => -$points,
            'type' => 'deducted',
            'source' => $source,
            'source_id' => $sourceId,
            'description' => $reason ?? "Deducted {$points} points from {$source}",
        ]);

        // Decrement points (floor at 0) - single DB update
        $newAvailable = max(0, $user->available_loyalty_points - $points);
        $newTotal = max(0, $user->total_loyalty_points - $points);
        $user->update([
            'available_loyalty_points' => $newAvailable,
            'total_loyalty_points' => $newTotal,
        ]);

        // Check for tier downgrade
        $user->updateLoyaltyTier();

        return $loyaltyPoint;
    }

    public static function redeemPoints(User $user, int $points, string $description): ?self
    {
        if ($user->available_loyalty_points < $points) {
            return null;
        }

        $loyaltyPoint = self::create([
            'user_id' => $user->id,
            'points' => -$points,
            'type' => 'redeemed',
            'description' => $description,
        ]);

        $user->decrement('available_loyalty_points', $points);

        return $loyaltyPoint;
    }
}
