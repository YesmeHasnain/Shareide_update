<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SharedRideBid extends Model
{
    protected $fillable = [
        'ride_id',
        'user_id',
        'bid_amount',
        'seats_requested',
        'status',
    ];

    protected $casts = [
        'bid_amount' => 'integer',
        'seats_requested' => 'integer',
    ];

    public function ride()
    {
        return $this->belongsTo(SharedRide::class, 'ride_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
