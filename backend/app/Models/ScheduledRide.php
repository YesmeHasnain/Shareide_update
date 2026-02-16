<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ScheduledRide extends Model
{
    protected $fillable = [
        'user_id',
        'pickup_address',
        'pickup_lat',
        'pickup_lng',
        'drop_address',
        'drop_lat',
        'drop_lng',
        'scheduled_date',
        'scheduled_time',
        'scheduled_at',
        'vehicle_type',
        'payment_method',
        'estimated_fare',
        'distance_km',
        'status',
        'ride_request_id',
        'notes',
        'retry_count',
        'last_retry_at',
        'failure_reason',
        'reminder_30min_sent',
        'reminder_10min_sent',
        'booking_notification_sent',
    ];

    protected $casts = [
        'pickup_lat' => 'decimal:8',
        'pickup_lng' => 'decimal:8',
        'drop_lat' => 'decimal:8',
        'drop_lng' => 'decimal:8',
        'estimated_fare' => 'decimal:2',
        'distance_km' => 'decimal:2',
        'scheduled_date' => 'date',
        'scheduled_at' => 'datetime',
        'last_retry_at' => 'datetime',
        'reminder_30min_sent' => 'boolean',
        'reminder_10min_sent' => 'boolean',
        'booking_notification_sent' => 'boolean',
    ];

    protected $appends = ['formatted_schedule', 'is_upcoming'];

    /**
     * Get the user that owns this scheduled ride
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the actual ride request when booked
     */
    public function rideRequest(): BelongsTo
    {
        return $this->belongsTo(RideRequest::class);
    }

    /**
     * Get formatted schedule datetime
     */
    public function getFormattedScheduleAttribute(): string
    {
        $date = Carbon::parse($this->scheduled_date);
        $time = Carbon::parse($this->scheduled_time);

        if ($date->isToday()) {
            return 'Today at ' . $time->format('h:i A');
        } elseif ($date->isTomorrow()) {
            return 'Tomorrow at ' . $time->format('h:i A');
        }

        return $date->format('D, M j') . ' at ' . $time->format('h:i A');
    }

    /**
     * Check if this is an upcoming ride
     */
    public function getIsUpcomingAttribute(): bool
    {
        return $this->status === 'pending' && $this->scheduled_at > now();
    }

    /**
     * Scope for pending rides that need to be processed
     */
    public function scopeReadyToBook($query)
    {
        return $query->where('status', 'pending')
            ->where('scheduled_at', '<=', now()->addMinutes(5))
            ->where('scheduled_at', '>=', now()->subMinutes(10));
    }

    /**
     * Scope for rides needing 30-minute reminder
     */
    public function scopeNeeds30MinReminder($query)
    {
        return $query->where('status', 'pending')
            ->where('reminder_30min_sent', false)
            ->whereBetween('scheduled_at', [now()->addMinutes(25), now()->addMinutes(35)]);
    }

    /**
     * Scope for rides needing 10-minute reminder
     */
    public function scopeNeeds10MinReminder($query)
    {
        return $query->where('status', 'pending')
            ->where('reminder_10min_sent', false)
            ->whereBetween('scheduled_at', [now()->addMinutes(8), now()->addMinutes(12)]);
    }

    /**
     * Calculate distance using Haversine formula
     */
    public function calculateDistance(): float
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($this->drop_lat - $this->pickup_lat);
        $dLng = deg2rad($this->drop_lng - $this->pickup_lng);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($this->pickup_lat)) * cos(deg2rad($this->drop_lat)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Calculate estimated fare based on vehicle type
     */
    public function calculateFare(): float
    {
        $distance = $this->distance_km ?? $this->calculateDistance();

        $baseFares = [
            'bike' => ['base' => 30, 'per_km' => 12],
            'rickshaw' => ['base' => 50, 'per_km' => 18],
            'car' => ['base' => 100, 'per_km' => 25],
            'ac_car' => ['base' => 150, 'per_km' => 35],
        ];

        $rates = $baseFares[$this->vehicle_type] ?? $baseFares['car'];
        $fare = $rates['base'] + ($rates['per_km'] * $distance);

        return ceil($fare / 10) * 10; // Round to nearest 10
    }
}
