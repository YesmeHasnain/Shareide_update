<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'from_location',
        'from_latitude',
        'from_longitude',
        'to_location',
        'to_latitude',
        'to_longitude',
        'departure_time',
        'days',
        'matched_rides',
        'total_earnings',
        'is_active',
    ];

    protected $casts = [
        'days' => 'array',
        'from_latitude' => 'decimal:8',
        'from_longitude' => 'decimal:8',
        'to_latitude' => 'decimal:8',
        'to_longitude' => 'decimal:8',
        'total_earnings' => 'decimal:2',
        'matched_rides' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}