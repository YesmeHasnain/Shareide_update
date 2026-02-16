<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LiveSelfieVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'selfie_image',
        'status',
        'latitude',
        'longitude',
        'device_info',
        'verified_at',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'verified_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    // Get today's verification for a driver
    public static function getTodayVerification($driverId)
    {
        return self::where('driver_id', $driverId)
            ->whereDate('created_at', today())
            ->where('status', 'verified')
            ->first();
    }

    // Check if driver needs verification today
    public static function needsVerificationToday($driverId)
    {
        return !self::getTodayVerification($driverId);
    }
}
