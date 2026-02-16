<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'referrer_id',
        'referred_id',
        'referral_code',
        'referrer_reward',
        'referred_reward',
        'status',
        'reward_claimed',
        'completed_at',
    ];

    protected $casts = [
        'referrer_reward' => 'decimal:2',
        'referred_reward' => 'decimal:2',
        'reward_claimed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    // Relationships
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referred()
    {
        return $this->belongsTo(User::class, 'referred_id');
    }
}