<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SharedRide extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'from_address',
        'from_lat',
        'from_lng',
        'to_address',
        'to_lat',
        'to_lng',
        'departure_time',
        'estimated_duration',
        'total_seats',
        'available_seats',
        'price_per_seat',
        'total_distance',
        'vehicle_type',
        'vehicle_model',
        'vehicle_color',
        'plate_number',
        'women_only',
        'ac_available',
        'luggage_allowed',
        'smoking_allowed',
        'pets_allowed',
        'notes',
        'status',
        'ride_type',
        'recurring_days',
        'end_date',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'end_date' => 'date',
        'from_lat' => 'decimal:8',
        'from_lng' => 'decimal:8',
        'to_lat' => 'decimal:8',
        'to_lng' => 'decimal:8',
        'price_per_seat' => 'decimal:2',
        'total_distance' => 'decimal:2',
        'women_only' => 'boolean',
        'ac_available' => 'boolean',
        'luggage_allowed' => 'boolean',
        'smoking_allowed' => 'boolean',
        'pets_allowed' => 'boolean',
        'recurring_days' => 'array',
    ];

    // Relationships
    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function bookings()
    {
        return $this->hasMany(SharedRideBooking::class);
    }

    public function confirmedBookings()
    {
        return $this->hasMany(SharedRideBooking::class)
            ->whereIn('status', ['confirmed', 'picked_up', 'dropped_off']);
    }

    public function pendingBookings()
    {
        return $this->hasMany(SharedRideBooking::class)
            ->where('status', 'pending');
    }

    public function passengers()
    {
        return $this->belongsToMany(User::class, 'shared_ride_bookings', 'shared_ride_id', 'passenger_id')
            ->withPivot(['seats_booked', 'status', 'amount', 'pickup_address', 'drop_address'])
            ->withTimestamps();
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('departure_time', '>', now());
    }

    public function scopeNearby($query, $lat, $lng, $radiusKm = 10)
    {
        // Haversine formula for distance calculation
        $haversine = "(6371 * acos(cos(radians($lat))
                     * cos(radians(from_lat))
                     * cos(radians(from_lng) - radians($lng))
                     + sin(radians($lat))
                     * sin(radians(from_lat))))";

        return $query->selectRaw("*, {$haversine} AS distance")
            ->whereRaw("{$haversine} < ?", [$radiusKm])
            ->orderBy('distance');
    }

    // Helpers
    public function getBookedSeatsAttribute()
    {
        return $this->confirmedBookings()->sum('seats_booked');
    }

    public function getRemainingSeatsAttribute()
    {
        return $this->total_seats - $this->booked_seats;
    }

    public function isFull()
    {
        return $this->remaining_seats <= 0;
    }

    public function canBook($seats = 1)
    {
        return $this->status === 'open'
            && $this->remaining_seats >= $seats
            && $this->departure_time > now();
    }

    public function updateAvailability()
    {
        $bookedSeats = $this->confirmedBookings()->sum('seats_booked');
        $this->available_seats = $this->total_seats - $bookedSeats;

        if ($this->available_seats <= 0) {
            $this->status = 'full';
        } elseif ($this->status === 'full') {
            $this->status = 'open';
        }

        $this->save();
    }
}
