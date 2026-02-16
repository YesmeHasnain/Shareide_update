<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'ride_request_id',
        'user_id',
        'driver_id',
        'amount',
        'payment_method',
        'payment_type',
        'status',
        'transaction_id',
        'gateway',
        'gateway_response',
        'commission_amount',
        'driver_earning',
        'commission_rate',
        'paid_at',
        'refunded_at',
        'failure_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'driver_earning' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'gateway_response' => 'array',
        'paid_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    // Relationships
    public function rideRequest()
    {
        return $this->belongsTo(RideRequest::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}