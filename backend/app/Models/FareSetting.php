<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FareSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'city',
        'vehicle_type',
        'base_fare',
        'per_km_rate',
        'per_minute_rate',
        'minimum_fare',
        'booking_fee',
        'cancellation_fee',
        'waiting_charge_per_min',
        'is_active',
    ];

    protected $casts = [
        'base_fare' => 'decimal:2',
        'per_km_rate' => 'decimal:2',
        'per_minute_rate' => 'decimal:2',
        'minimum_fare' => 'decimal:2',
        'booking_fee' => 'decimal:2',
        'cancellation_fee' => 'decimal:2',
        'waiting_charge_per_min' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Calculate fare for a ride
    public static function calculateFare($city, $vehicleType, $distanceKm, $durationMinutes = 0)
    {
        $setting = self::where('city', $city)
            ->where('vehicle_type', $vehicleType)
            ->where('is_active', true)
            ->first();

        if (!$setting) {
            // Use default settings
            $setting = self::where('city', 'default')
                ->where('vehicle_type', $vehicleType)
                ->where('is_active', true)
                ->first();
        }

        if (!$setting) {
            // Fallback calculation
            return $vehicleType === 'car'
                ? max(150, 100 + ($distanceKm * 30))
                : max(80, 50 + ($distanceKm * 15));
        }

        $fare = $setting->base_fare;
        $fare += $distanceKm * $setting->per_km_rate;
        $fare += $durationMinutes * $setting->per_minute_rate;
        $fare += $setting->booking_fee;

        // Apply surge pricing if active
        $surge = SurgePricing::getActiveSurge($city);
        if ($surge) {
            $fare *= $surge->multiplier;
        }

        return max($fare, $setting->minimum_fare);
    }
}
