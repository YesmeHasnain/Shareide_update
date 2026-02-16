<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAchievement extends Model
{
    protected $fillable = [
        'user_id',
        'achievement_id',
        'current_progress',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function achievement(): BelongsTo
    {
        return $this->belongsTo(Achievement::class);
    }

    public function updateProgress(int $newProgress): void
    {
        $this->current_progress = $newProgress;

        if ($newProgress >= $this->achievement->target_value && !$this->is_completed) {
            $this->is_completed = true;
            $this->completed_at = now();

            // Award points for completing achievement
            if ($this->achievement->points_reward > 0) {
                LoyaltyPoint::earnPoints(
                    $this->user,
                    $this->achievement->points_reward,
                    'achievement',
                    $this->achievement_id,
                    "Achievement unlocked: {$this->achievement->name}"
                );
            }
        }

        $this->save();
    }
}
