<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'type',
        'registration_number',
        'make',
        'model',
        'year',
        'color',
        'status',
    ];

    protected $casts = [
        'year' => 'integer',
    ];

    // Relationships
    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}