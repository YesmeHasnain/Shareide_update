<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'ride_request_id',
        'rider_id',
        'driver_id',
        'last_message',
        'last_message_at',
        'last_message_by',
        'unread_count_rider',
        'unread_count_driver',
        'status',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'unread_count_rider' => 'integer',
        'unread_count_driver' => 'integer',
    ];

    // Relationships
    public function rideRequest()
    {
        return $this->belongsTo(RideRequest::class);
    }

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function lastMessageSender()
    {
        return $this->belongsTo(User::class, 'last_message_by');
    }
}