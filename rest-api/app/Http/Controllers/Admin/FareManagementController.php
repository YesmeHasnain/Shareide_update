<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FareSetting;
use App\Models\SurgePricing;
use App\Models\CommissionSetting;
use App\Models\ServiceZone;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class FareManagementController extends Controller
{
    public function index()
    {
        $fareSettings = FareSetting::orderBy('city')->orderBy('vehicle_type')->get();
        $surgePricing = SurgePricing::where('is_active', true)->orderBy('city')->get();
        $commissionSettings = CommissionSetting::where('is_active', true)->get();
        $serviceZones = ServiceZone::where('is_active', true)->get();

        $cities = FareSetting::distinct()->pluck('city');

        return view('admin.fare.index', compact(
            'fareSettings',
            'surgePricing',
            'commissionSettings',
            'serviceZones',
            'cities'
        ));
    }

    // Fare Settings
    public function storeFare(Request $request)
    {
        $request->validate([
            'city' => 'required|string|max:100',
            'vehicle_type' => 'required|in:car,bike',
            'base_fare' => 'required|numeric|min:0',
            'per_km_rate' => 'required|numeric|min:0',
            'per_minute_rate' => 'nullable|numeric|min:0',
            'minimum_fare' => 'required|numeric|min:0',
            'booking_fee' => 'nullable|numeric|min:0',
            'cancellation_fee' => 'nullable|numeric|min:0',
            'waiting_charge_per_min' => 'nullable|numeric|min:0',
        ]);

        $fare = FareSetting::updateOrCreate(
            ['city' => $request->city, 'vehicle_type' => $request->vehicle_type],
            $request->only([
                'base_fare', 'per_km_rate', 'per_minute_rate', 'minimum_fare',
                'booking_fee', 'cancellation_fee', 'waiting_charge_per_min', 'is_active'
            ])
        );

        AuditLog::log('fare_updated', "Fare settings updated for {$request->city} ({$request->vehicle_type})", $fare);

        return back()->with('success', 'Fare settings saved successfully.');
    }

    public function deleteFare($id)
    {
        $fare = FareSetting::findOrFail($id);
        $fare->delete();

        AuditLog::log('fare_deleted', "Fare settings deleted for {$fare->city} ({$fare->vehicle_type})");

        return back()->with('success', 'Fare settings deleted.');
    }

    // Surge Pricing
    public function storeSurge(Request $request)
    {
        $request->validate([
            'city' => 'required|string|max:100',
            'multiplier' => 'required|numeric|min:1|max:5',
            'reason' => 'nullable|string|max:255',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);

        $surge = SurgePricing::create([
            'city' => $request->city,
            'multiplier' => $request->multiplier,
            'reason' => $request->reason,
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at,
            'is_auto' => false,
            'is_active' => true,
        ]);

        AuditLog::log('surge_created', "Surge pricing {$request->multiplier}x created for {$request->city}", $surge);

        return back()->with('success', 'Surge pricing activated.');
    }

    public function deactivateSurge($id)
    {
        $surge = SurgePricing::findOrFail($id);
        $surge->update(['is_active' => false, 'ends_at' => now()]);

        AuditLog::log('surge_deactivated', "Surge pricing deactivated for {$surge->city}");

        return back()->with('success', 'Surge pricing deactivated.');
    }

    // Commission Settings
    public function storeCommission(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'city' => 'nullable|string|max:100',
            'vehicle_type' => 'required|in:car,bike,all',
            'min_rides_for_discount' => 'nullable|numeric|min:0',
            'discounted_value' => 'nullable|numeric|min:0',
        ]);

        // Deactivate existing settings for same city/vehicle_type
        CommissionSetting::where('city', $request->city)
            ->where('vehicle_type', $request->vehicle_type)
            ->update(['is_active' => false]);

        $commission = CommissionSetting::create($request->all() + ['is_active' => true]);

        AuditLog::log('commission_updated', "Commission settings updated: {$request->name}", $commission);

        return back()->with('success', 'Commission settings saved.');
    }

    public function deleteCommission($id)
    {
        $commission = CommissionSetting::findOrFail($id);
        $commission->delete();

        AuditLog::log('commission_deleted', "Commission settings deleted: {$commission->name}");

        return back()->with('success', 'Commission settings deleted.');
    }

    // Service Zones
    public function storeZone(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'type' => 'required|in:service_area,restricted,high_demand,airport,special',
            'coordinates' => 'required|json',
            'fare_multiplier' => 'nullable|numeric|min:0.5|max:3',
            'description' => 'nullable|string|max:500',
        ]);

        $zone = ServiceZone::create([
            'name' => $request->name,
            'city' => $request->city,
            'type' => $request->type,
            'coordinates' => json_decode($request->coordinates, true),
            'fare_multiplier' => $request->fare_multiplier ?? 1.00,
            'description' => $request->description,
            'is_active' => true,
        ]);

        AuditLog::log('zone_created', "Service zone created: {$request->name}", $zone);

        return back()->with('success', 'Service zone created.');
    }

    public function deleteZone($id)
    {
        $zone = ServiceZone::findOrFail($id);
        $zone->delete();

        AuditLog::log('zone_deleted', "Service zone deleted: {$zone->name}");

        return back()->with('success', 'Service zone deleted.');
    }

    // Calculate fare preview
    public function calculateFare(Request $request)
    {
        $request->validate([
            'city' => 'required|string',
            'vehicle_type' => 'required|in:car,bike',
            'distance_km' => 'required|numeric|min:0',
            'duration_minutes' => 'nullable|numeric|min:0',
        ]);

        $fare = FareSetting::calculateFare(
            $request->city,
            $request->vehicle_type,
            $request->distance_km,
            $request->duration_minutes ?? 0
        );

        $surge = SurgePricing::getActiveSurge($request->city);

        return response()->json([
            'fare' => round($fare, 2),
            'surge_active' => $surge ? true : false,
            'surge_multiplier' => $surge ? $surge->multiplier : 1,
        ]);
    }
}
