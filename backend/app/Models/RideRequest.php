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
        'base_fare',
        'bid_amount',
        'bid_percentage',
        'is_bidding',
        'bid_count',
        'last_bid_at',
        'priority_score',
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
        'is_bidding_enabled',
        'min_bid_amount',
        'max_bid_amount',
        'estimated_fare',
        'final_fare',
        'negotiation_status',
        'tip_amount',
        'special_requests',
        'is_pet_friendly',
        'is_luggage',
        'is_ac_required',
        'service_type',
        'is_intercity',
        'departure_datetime',
        'max_passengers',
        'share_token',
    ];

    protected $casts = [
        'pickup_lat' => 'decimal:7',
        'pickup_lng' => 'decimal:7',
        'drop_lat' => 'decimal:7',
        'drop_lng' => 'decimal:7',
        'estimated_price' => 'decimal:2',
        'base_fare' => 'decimal:2',
        'bid_amount' => 'decimal:2',
        'bid_percentage' => 'decimal:2',
        'is_bidding' => 'boolean',
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
        'last_bid_at' => 'datetime',
        'is_bidding_enabled' => 'boolean',
        'min_bid_amount' => 'decimal:2',
        'max_bid_amount' => 'decimal:2',
        'estimated_fare' => 'decimal:2',
        'final_fare' => 'decimal:2',
        'tip_amount' => 'decimal:2',
        'is_pet_friendly' => 'boolean',
        'is_luggage' => 'boolean',
        'is_ac_required' => 'boolean',
        'is_intercity' => 'boolean',
        'departure_datetime' => 'datetime',
    ];

    // Bidding increment options (percentage above base fare)
    public const BID_INCREMENTS = [10, 20, 30, 50];

    // Calculate priority score based on bid
    public function calculatePriorityScore()
    {
        $basePriority = 0;

        // Higher bid = higher priority
        if ($this->bid_percentage > 0) {
            $basePriority += $this->bid_percentage * 2;
        }

        // More bid attempts = slightly higher priority (shows urgency)
        $basePriority += $this->bid_count * 5;

        return $basePriority;
    }

    // Increase bid by percentage
    public function increaseBid($percentage)
    {
        $this->bid_percentage = $percentage;
        $this->bid_amount = $this->base_fare * ($percentage / 100);
        $this->estimated_price = $this->base_fare + $this->bid_amount;
        $this->is_bidding = true;
        $this->bid_count += 1;
        $this->last_bid_at = now();
        $this->priority_score = $this->calculatePriorityScore();
        $this->save();

        return $this;
    }

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    // Returns the User who is the driver
    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    // Returns the Driver profile/details (plate number, vehicle info, etc.)
    public function driverDetails()
    {
        return $this->belongsTo(Driver::class, 'driver_id', 'user_id');
    }

    // Payment for this ride
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    // Chat for this ride
    public function chat()
    {
        return $this->hasOne(Chat::class);
    }

    // Rating for this ride
    public function rating()
    {
        return $this->hasOne(Rating::class);
    }

    // Driver bids for this ride (bidding system)
    public function bids()
    {
        return $this->hasMany(RideBid::class);
    }

    // Multi-stop waypoints
    public function stops()
    {
        return $this->hasMany(RideStop::class)->orderBy('stop_order');
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