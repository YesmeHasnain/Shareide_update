<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'profile_photo',
        'phone',
        'email',
        'password',
        'role',
        'status',
        'is_active',
        'admin_role_id',
        'last_login_at',
        'loyalty_tier_id',
        'total_loyalty_points',
        'available_loyalty_points',
        'rating',
        'total_rides',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
    ];

    // Relationships
    public function adminRole()
    {
        return $this->belongsTo(AdminRole::class);
    }

    public function riderProfile()
    {
        return $this->hasOne(RiderProfile::class);
    }

    public function driver()
    {
        return $this->hasOne(Driver::class);
    }

    public function ridesAsRider()
    {
        return $this->hasMany(RideRequest::class, 'rider_id');
    }

    public function ridesAsDriver()
    {
        return $this->hasMany(RideRequest::class, 'driver_id');
    }

    // Alias for rides (used by RideController)
    public function rides()
    {
        return $this->hasMany(RideRequest::class, 'rider_id');
    }

    // Wallet relationships
    public function riderWallet()
    {
        return $this->hasOne(RiderWallet::class);
    }

    public function driverWallet()
    {
        return $this->hasOne(Wallet::class);
    }

    // Saved places
    public function savedPlaces()
    {
        return $this->hasMany(SavedPlace::class);
    }

    // Emergency contacts
    public function emergencyContacts()
    {
        return $this->hasMany(EmergencyContact::class);
    }

    // Helper methods
    public function isRider()
    {
        return $this->role === 'rider';
    }

    public function isDriver()
    {
        return $this->role === 'driver';
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    // Check if admin has a specific permission
    public function hasPermission($permission)
    {
        if (!$this->isAdmin()) {
            return false;
        }

        // Load role if not loaded
        if (!$this->relationLoaded('adminRole')) {
            $this->load('adminRole');
        }

        return $this->adminRole?->hasPermission($permission) ?? false;
    }

    // Support tickets
    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class);
    }

    // Audit logs
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    // Get profile photo URL
    public function getProfilePhotoUrlAttribute()
    {
        if ($this->profile_photo) {
            return asset('storage/' . $this->profile_photo);
        }
        return null;
    }

    // Get initials for avatar
    public function getInitialsAttribute()
    {
        return strtoupper(substr($this->name ?? 'A', 0, 1));
    }

    // Loyalty & Rewards relationships
    public function loyaltyTier()
    {
        return $this->belongsTo(LoyaltyTier::class);
    }

    public function loyaltyPoints()
    {
        return $this->hasMany(LoyaltyPoint::class);
    }

    public function achievements()
    {
        return $this->hasMany(UserAchievement::class);
    }

    public function rewardRedemptions()
    {
        return $this->hasMany(RewardRedemption::class);
    }

    public function deviceTokens()
    {
        return $this->hasMany(DeviceToken::class);
    }

    // Update loyalty tier based on total points
    public function updateLoyaltyTier(): void
    {
        $newTier = LoyaltyTier::getTierForPoints($this->total_loyalty_points);

        if ($newTier && $newTier->id !== $this->loyalty_tier_id) {
            $this->update(['loyalty_tier_id' => $newTier->id]);
        }
    }
}