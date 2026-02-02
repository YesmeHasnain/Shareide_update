<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BannedCnic extends Model
{
    use HasFactory;

    protected $fillable = [
        'cnic',
        'name',
        'reason',
        'banned_by',
        'original_driver_id',
    ];

    public function bannedByUser()
    {
        return $this->belongsTo(User::class, 'banned_by');
    }

    // Check if a CNIC is banned
    public static function isBanned($cnic)
    {
        // Normalize CNIC (remove dashes)
        $normalizedCnic = str_replace('-', '', $cnic);

        return self::where('cnic', $cnic)
            ->orWhere('cnic', $normalizedCnic)
            ->exists();
    }
}
