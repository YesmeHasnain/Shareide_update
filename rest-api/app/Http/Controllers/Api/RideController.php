<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RideMatchingService;
use App\Models\Ride;
use App\Models\RideRequest;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class RideController extends Controller
{
    protected $rideMatchingService;

    public function __construct(RideMatchingService $rideMatchingService)
    {
        $this->rideMatchingService = $rideMatchingService;
    }

    // Create new ride
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_location' => 'required|string',
            'dropoff_location' => 'required|string',
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'dropoff_lat' => 'required|numeric',
            'dropoff_lng' => 'required|numeric',
            'ride_type' => 'required|in:driver,rider',
            'seats_available' => 'nullable|integer|min:1',
            'scheduled_time' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $ride = auth()->user()->rides()->create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Ride created successfully',
            'data' => $ride
        ], 201);
    }

    // Get user's rides
    public function myRides(Request $request)
    {
        $rides = auth()->user()->rides()
            ->with(['driver', 'rider'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $rides
        ]);
    }

    // Get single ride
    public function show($id)
    {
        $ride = Ride::with(['driver', 'rider'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $ride
        ]);
    }

    // Cancel ride
    public function cancel($id)
    {
        $ride = RideRequest::where('id', $id)
            ->where('rider_id', auth()->id())
            ->firstOrFail();

        if (in_array($ride->status, ['completed', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel this ride'
            ], 400);
        }

        $ride->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Ride cancelled successfully'
        ]);
    }

    /**
     * Get available drivers nearby
     */
    public function getAvailableRides(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_lat' => 'required|numeric|between:-90,90',
            'pickup_lng' => 'required|numeric|between:-180,180',
            'dropoff_lat' => 'required|numeric|between:-90,90',
            'dropoff_lng' => 'required|numeric|between:-180,180',
            'vehicle_type' => 'sometimes|in:bike,rickshaw,car,ac_car',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $pickupLat = $request->pickup_lat;
            $pickupLng = $request->pickup_lng;
            $dropoffLat = $request->dropoff_lat;
            $dropoffLng = $request->dropoff_lng;
            $radius = 5; // km

            // Calculate distance between pickup and dropoff
            $distance = $this->calculateDistance($pickupLat, $pickupLng, $dropoffLat, $dropoffLng);

            // Find online drivers within radius
            $drivers = Driver::where('is_online', true)
                ->where('status', 'approved')
                ->whereNotNull('current_lat')
                ->whereNotNull('current_lng')
                ->when($request->vehicle_type, function ($query, $type) {
                    return $query->where('vehicle_type', $type);
                })
                ->get()
                ->filter(function ($driver) use ($pickupLat, $pickupLng, $radius) {
                    $driverDistance = $this->calculateDistance(
                        $pickupLat,
                        $pickupLng,
                        $driver->current_lat,
                        $driver->current_lng
                    );
                    return $driverDistance <= $radius;
                })
                ->map(function ($driver) use ($pickupLat, $pickupLng, $distance) {
                    $driverDistance = $this->calculateDistance(
                        $pickupLat,
                        $pickupLng,
                        $driver->current_lat,
                        $driver->current_lng
                    );

                    // Calculate fare based on vehicle type and distance
                    $fare = $this->calculateFare($driver->vehicle_type, $distance);
                    $eta = ceil($driverDistance * 3); // ~3 min per km

                    return [
                        'id' => $driver->id,
                        'user_id' => $driver->user_id,
                        'name' => $driver->user->name ?? 'Driver',
                        'phone' => $driver->user->phone ?? '',
                        'vehicle_type' => $driver->vehicle_type,
                        'vehicle_make' => $driver->vehicle_make,
                        'vehicle_model' => $driver->vehicle_model,
                        'vehicle_color' => $driver->vehicle_color,
                        'plate_number' => $driver->plate_number,
                        'rating' => (float) ($driver->rating_average ?? 4.5),
                        'total_rides' => $driver->completed_rides_count ?? 0,
                        'distance_away' => round($driverDistance, 1),
                        'eta_minutes' => $eta,
                        'fare' => $fare,
                        'avatar' => $driver->profile_photo,
                    ];
                })
                ->sortBy('distance_away')
                ->values()
                ->take(10);

            return response()->json([
                'success' => true,
                'data' => [
                    'drivers' => $drivers,
                    'trip_distance' => round($distance, 1),
                    'estimated_duration' => ceil($distance * 2.5), // ~2.5 min per km
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to find drivers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Book a ride with a specific driver
     */
    public function bookRide(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'driver_id' => 'required|exists:drivers,id',
            'pickup_address' => 'required|string',
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'drop_address' => 'required|string',
            'drop_lat' => 'required|numeric',
            'drop_lng' => 'required|numeric',
            'fare' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,wallet,card,jazzcash,easypaisa',
            'promo_code' => 'nullable|string',
            'notes' => 'nullable|string|max:500',
            'seats' => 'nullable|integer|min:1|max:4',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = auth()->user();
            $driver = Driver::findOrFail($request->driver_id);

            // Check if driver is still available
            if (!$driver->is_online) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver is no longer available'
                ], 400);
            }

            // Calculate distance
            $distance = $this->calculateDistance(
                $request->pickup_lat,
                $request->pickup_lng,
                $request->drop_lat,
                $request->drop_lng
            );

            $ride = RideRequest::create([
                'rider_id' => $user->id,
                'driver_id' => $driver->user_id,
                'pickup_address' => $request->pickup_address,
                'pickup_lat' => $request->pickup_lat,
                'pickup_lng' => $request->pickup_lng,
                'drop_address' => $request->drop_address,
                'drop_lat' => $request->drop_lat,
                'drop_lng' => $request->drop_lng,
                'distance_km' => $distance,
                'estimated_price' => $request->fare,
                'payment_method' => $request->payment_method,
                'promo_code' => $request->promo_code,
                'notes' => $request->notes,
                'seats' => $request->seats ?? 1,
                'status' => 'driver_assigned',
            ]);

            // TODO: Send push notification to driver

            return response()->json([
                'success' => true,
                'message' => 'Ride request sent to driver',
                'data' => [
                    'ride' => $ride->load('driver'),
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to book ride',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active ride for the current user
     */
    public function getActiveRide(Request $request)
    {
        try {
            $user = $request->user();

            $activeRide = RideRequest::where('rider_id', $user->id)
                ->whereIn('status', ['pending', 'accepted', 'arrived', 'started'])
                ->with(['driver.user'])
                ->latest()
                ->first();

            if (!$activeRide) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'ride' => null
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'ride' => $activeRide
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch active ride',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ride history
     */
    public function getRideHistory(Request $request)
    {
        try {
            $user = $request->user();
            $perPage = $request->get('per_page', 20);
            $status = $request->get('status'); // completed, cancelled

            $rides = RideRequest::where('rider_id', $user->id)
                ->when($status, function ($query, $status) {
                    return $query->where('status', $status);
                })
                ->with(['driver.user'])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'rides' => $rides->items(),
                    'pagination' => [
                        'current_page' => $rides->currentPage(),
                        'total_pages' => $rides->lastPage(),
                        'total' => $rides->total(),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch ride history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private function calculateDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Calculate fare based on vehicle type and distance
     */
    private function calculateFare($vehicleType, $distance)
    {
        $baseFares = [
            'bike' => ['base' => 30, 'per_km' => 12],
            'rickshaw' => ['base' => 50, 'per_km' => 18],
            'car' => ['base' => 100, 'per_km' => 25],
            'ac_car' => ['base' => 150, 'per_km' => 35],
        ];

        $rates = $baseFares[$vehicleType] ?? $baseFares['car'];
        $fare = $rates['base'] + ($rates['per_km'] * $distance);

        return ceil($fare / 10) * 10; // Round to nearest 10
    }

    // Find matching rides
    public function findMatches(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'dropoff_lat' => 'required|numeric',
            'dropoff_lng' => 'required|numeric',
            'max_distance' => 'nullable|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $matches = $this->rideMatchingService->findMatchingRides(
            auth()->id(),
            $validator->validated()
        );

        return response()->json([
            'success' => true,
            'data' => $matches
        ]);
    }

    // Match rider with ride
    public function matchRider(Request $request, $rideId)
    {
        $validator = Validator::make($request->all(), [
            'rider_id' => 'required|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $ride = $this->rideMatchingService->matchRider($rideId, $request->rider_id);

            return response()->json([
                'success' => true,
                'message' => 'Rider matched successfully',
                'data' => $ride
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    // Accept match
    public function acceptMatch($rideId)
    {
        $ride = Ride::findOrFail($rideId);

        if ($ride->driver_id !== auth()->id() && $ride->rider_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $ride->update(['status' => 'accepted']);

        return response()->json([
            'success' => true,
            'message' => 'Match accepted',
            'data' => $ride
        ]);
    }

    // Reject match
    public function rejectMatch($rideId)
    {
        $ride = Ride::findOrFail($rideId);

        if ($ride->driver_id !== auth()->id() && $ride->rider_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $ride->update([
            'status' => 'pending',
            'rider_id' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Match rejected'
        ]);
    }

    // Get nearby rides
    public function getNearbyRides(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius' => 'nullable|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $radius = $request->radius ?? 10; // Default 10km

        $nearbyRides = $this->rideMatchingService->findNearbyRides(
            $request->lat,
            $request->lng,
            $radius
        );

        return response()->json([
            'success' => true,
            'data' => $nearbyRides
        ]);
    }
}