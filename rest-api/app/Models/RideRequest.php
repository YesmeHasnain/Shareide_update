<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RideRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'rider_id',
        'driver_id',
        'schedule_id',
        'pickup_lat',
        'pickup_lng',
        'pickup_address',
        'drop_lat',
        'drop_lng',
        'drop_address',
        'seats',
        'status',
        'estimated_price',
        'actual_price',
        'scheduled_at',
        'started_at',
        'completed_at',
        'matched_at',
        'accepted_at',
        'cancelled_at',
        'match_score',
        'payment_method',
        'payment_status',
        'commission_amount',
        'driver_earning',
        'distance_km',
        'duration_minutes',
        'cancellation_reason',
        'cancelled_by',
        'promo_code',
        'notes',
    ];

    protected $casts = [
        'pickup_lat' => 'decimal:7',
        'pickup_lng' => 'decimal:7',
        'drop_lat' => 'decimal:7',
        'drop_lng' => 'decimal:7',
        'estimated_price' => 'decimal:2',
        'actual_price' => 'decimal:2',
        'match_score' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'driver_earning' => 'decimal:2',
        'distance_km' => 'decimal:2',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'matched_at' => 'datetime',
        'accepted_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    // Calculate distance between two points (Haversine formula)
    public static function calculateDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    // Calculate estimated price based on distance
    public function calculateEstimatedPrice()
    {
        $distance = self::calculateDistance(
            $this->pickup_lat,
            $this->pickup_lng,
            $this->drop_lat,
            $this->drop_lng
        );

        // Base fare + per km rate
        $baseFare = 100; // PKR
        $perKmRate = 30; // PKR

        return $baseFare + ($distance * $perKmRate);
    }
}