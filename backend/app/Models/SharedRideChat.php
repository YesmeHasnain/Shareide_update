<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SharedRideChat extends Model
{
    protected $fillable = [
        'ride_id',
        'sender_id',
        'receiver_id',
        'message',
    ];

    public function ride()
    {
        return $this->belongsTo(SharedRide::class, 'ride_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
