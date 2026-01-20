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
        'address',
        'city',
        'status',
        'is_online',
        'current_latitude',
        'current_longitude',
        'rating',
        'total_rides',
    ];

    protected $casts = [
        'is_online' => 'boolean',
        'current_latitude' => 'decimal:8',
        'current_longitude' => 'decimal:8',
        'rating' => 'decimal:2',
        'total_rides' => 'integer',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vehicle()
    {
        return $this->hasOne(Vehicle::class);
    }

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
}