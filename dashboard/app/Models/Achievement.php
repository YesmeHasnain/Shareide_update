<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Achievement extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'badge_image',
        'points_reward',
        'type',
        'target_value',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function userAchievements(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }

    public static function checkAndAward(User $user, string $type, int $currentValue): void
    {
        $achievements = self::where('type', $type)
            ->where('is_active', true)
            ->where('target_value', '<=', $currentValue)
            ->get();

        foreach ($achievements as $achievement) {
            $userAchievement = UserAchievement::firstOrCreate([
                'user_id' => $user->id,
                'achievement_id' => $achievement->id,
            ]);

            if (!$userAchievement->is_completed) {
                $userAchievement->update([
                    'current_progress' => min($currentValue, $achievement->target_value),
                    'is_completed' => $currentValue >= $achievement->target_value,
                    'completed_at' => $currentValue >= $achievement->target_value ? now() : null,
                ]);
            }
        }
    }
}
