<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdminRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'permissions',
        'is_active',
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_active' => 'boolean',
    ];

    // All available permissions (flat array for storage)
    public static function allPermissions()
    {
        return [
            'view_dashboard',
            'manage_drivers',
            'view_drivers',
            'approve_drivers',
            'block_drivers',
            'manage_riders',
            'view_riders',
            'block_riders',
            'manage_rides',
            'view_rides',
            'cancel_rides',
            'manage_payments',
            'view_payments',
            'manage_withdrawals',
            'manage_support',
            'view_support',
            'respond_tickets',
            'manage_promo_codes',
            'view_promo_codes',
            'manage_settings',
            'view_settings',
            'manage_fare',
            'manage_commission',
            'view_reports',
            'export_reports',
            'view_analytics',
            'view_map',
            'manage_sos',
            'view_sos',
            'view_chats',
            'manage_admins',
            'view_admins',
            'manage_roles',
            'view_audit_logs',
            'manage_alerts',
        ];
    }

    // Permission groups for display in UI
    public static function permissionGroups()
    {
        return [
            'Dashboard' => ['view_dashboard'],
            'Drivers' => ['manage_drivers', 'view_drivers', 'approve_drivers', 'block_drivers'],
            'Riders' => ['manage_riders', 'view_riders', 'block_riders'],
            'Rides' => ['manage_rides', 'view_rides', 'cancel_rides'],
            'Payments' => ['manage_payments', 'view_payments', 'manage_withdrawals'],
            'Support' => ['manage_support', 'view_support', 'respond_tickets'],
            'Promo Codes' => ['manage_promo_codes', 'view_promo_codes'],
            'Settings' => ['manage_settings', 'view_settings', 'manage_fare', 'manage_commission'],
            'Reports & Analytics' => ['view_reports', 'export_reports', 'view_analytics', 'view_map'],
            'SOS' => ['manage_sos', 'view_sos'],
            'Chats' => ['view_chats'],
            'Admin Management' => ['manage_admins', 'view_admins', 'manage_roles', 'view_audit_logs', 'manage_alerts'],
        ];
    }

    public function users()
    {
        return $this->hasMany(User::class, 'admin_role_id');
    }

    public function hasPermission($permission)
    {
        if ($this->name === 'super_admin') {
            return true;
        }

        return in_array($permission, $this->permissions ?? []);
    }
}
