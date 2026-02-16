<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'max_discount',
        'min_ride_amount',
        'total_usage_limit',
        'per_user_limit',
        'times_used',
        'valid_from',
        'valid_until',
        'is_active',
        'user_type',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'min_ride_amount' => 'decimal:2',
        'total_usage_limit' => 'integer',
        'per_user_limit' => 'integer',
        'times_used' => 'integer',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function usage()
    {
        return $this->hasMany(PromoCodeUsage::class);
    }

    // Alias for usages
    public function usages()
    {
        return $this->hasMany(PromoCodeUsage::class);
    }

    // Check if valid
    public function isValid()
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->valid_from && $now->lt($this->valid_from)) {
            return false;
        }

        if ($this->valid_until && $now->gt($this->valid_until)) {
            return false;
        }

        if ($this->total_usage_limit && $this->times_used >= $this->total_usage_limit) {
            return false;
        }

        return true;
    }

    // Calculate discount
    public function calculateDiscount($amount)
    {
        if ($amount < $this->min_ride_amount) {
            return 0;
        }

        if ($this->discount_type === 'percentage') {
            $discount = ($amount * $this->discount_value) / 100;
            
            if ($this->max_discount) {
                $discount = min($discount, $this->max_discount);
            }
            
            return round($discount, 2);
        }

        // Fixed discount
        return min($this->discount_value, $amount);
    }
}