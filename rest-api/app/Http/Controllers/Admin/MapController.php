<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\RideRequest;
use App\Models\SosAlert;
use App\Models\ServiceZone;
use Illuminate\Http\Request;

class MapController extends Controller
{
    public function index()
    {
        // Initial data for the map
        $onlineDrivers = Driver::with('user')
            ->where('status', 'approved')
            ->where('is_online', true)
            ->whereNotNull('current_lat')
            ->whereNotNull('current_lng')
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => $driver->id,
                    'name' => $driver->user->name ?? 'Unknown',
                    'phone' => $driver->user->phone ?? '',
                    'lat' => (float) $driver->current_lat,
                    'lng' => (float) $driver->current_lng,
                    'vehicle_type' => $driver->vehicle_type,
                    'plate_number' => $driver->plate_number,
                    'rating' => $driver->rating_average,
                    'status' => 'online',
                ];
            });

        $activeRides = RideRequest::with(['rider', 'driver'])
            ->whereIn('status', ['searching', 'driver_assigned', 'driver_arrived', 'in_progress'])
            ->get()
            ->map(function ($ride) {
                return [
                    'id' => $ride->id,
                    'rider_name' => $ride->rider->name ?? 'Unknown',
                    'driver_name' => $ride->driver->name ?? 'Searching',
                    'pickup_lat' => (float) $ride->pickup_lat,
                    'pickup_lng' => (float) $ride->pickup_lng,
                    'pickup_address' => $ride->pickup_address,
                    'drop_lat' => (float) $ride->drop_lat,
                    'drop_lng' => (float) $ride->drop_lng,
                    'drop_address' => $ride->drop_address,
                    'status' => $ride->status,
                    'fare' => $ride->estimated_price,
                ];
            });

        $activeSOS = SosAlert::with('user')
            ->where('status', 'active')
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'user_name' => $alert->user->name ?? 'Unknown',
                    'lat' => (float) $alert->latitude,
                    'lng' => (float) $alert->longitude,
                    'address' => $alert->location_address,
                    'message' => $alert->message,
                    'type' => $alert->type,
                    'created_at' => $alert->created_at->diffForHumans(),
                ];
            });

        $serviceZones = ServiceZone::where('is_active', true)->get();

        $stats = [
            'online_drivers' => $onlineDrivers->count(),
            'active_rides' => $activeRides->count(),
            'active_sos' => $activeSOS->count(),
            'searching_rides' => $activeRides->where('status', 'searching')->count(),
        ];

        return view('admin.map.index', compact(
            'onlineDrivers',
            'activeRides',
            'activeSOS',
            'serviceZones',
            'stats'
        ));
    }

    // API endpoint for real-time updates
    public function liveData(Request $request)
    {
        $onlineDrivers = Driver::with('user')
            ->where('status', 'approved')
            ->where('is_online', true)
            ->whereNotNull('current_lat')
            ->whereNotNull('current_lng')
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => $driver->id,
                    'name' => $driver->user->name ?? 'Unknown',
                    'lat' => (float) $driver->current_lat,
                    'lng' => (float) $driver->current_lng,
                    'vehicle_type' => $driver->vehicle_type,
                    'plate_number' => $driver->plate_number,
                ];
            });

        $activeRides = RideRequest::with(['rider', 'driver'])
            ->whereIn('status', ['searching', 'driver_assigned', 'driver_arrived', 'in_progress'])
            ->get()
            ->map(function ($ride) {
                return [
                    'id' => $ride->id,
                    'pickup_lat' => (float) $ride->pickup_lat,
                    'pickup_lng' => (float) $ride->pickup_lng,
                    'drop_lat' => (float) $ride->drop_lat,
                    'drop_lng' => (float) $ride->drop_lng,
                    'status' => $ride->status,
                ];
            });

        $activeSOS = SosAlert::where('status', 'active')
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'lat' => (float) $alert->latitude,
                    'lng' => (float) $alert->longitude,
                ];
            });

        return response()->json([
            'drivers' => $onlineDrivers,
            'rides' => $activeRides,
            'sos' => $activeSOS,
            'stats' => [
                'online_drivers' => $onlineDrivers->count(),
                'active_rides' => $activeRides->count(),
                'active_sos' => $activeSOS->count(),
            ],
        ]);
    }

    // Get driver details for popup
    public function driverDetails($id)
    {
        $driver = Driver::with(['user', 'documents'])->findOrFail($id);

        $todayRides = $driver->ridesAsDriver()
            ->whereDate('created_at', today())
            ->count();

        $todayEarnings = $driver->ridesAsDriver()
            ->whereDate('created_at', today())
            ->where('status', 'completed')
            ->sum('driver_earning');

        return response()->json([
            'id' => $driver->id,
            'name' => $driver->user->name,
            'phone' => $driver->user->phone,
            'vehicle_type' => $driver->vehicle_type,
            'vehicle_model' => $driver->vehicle_model,
            'plate_number' => $driver->plate_number,
            'rating' => $driver->rating_average,
            'completed_rides' => $driver->completed_rides_count,
            'today_rides' => $todayRides,
            'today_earnings' => $todayEarnings,
            'photo' => $driver->documents?->selfie_with_nic
                ? asset('storage/' . $driver->documents->selfie_with_nic)
                : null,
        ]);
    }

    // Get ride details for popup
    public function rideDetails($id)
    {
        $ride = RideRequest::with(['rider', 'driver'])->findOrFail($id);

        return response()->json([
            'id' => $ride->id,
            'rider_name' => $ride->rider->name ?? 'Unknown',
            'rider_phone' => $ride->rider->phone ?? '',
            'driver_name' => $ride->driver->name ?? 'Searching',
            'driver_phone' => $ride->driver->phone ?? '',
            'pickup_address' => $ride->pickup_address,
            'drop_address' => $ride->drop_address,
            'status' => $ride->status,
            'fare' => $ride->estimated_price,
            'created_at' => $ride->created_at->format('H:i'),
        ]);
    }
}
