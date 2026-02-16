<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PromoCodeUsage extends Model
{
    use HasFactory;

    protected $table = 'promo_code_usage';

    protected $fillable = [
        'promo_code_id',
        'user_id',
        'ride_request_id',
        'original_amount',
        'discount_amount',
        'final_amount',
    ];

    protected $casts = [
        'original_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
    ];

    // Relationships
    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rideRequest()
    {
        return $this->belongsTo(RideRequest::class);
    }
}