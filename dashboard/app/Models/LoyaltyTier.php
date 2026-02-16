<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoyaltyTier extends Model
{
    protected $fillable = [
        'name',
        'min_points',
        'max_points',
        'discount_percentage',
        'points_multiplier',
        'benefits',
        'badge_color',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'benefits' => 'array',
        'discount_percentage' => 'decimal:2',
        'points_multiplier' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public static function getTierForPoints(int $points): ?self
    {
        return self::where('is_active', true)
            ->where('min_points', '<=', $points)
            ->where(function ($query) use ($points) {
                $query->whereNull('max_points')
                    ->orWhere('max_points', '>=', $points);
            })
            ->orderBy('min_points', 'desc')
            ->first();
    }
}
