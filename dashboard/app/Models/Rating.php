<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'ride_request_id',
        'driver_id',
        'rider_id',
        'driver_rating',
        'driver_comment',
        'driver_negative_reason',
        'rider_rating',
        'rider_comment',
        'rider_negative_reason',
    ];

    protected $casts = [
        'driver_rating' => 'integer',
        'rider_rating' => 'integer',
    ];

    // Relationships
    public function rideRequest()
    {
        return $this->belongsTo(RideRequest::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id', 'user_id');
    }

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }
}