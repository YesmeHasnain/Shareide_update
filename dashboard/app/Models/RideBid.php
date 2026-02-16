<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RideBid extends Model
{
    protected $fillable = [
        'ride_request_id',
        'driver_id',
        'bid_amount',
        'eta_minutes',
        'note',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'bid_amount' => 'decimal:2',
        'expires_at' => 'datetime',
    ];

    public function rideRequest(): BelongsTo
    {
        return $this->belongsTo(RideRequest::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function accept(): void
    {
        $this->update(['status' => 'accepted']);

        // Reject all other bids for this ride
        self::where('ride_request_id', $this->ride_request_id)
            ->where('id', '!=', $this->id)
            ->where('status', 'pending')
            ->update(['status' => 'rejected']);
    }

    public function reject(): void
    {
        $this->update(['status' => 'rejected']);
    }

    public function withdraw(): void
    {
        $this->update(['status' => 'withdrawn']);
    }
}
