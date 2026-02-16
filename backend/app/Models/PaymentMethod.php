<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentMethod extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'label',
        'last_four',
        'mobile_number',
        'details',
        'is_default',
    ];

    protected $casts = [
        'details' => 'array',
        'is_default' => 'boolean',
    ];

    protected $hidden = [
        'details',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
