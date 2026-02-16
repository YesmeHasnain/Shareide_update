<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SharedRideBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'shared_ride_id',
        'passenger_id',
        'seats_booked',
        'amount',
        'pickup_address',
        'pickup_lat',
        'pickup_lng',
        'drop_address',
        'drop_lat',
        'drop_lng',
        'status',
        'payment_status',
        'payment_method',
        'transaction_id',
        'accepted_at',
        'rejected_at',
        'confirmed_at',
        'picked_up_at',
        'dropped_off_at',
        'cancelled_at',
        'driver_rating',
        'driver_review',
        'passenger_rating',
        'passenger_review',
    ];

    protected $casts = [
        'pickup_lat' => 'decimal:8',
        'pickup_lng' => 'decimal:8',
        'drop_lat' => 'decimal:8',
        'drop_lng' => 'decimal:8',
        'amount' => 'decimal:2',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'dropped_off_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    // Relationships
    public function sharedRide()
    {
        return $this->belongsTo(SharedRide::class);
    }

    public function passenger()
    {
        return $this->belongsTo(User::class, 'passenger_id');
    }

    // Status Check Helpers
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isAccepted()
    {
        return $this->status === 'accepted';
    }

    public function isConfirmed()
    {
        return $this->status === 'confirmed';
    }

    public function isActive()
    {
        return in_array($this->status, ['confirmed', 'picked_up']);
    }

    public function isCompleted()
    {
        return $this->status === 'dropped_off';
    }

    public function isCancelled()
    {
        return in_array($this->status, ['cancelled', 'rejected', 'no_show']);
    }

    // Actions
    public function accept()
    {
        $this->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        // Update ride availability
        $this->sharedRide->updateAvailability();

        return $this;
    }

    public function reject()
    {
        $this->update([
            'status' => 'rejected',
            'rejected_at' => now(),
        ]);

        return $this;
    }

    public function confirm($paymentMethod = 'wallet', $transactionId = null)
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
            'payment_status' => 'paid',
            'payment_method' => $paymentMethod,
            'transaction_id' => $transactionId,
        ]);

        // Update ride availability
        $this->sharedRide->updateAvailability();

        return $this;
    }

    public function cancel()
    {
        $previousStatus = $this->status;

        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        // If was confirmed, refund and update availability
        if (in_array($previousStatus, ['accepted', 'confirmed'])) {
            $this->sharedRide->updateAvailability();
            // TODO: Process refund if paid
        }

        return $this;
    }

    public function markPickedUp()
    {
        $this->update([
            'status' => 'picked_up',
            'picked_up_at' => now(),
        ]);

        return $this;
    }

    public function markDroppedOff()
    {
        $this->update([
            'status' => 'dropped_off',
            'dropped_off_at' => now(),
        ]);

        return $this;
    }

    public function rateDriver($rating, $review = null)
    {
        $this->update([
            'driver_rating' => $rating,
            'driver_review' => $review,
        ]);

        // Update driver's average rating
        $driver = $this->sharedRide->driver;
        if ($driver && $driver->driver) {
            $avgRating = SharedRideBooking::whereHas('sharedRide', function ($q) use ($driver) {
                $q->where('driver_id', $driver->id);
            })->whereNotNull('driver_rating')->avg('driver_rating');

            $driver->driver->update(['rating_average' => $avgRating]);
        }

        return $this;
    }

    public function ratePassenger($rating, $review = null)
    {
        $this->update([
            'passenger_rating' => $rating,
            'passenger_review' => $review,
        ]);

        return $this;
    }
}
