<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SosAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ride_request_id',
        'latitude',
        'longitude',
        'location_address',
        'message',
        'type',
        'status',
        'resolved_at',
        'resolution_note',
        'contacts_notified',
        'admin_notified',
        'police_notified',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'contacts_notified' => 'boolean',
        'admin_notified' => 'boolean',
        'police_notified' => 'boolean',
        'resolved_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rideRequest()
    {
        return $this->belongsTo(RideRequest::class);
    }
}