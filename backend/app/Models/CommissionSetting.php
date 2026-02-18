<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CommissionSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'value',
        'city',
        'vehicle_type',
        'min_rides_for_discount',
        'discounted_value',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_rides_for_discount' => 'decimal:2',
        'discounted_value' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Calculate commission for a ride
    public static function calculateCommission($fareAmount, $city, $vehicleType, $driverRideCount = 0)
    {
        $setting = self::where('is_active', true)
            ->where(function ($q) use ($city) {
                $q->where('city', $city)
                    ->orWhereNull('city');
            })
            ->where(function ($q) use ($vehicleType) {
                $q->where('vehicle_type', $vehicleType)
                    ->orWhere('vehicle_type', 'all');
            })
            ->orderByRaw('city IS NULL, vehicle_type = "all"')
            ->first();

        if (!$setting) {
            // Default 10% commission (InDrive-style)
            return $fareAmount * 0.10;
        }

        $rate = $setting->value;

        // Check for discount based on ride count
        if ($setting->min_rides_for_discount && $driverRideCount >= $setting->min_rides_for_discount) {
            $rate = $setting->discounted_value ?? $rate;
        }

        if ($setting->type === 'percentage') {
            return $fareAmount * ($rate / 100);
        }

        return $rate; // Fixed amount
    }
}
