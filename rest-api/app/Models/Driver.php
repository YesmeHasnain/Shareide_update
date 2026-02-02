<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'cnic',
        'cnic_name',
        'address',
        'city',
        'vehicle_type',
        'vehicle_model',
        'plate_number',
        'seats',
        'status',
        'ban_reason',
        'banned_at',
        'is_online',
        'current_lat',
        'current_lng',
        'current_latitude',
        'current_longitude',
        'rating',
        'rating_average',
        'total_rides',
        'completed_rides_count',
    ];

    protected $casts = [
        'is_online' => 'boolean',
        'current_lat' => 'decimal:8',
        'current_lng' => 'decimal:8',
        'current_latitude' => 'decimal:8',
        'current_longitude' => 'decimal:8',
        'rating' => 'decimal:2',
        'rating_average' => 'decimal:2',
        'total_rides' => 'integer',
        'completed_rides_count' => 'integer',
        'seats' => 'integer',
        'banned_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Vehicle info is stored directly in drivers table (vehicle_type, vehicle_model, plate_number)
    // No separate vehicle relationship needed

    public function documents()
    {
        return $this->hasOne(DriverDocument::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function rideRequests()
    {
        return $this->hasMany(RideRequest::class);
    }

    // Alias for admin panel
    public function ridesAsDriver()
    {
        return $this->hasMany(RideRequest::class, 'driver_id');
    }

    // Live selfie verifications
    public function liveSelfieVerifications()
    {
        return $this->hasMany(LiveSelfieVerification::class);
    }

    // Latest live selfie verification
    public function latestSelfieVerification()
    {
        return $this->hasOne(LiveSelfieVerification::class)->latest();
    }

    // Check if driver's CNIC is banned
    public static function isCnicBanned($cnic)
    {
        return BannedCnic::isBanned($cnic);
    }
}