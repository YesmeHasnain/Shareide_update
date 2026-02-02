<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoyaltyReward extends Model
{
    protected $fillable = [
        'name',
        'description',
        'points_required',
        'reward_type',
        'reward_value',
        'image',
        'terms_conditions',
        'max_redemptions',
        'current_redemptions',
        'valid_from',
        'valid_until',
        'is_active',
    ];

    protected $casts = [
        'reward_value' => 'decimal:2',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function redemptions(): HasMany
    {
        return $this->hasMany(RewardRedemption::class);
    }

    public function isAvailable(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->valid_from && $this->valid_from->isFuture()) {
            return false;
        }

        if ($this->valid_until && $this->valid_until->isPast()) {
            return false;
        }

        if ($this->max_redemptions && $this->current_redemptions >= $this->max_redemptions) {
            return false;
        }

        return true;
    }

    public function canBeRedeemedBy(User $user): bool
    {
        if (!$this->isAvailable()) {
            return false;
        }

        if ($user->available_loyalty_points < $this->points_required) {
            return false;
        }

        return true;
    }
}
