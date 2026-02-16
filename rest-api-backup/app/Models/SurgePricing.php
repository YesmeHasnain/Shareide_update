<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class SurgePricing extends Model
{
    use HasFactory;

    protected $fillable = [
        'city',
        'multiplier',
        'reason',
        'is_auto',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected $casts = [
        'multiplier' => 'decimal:2',
        'is_auto' => 'boolean',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    // Get active surge for a city
    public static function getActiveSurge($city)
    {
        return self::where('city', $city)
            ->where('is_active', true)
            ->where('starts_at', '<=', Carbon::now())
            ->where(function ($q) {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>', Carbon::now());
            })
            ->orderBy('multiplier', 'desc')
            ->first();
    }

    // Scope for active surges
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('starts_at', '<=', Carbon::now())
            ->where(function ($q) {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>', Carbon::now());
            });
    }
}
