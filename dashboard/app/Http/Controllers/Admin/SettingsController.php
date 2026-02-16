<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;

class SettingsController extends Controller
{
    /**
     * Show settings page
     */
    public function index()
    {
        $settings = $this->getSettings();
        return view('admin.settings.index', compact('settings'));
    }

    /**
     * Update general settings
     */
    public function updateGeneral(Request $request)
    {
        $request->validate([
            'app_name' => 'required|string|max:100',
            'support_email' => 'nullable|email',
            'support_phone' => 'nullable|string|max:20',
            'currency' => 'required|string|max:10',
            'timezone' => 'required|string',
        ]);

        $this->saveSetting('app_name', $request->app_name);
        $this->saveSetting('support_email', $request->support_email);
        $this->saveSetting('support_phone', $request->support_phone);
        $this->saveSetting('currency', $request->currency);
        $this->saveSetting('timezone', $request->timezone);

        return back()->with('success', 'General settings updated.');
    }

    /**
     * Update commission settings
     */
    public function updateCommission(Request $request)
    {
        $request->validate([
            'commission_rate' => 'required|numeric|min:0|max:50',
            'min_commission' => 'nullable|numeric|min:0',
            'max_commission' => 'nullable|numeric|min:0',
        ]);

        $this->saveSetting('commission_rate', $request->commission_rate);
        $this->saveSetting('min_commission', $request->min_commission ?? 0);
        $this->saveSetting('max_commission', $request->max_commission ?? 0);

        return back()->with('success', 'Commission settings updated.');
    }

    /**
     * Update pricing settings
     */
    public function updatePricing(Request $request)
    {
        $request->validate([
            'base_fare_car' => 'required|numeric|min:0',
            'per_km_car' => 'required|numeric|min:0',
            'base_fare_bike' => 'required|numeric|min:0',
            'per_km_bike' => 'required|numeric|min:0',
            'min_fare' => 'required|numeric|min:0',
            'surge_multiplier' => 'nullable|numeric|min:1|max:5',
        ]);

        $this->saveSetting('base_fare_car', $request->base_fare_car);
        $this->saveSetting('per_km_car', $request->per_km_car);
        $this->saveSetting('base_fare_bike', $request->base_fare_bike);
        $this->saveSetting('per_km_bike', $request->per_km_bike);
        $this->saveSetting('min_fare', $request->min_fare);
        $this->saveSetting('surge_multiplier', $request->surge_multiplier ?? 1);

        return back()->with('success', 'Pricing settings updated.');
    }

    /**
     * Update notification settings
     */
    public function updateNotifications(Request $request)
    {
        $this->saveSetting('sms_notifications_enabled', $request->boolean('sms_notifications_enabled'));
        $this->saveSetting('push_notifications_enabled', $request->boolean('push_notifications_enabled'));
        $this->saveSetting('email_notifications_enabled', $request->boolean('email_notifications_enabled'));
        $this->saveSetting('whatsapp_notifications_enabled', $request->boolean('whatsapp_notifications_enabled'));

        return back()->with('success', 'Notification settings updated.');
    }

    /**
     * Admin profile page
     */
    public function profile()
    {
        $admin = auth()->user()->load('adminRole');
        return view('admin.settings.profile', compact('admin'));
    }

    /**
     * Update admin profile
     */
    public function updateProfile(Request $request)
    {
        $admin = auth()->user();

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email,' . $admin->id,
            'phone' => 'nullable|string|max:20',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone ?? $admin->phone,
        ];

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            // Delete old photo if exists
            if ($admin->profile_photo && \Storage::disk('public')->exists($admin->profile_photo)) {
                \Storage::disk('public')->delete($admin->profile_photo);
            }

            // Store new photo
            $path = $request->file('profile_photo')->store('admin-photos', 'public');
            $data['profile_photo'] = $path;
        }

        $admin->update($data);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Remove profile photo
     */
    public function removePhoto()
    {
        $admin = auth()->user();

        if ($admin->profile_photo && \Storage::disk('public')->exists($admin->profile_photo)) {
            \Storage::disk('public')->delete($admin->profile_photo);
        }

        $admin->update(['profile_photo' => null]);

        return back()->with('success', 'Profile photo removed.');
    }

    /**
     * Update admin password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $admin = auth()->user();

        if (!Hash::check($request->current_password, $admin->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $admin->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password changed successfully.');
    }

    /**
     * Manage admin users
     */
    public function adminUsers()
    {
        $admins = User::where('role', 'admin')->get();
        return view('admin.settings.admin-users', compact('admins'));
    }

    /**
     * Create new admin user
     */
    public function createAdmin(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
            'status' => 'active',
            'phone' => 'admin_' . time(),
        ]);

        return back()->with('success', 'Admin user created successfully.');
    }

    /**
     * Delete admin user
     */
    public function deleteAdmin($id)
    {
        if (auth()->id() == $id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $admin = User::where('role', 'admin')->findOrFail($id);
        $admin->delete();

        return back()->with('success', 'Admin user deleted.');
    }

    /**
     * Clear cache
     */
    public function clearCache()
    {
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('view:clear');

        return back()->with('success', 'Cache cleared successfully.');
    }

    /**
     * Helper: Get all settings
     */
    private function getSettings()
    {
        return [
            // General
            'app_name' => $this->getSetting('app_name', 'SHAREIDE'),
            'support_email' => $this->getSetting('support_email', ''),
            'support_phone' => $this->getSetting('support_phone', ''),
            'currency' => $this->getSetting('currency', 'PKR'),
            'timezone' => $this->getSetting('timezone', 'Asia/Karachi'),

            // Commission
            'commission_rate' => $this->getSetting('commission_rate', 15),
            'min_commission' => $this->getSetting('min_commission', 0),
            'max_commission' => $this->getSetting('max_commission', 0),

            // Pricing
            'base_fare_car' => $this->getSetting('base_fare_car', 100),
            'per_km_car' => $this->getSetting('per_km_car', 25),
            'base_fare_bike' => $this->getSetting('base_fare_bike', 50),
            'per_km_bike' => $this->getSetting('per_km_bike', 15),
            'min_fare' => $this->getSetting('min_fare', 100),
            'surge_multiplier' => $this->getSetting('surge_multiplier', 1),

            // Notifications
            'sms_notifications_enabled' => $this->getSetting('sms_notifications_enabled', true),
            'push_notifications_enabled' => $this->getSetting('push_notifications_enabled', true),
            'email_notifications_enabled' => $this->getSetting('email_notifications_enabled', false),
            'whatsapp_notifications_enabled' => $this->getSetting('whatsapp_notifications_enabled', true),
        ];
    }

    /**
     * Helper: Get a setting value
     */
    private function getSetting($key, $default = null)
    {
        return Cache::rememberForever("setting_{$key}", function () use ($key, $default) {
            // You can use database table for settings instead
            return config("app.{$key}", $default);
        });
    }

    /**
     * Helper: Save a setting
     */
    private function saveSetting($key, $value)
    {
        Cache::forever("setting_{$key}", $value);
        // TODO: Save to database if using settings table
    }
}
