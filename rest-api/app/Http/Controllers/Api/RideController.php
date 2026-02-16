<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RideMatchingService;
use App\Models\RideRequest;
use App\Models\Driver;
use App\Events\RideStatusChanged;
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
        $ride = RideRequest::with(['driver', 'driverDetails'])->findOrFail($id);

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

        // Broadcast ride cancellation for realtime updates
        broadcast(new RideStatusChanged($ride))->toOthers();

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

            // DEV MODE: Return mock drivers if no real drivers found
            if ($drivers->isEmpty() && config('app.debug')) {
                $drivers = $this->getMockDrivers($distance, 0);
            }

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
                'base_fare' => $request->fare, // Store original fare as base
                'estimated_price' => $request->fare,
                'bid_amount' => 0,
                'bid_percentage' => 0,
                'is_bidding' => false,
                'payment_method' => $request->payment_method,
                'promo_code' => $request->promo_code,
                'notes' => $request->notes,
                'seats' => $request->seats ?? 1,
                'status' => 'driver_assigned',
            ]);

            // Broadcast ride status change for realtime updates
            broadcast(new RideStatusChanged($ride))->toOthers();

            // Send push notification to driver
            PushNotificationController::sendToUser(
                $driver->user_id,
                'New Ride Request!',
                'You have a new ride request from ' . ($user->name ?? 'a rider') . '. Pickup: ' . $request->pickup_address,
                ['ride_id' => $ride->id, 'type' => 'new_ride', 'channel' => 'rides'],
                'ride_request'
            );

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
                ->with(['driver', 'driverDetails'])
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

            $rides = RideRequest::where(function ($q) use ($user) {
                    $q->where('rider_id', $user->id)
                      ->orWhere('driver_id', $user->id);
                })
                ->when($status, function ($query, $status) {
                    return $query->where('status', $status);
                })
                ->with(['driver', 'driverDetails'])
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

    /**
     * Estimate fare before booking
     */
    public function estimateFare(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_lat' => 'required|numeric|between:-90,90',
            'pickup_lng' => 'required|numeric|between:-180,180',
            'dropoff_lat' => 'required|numeric|between:-90,90',
            'dropoff_lng' => 'required|numeric|between:-180,180',
            'vehicle_type' => 'sometimes|in:bike,rickshaw,car,car_economy,car_premium,ac_car,van',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $distance = $this->calculateDistance(
                $request->pickup_lat, $request->pickup_lng,
                $request->dropoff_lat, $request->dropoff_lng
            );
            $durationEstimate = ceil($distance * 2.5);
            $vehicleType = $request->vehicle_type ?? 'car';

            // Try FareSetting model first
            $fareSetting = \App\Models\FareSetting::where('vehicle_type', $vehicleType)
                ->where('is_active', true)
                ->first();

            if ($fareSetting) {
                $baseFare = (float) $fareSetting->base_fare;
                $distanceCharge = $distance * (float) $fareSetting->per_km_rate;
                $timeCharge = $durationEstimate * (float) $fareSetting->per_minute_rate;
                $bookingFee = (float) $fareSetting->booking_fee;
                $cancellationFee = (float) $fareSetting->cancellation_fee;
                $subtotal = $baseFare + $distanceCharge + $timeCharge + $bookingFee;
                $minimumFare = (float) $fareSetting->minimum_fare;
            } else {
                $subtotal = $this->calculateFare($vehicleType, $distance);
                $baseFare = $subtotal * 0.4;
                $distanceCharge = $subtotal * 0.5;
                $timeCharge = $subtotal * 0.1;
                $bookingFee = 0;
                $cancellationFee = 50;
                $minimumFare = 80;
            }

            // Check surge pricing
            $surgeMultiplier = 1.0;
            $surgeAmount = 0;
            $surge = \App\Models\SurgePricing::active()->first();
            if ($surge) {
                $surgeMultiplier = (float) $surge->multiplier;
                $surgeAmount = round($subtotal * ($surgeMultiplier - 1));
            }

            $totalFare = max(ceil(($subtotal + $surgeAmount) / 10) * 10, $minimumFare ?? 80);

            return response()->json([
                'success' => true,
                'data' => [
                    'distance_km' => round($distance, 1),
                    'duration_minutes' => $durationEstimate,
                    'total_fare' => $totalFare,
                    'vehicle_type' => $vehicleType,
                    'breakdown' => [
                        'base_fare' => round($baseFare),
                        'distance_charge' => round($distanceCharge),
                        'time_charge' => round($timeCharge),
                        'booking_fee' => round($bookingFee),
                        'surge_multiplier' => $surgeMultiplier,
                        'surge_amount' => round($surgeAmount),
                        'surge_reason' => $surge ? $surge->reason : null,
                        'cancellation_fee' => round($cancellationFee ?? 50),
                    ],
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to estimate fare', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get driver location for a rider during an active ride
     */
    public function getDriverLocationForRider($id)
    {
        try {
            $ride = RideRequest::where('id', $id)
                ->where('rider_id', auth()->id())
                ->whereIn('status', ['accepted', 'arrived', 'started', 'driver_assigned'])
                ->firstOrFail();

            $driver = Driver::where('user_id', $ride->driver_id)->first();

            if (!$driver || !$driver->current_lat || !$driver->current_lng) {
                return response()->json([
                    'success' => true,
                    'data' => null
                ]);
            }

            // Calculate ETA from driver to pickup/dropoff
            $targetLat = in_array($ride->status, ['started']) ? $ride->drop_lat : $ride->pickup_lat;
            $targetLng = in_array($ride->status, ['started']) ? $ride->drop_lng : $ride->pickup_lng;
            $distanceToTarget = $this->calculateDistance($driver->current_lat, $driver->current_lng, $targetLat, $targetLng);
            $eta = max(1, ceil($distanceToTarget * 3));

            return response()->json([
                'success' => true,
                'data' => [
                    'latitude' => $driver->current_lat,
                    'longitude' => $driver->current_lng,
                    'eta' => $eta,
                    'updated_at' => $driver->updated_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to get driver location'], 404);
        }
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
        $ride = RideRequest::findOrFail($rideId);

        if ($ride->driver_id !== auth()->id() && $ride->rider_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $ride->update(['status' => 'accepted']);

        // Broadcast ride status change
        broadcast(new RideStatusChanged($ride->fresh()))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Match accepted',
            'data' => $ride
        ]);
    }

    // Reject match
    public function rejectMatch($rideId)
    {
        $ride = RideRequest::findOrFail($rideId);

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

        // Broadcast ride status change
        broadcast(new RideStatusChanged($ride->fresh()))->toOthers();

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

    /**
     * ==========================================
     * BIDDING / UPSALE FEATURE
     * User can increase fare to get more drivers
     * ==========================================
     */

    /**
     * Increase bid for a ride (Upsale)
     * User offers more money to attract more drivers
     */
    public function increaseBid(Request $request, $rideId)
    {
        $validator = Validator::make($request->all(), [
            'bid_percentage' => 'required|numeric|in:10,20,30,50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $ride = RideRequest::where('id', $rideId)
                ->where('rider_id', auth()->id())
                ->whereIn('status', ['searching', 'pending', 'driver_assigned'])
                ->firstOrFail();

            // Set base fare if not set
            if (!$ride->base_fare) {
                $ride->base_fare = $ride->estimated_price;
                $ride->save();
            }

            // Calculate new fare
            $bidAmount = $ride->base_fare * ($request->bid_percentage / 100);
            $newFare = $ride->base_fare + $bidAmount;

            $ride->update([
                'bid_percentage' => $request->bid_percentage,
                'bid_amount' => $bidAmount,
                'estimated_price' => $newFare,
                'is_bidding' => true,
                'bid_count' => $ride->bid_count + 1,
                'last_bid_at' => now(),
                'priority_score' => $ride->calculatePriorityScore(),
            ]);

            // Broadcast bid update for realtime - drivers will see updated fare
            broadcast(new RideStatusChanged($ride->fresh()))->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'Bid increased successfully! More drivers will see your ride.',
                'data' => [
                    'ride' => $ride->fresh(),
                    'base_fare' => $ride->base_fare,
                    'bid_amount' => $bidAmount,
                    'new_fare' => $newFare,
                    'bid_percentage' => $request->bid_percentage,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to increase bid',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bid options for a ride
     */
    public function getBidOptions(Request $request, $rideId)
    {
        try {
            $ride = RideRequest::where('id', $rideId)
                ->where('rider_id', auth()->id())
                ->firstOrFail();

            $baseFare = $ride->base_fare ?? $ride->estimated_price;

            $bidOptions = collect(RideRequest::BID_INCREMENTS)->map(function ($percentage) use ($baseFare, $ride) {
                $bidAmount = $baseFare * ($percentage / 100);
                $newFare = $baseFare + $bidAmount;

                return [
                    'percentage' => $percentage,
                    'label' => "+{$percentage}%",
                    'bid_amount' => round($bidAmount),
                    'new_fare' => round($newFare),
                    'is_selected' => $ride->bid_percentage == $percentage,
                    'description' => $this->getBidDescription($percentage),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'base_fare' => $baseFare,
                    'current_fare' => $ride->estimated_price,
                    'current_bid_percentage' => $ride->bid_percentage,
                    'bid_options' => $bidOptions,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get bid options',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get description for bid percentage
     */
    private function getBidDescription($percentage)
    {
        $descriptions = [
            10 => 'Show to more drivers nearby',
            20 => 'Priority visibility to drivers',
            30 => 'High priority - Faster matching',
            50 => 'Maximum priority - Instant matching',
        ];

        return $descriptions[$percentage] ?? 'Increase visibility';
    }

    /**
     * Search for rides with bidding support
     * Higher bids = more drivers shown in larger radius
     */
    public function searchRidesWithBidding(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_lat' => 'required|numeric|between:-90,90',
            'pickup_lng' => 'required|numeric|between:-180,180',
            'dropoff_lat' => 'required|numeric|between:-90,90',
            'dropoff_lng' => 'required|numeric|between:-180,180',
            'vehicle_type' => 'sometimes|in:bike,rickshaw,car,ac_car',
            'bid_percentage' => 'sometimes|numeric|in:0,10,20,30,50',
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
            $bidPercentage = $request->bid_percentage ?? 0;

            // Base radius is 5km, increases with higher bid
            $baseRadius = 5;
            $radiusBonus = [
                0 => 0,
                10 => 2,  // +2km radius
                20 => 4,  // +4km radius
                30 => 6,  // +6km radius
                50 => 10, // +10km radius (15km total)
            ];
            $radius = $baseRadius + ($radiusBonus[$bidPercentage] ?? 0);

            // Calculate trip distance
            $distance = $this->calculateDistance($pickupLat, $pickupLng, $dropoffLat, $dropoffLng);

            // Find online drivers
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
                ->map(function ($driver) use ($pickupLat, $pickupLng, $distance, $bidPercentage) {
                    $driverDistance = $this->calculateDistance(
                        $pickupLat,
                        $pickupLng,
                        $driver->current_lat,
                        $driver->current_lng
                    );

                    // Calculate base fare
                    $baseFare = $this->calculateFare($driver->vehicle_type, $distance);

                    // Calculate fare with bid
                    $bidAmount = $baseFare * ($bidPercentage / 100);
                    $totalFare = $baseFare + $bidAmount;

                    $eta = ceil($driverDistance * 3);

                    return [
                        'id' => $driver->id,
                        'user_id' => $driver->user_id,
                        'name' => $driver->user->name ?? 'Driver',
                        'phone' => $driver->user->phone ?? '',
                        'gender' => $driver->user->gender ?? 'male',
                        'vehicle_type' => $driver->vehicle_type,
                        'vehicle_make' => $driver->vehicle_make,
                        'vehicle_model' => $driver->vehicle_model,
                        'vehicle_color' => $driver->vehicle_color,
                        'plate_number' => $driver->plate_number,
                        'rating' => (float) ($driver->rating_average ?? 4.5),
                        'total_rides' => $driver->completed_rides_count ?? 0,
                        'distance_away' => round($driverDistance, 1),
                        'eta_minutes' => $eta,
                        'base_fare' => $baseFare,
                        'bid_amount' => round($bidAmount),
                        'fare' => round($totalFare),
                        'avatar' => $driver->profile_photo,
                    ];
                })
                ->sortBy('distance_away')
                ->values();

            // With higher bid, show more drivers (no limit)
            $maxDrivers = $bidPercentage >= 30 ? 20 : ($bidPercentage >= 10 ? 15 : 10);
            $drivers = $drivers->take($maxDrivers);

            // DEV MODE: Return mock drivers if no real drivers found and in debug mode
            if ($drivers->isEmpty() && config('app.debug')) {
                $drivers = $this->getMockDrivers($distance, $bidPercentage);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'drivers' => $drivers,
                    'trip_distance' => round($distance, 1),
                    'estimated_duration' => ceil($distance * 2.5),
                    'search_radius' => $radius,
                    'bid_percentage' => $bidPercentage,
                    'drivers_found' => $drivers->count(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search rides',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create ride with initial bid (optional)
     */
    public function createRideWithBid(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'driver_id' => 'required|exists:drivers,id',
            'pickup_address' => 'required|string',
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'drop_address' => 'required|string',
            'drop_lat' => 'required|numeric',
            'drop_lng' => 'required|numeric',
            'base_fare' => 'required|numeric|min:0',
            'bid_percentage' => 'sometimes|numeric|in:0,10,20,30,50',
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

            if (!$driver->is_online) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver is no longer available'
                ], 400);
            }

            $distance = $this->calculateDistance(
                $request->pickup_lat,
                $request->pickup_lng,
                $request->drop_lat,
                $request->drop_lng
            );

            $baseFare = $request->base_fare;
            $bidPercentage = $request->bid_percentage ?? 0;
            $bidAmount = $baseFare * ($bidPercentage / 100);
            $totalFare = $baseFare + $bidAmount;

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
                'base_fare' => $baseFare,
                'bid_amount' => $bidAmount,
                'bid_percentage' => $bidPercentage,
                'estimated_price' => $totalFare,
                'is_bidding' => $bidPercentage > 0,
                'bid_count' => $bidPercentage > 0 ? 1 : 0,
                'last_bid_at' => $bidPercentage > 0 ? now() : null,
                'priority_score' => $bidPercentage * 2,
                'payment_method' => $request->payment_method,
                'promo_code' => $request->promo_code,
                'notes' => $request->notes,
                'seats' => $request->seats ?? 1,
                'status' => 'driver_assigned',
            ]);

            broadcast(new RideStatusChanged($ride))->toOthers();

            return response()->json([
                'success' => true,
                'message' => $bidPercentage > 0
                    ? 'Ride booked with priority! Driver notified.'
                    : 'Ride request sent to driver',
                'data' => [
                    'ride' => $ride->load('driver'),
                    'base_fare' => $baseFare,
                    'bid_amount' => $bidAmount,
                    'total_fare' => $totalFare,
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
     * Get available vehicle types with dynamic seat counts from drivers
     * Returns actual seat availability based on registered drivers
     */
    public function getVehicleTypes(Request $request)
    {
        try {
            $pickupLat = $request->pickup_lat;
            $pickupLng = $request->pickup_lng;
            $radius = 10; // km

            // Define base vehicle types
            $baseVehicleTypes = [
                'bike' => [
                    'id' => 'bike',
                    'name' => 'Bike',
                    'description' => 'Quick & affordable',
                    'icon' => 'bicycle',
                    'defaultSeats' => 1,
                    'maxSeats' => 1,
                    'eta' => 3,
                    'baseFare' => 30,
                    'perKm' => 12,
                ],
                'car_economy' => [
                    'id' => 'car_economy',
                    'name' => 'Car (Economy)',
                    'description' => 'Suzuki, Cultus, Wagon R',
                    'icon' => 'car-outline',
                    'defaultSeats' => 4,
                    'maxSeats' => 4,
                    'eta' => 5,
                    'baseFare' => 100,
                    'perKm' => 22,
                    'popular' => true,
                ],
                'car' => [
                    'id' => 'car_economy',
                    'name' => 'Car (Economy)',
                    'description' => 'Suzuki, Cultus, Wagon R',
                    'icon' => 'car-outline',
                    'defaultSeats' => 4,
                    'maxSeats' => 4,
                    'eta' => 5,
                    'baseFare' => 100,
                    'perKm' => 22,
                    'popular' => true,
                ],
                'ac_car' => [
                    'id' => 'car_premium',
                    'name' => 'Car (Premium)',
                    'description' => 'Honda City, Toyota Corolla',
                    'icon' => 'car',
                    'defaultSeats' => 4,
                    'maxSeats' => 4,
                    'eta' => 7,
                    'baseFare' => 150,
                    'perKm' => 35,
                ],
                'car_premium' => [
                    'id' => 'car_premium',
                    'name' => 'Car (Premium)',
                    'description' => 'Honda City, Toyota Corolla',
                    'icon' => 'car',
                    'defaultSeats' => 4,
                    'maxSeats' => 4,
                    'eta' => 7,
                    'baseFare' => 150,
                    'perKm' => 35,
                ],
                'van' => [
                    'id' => 'van',
                    'name' => 'Van',
                    'description' => 'For groups (6-8 seats)',
                    'icon' => 'bus-outline',
                    'defaultSeats' => 6,
                    'maxSeats' => 8,
                    'eta' => 10,
                    'baseFare' => 200,
                    'perKm' => 45,
                ],
            ];

            // Get unique vehicle types with actual seat counts from drivers
            $driversQuery = Driver::where('status', 'approved')
                ->whereNotNull('seats')
                ->where('seats', '>', 0);

            // If location provided, filter by radius
            if ($pickupLat && $pickupLng) {
                $driversQuery->whereNotNull('current_lat')
                    ->whereNotNull('current_lng');
            }

            $drivers = $driversQuery->get();

            // Group drivers by vehicle type and get seat info
            $vehicleTypeSeats = [];
            foreach ($drivers as $driver) {
                $vehicleType = $driver->vehicle_type;
                if (!isset($vehicleTypeSeats[$vehicleType])) {
                    $vehicleTypeSeats[$vehicleType] = [
                        'min_seats' => $driver->seats,
                        'max_seats' => $driver->seats,
                        'available_seats' => [$driver->seats],
                        'driver_count' => 0,
                    ];
                }

                $vehicleTypeSeats[$vehicleType]['min_seats'] = min($vehicleTypeSeats[$vehicleType]['min_seats'], $driver->seats);
                $vehicleTypeSeats[$vehicleType]['max_seats'] = max($vehicleTypeSeats[$vehicleType]['max_seats'], $driver->seats);

                if (!in_array($driver->seats, $vehicleTypeSeats[$vehicleType]['available_seats'])) {
                    $vehicleTypeSeats[$vehicleType]['available_seats'][] = $driver->seats;
                }
                $vehicleTypeSeats[$vehicleType]['driver_count']++;
            }

            // Build response with merged data
            $vehicleTypes = [];
            $processedIds = [];

            foreach ($baseVehicleTypes as $key => $baseType) {
                // Skip duplicates (car maps to car_economy)
                if (in_array($baseType['id'], $processedIds)) {
                    continue;
                }
                $processedIds[] = $baseType['id'];

                $vehicleInfo = $baseType;

                // Override with dynamic seat data if available
                if (isset($vehicleTypeSeats[$key])) {
                    $seatData = $vehicleTypeSeats[$key];
                    $vehicleInfo['seats'] = $seatData['max_seats'];
                    $vehicleInfo['maxSeats'] = $seatData['max_seats'];
                    $vehicleInfo['minSeats'] = $seatData['min_seats'];
                    $vehicleInfo['availableSeats'] = sort($seatData['available_seats']) ? $seatData['available_seats'] : $seatData['available_seats'];
                    $vehicleInfo['driverCount'] = $seatData['driver_count'];
                    $vehicleInfo['hasDynamicSeats'] = true;
                } else {
                    $vehicleInfo['seats'] = $baseType['defaultSeats'];
                    $vehicleInfo['maxSeats'] = $baseType['maxSeats'];
                    $vehicleInfo['minSeats'] = 1;
                    $vehicleInfo['availableSeats'] = range(1, $baseType['maxSeats']);
                    $vehicleInfo['driverCount'] = 0;
                    $vehicleInfo['hasDynamicSeats'] = false;
                }

                $vehicleTypes[] = $vehicleInfo;
            }

            // Sort by popularity and ETA
            usort($vehicleTypes, function ($a, $b) {
                if (isset($a['popular']) && $a['popular']) return -1;
                if (isset($b['popular']) && $b['popular']) return 1;
                return $a['eta'] <=> $b['eta'];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'vehicleTypes' => $vehicleTypes,
                    'totalDrivers' => $drivers->count(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vehicle types',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DEV MODE: Generate mock drivers for testing
     * Only used when APP_DEBUG=true and no real drivers found
     */
    private function getMockDrivers($distance, $bidPercentage = 0)
    {
        $mockDrivers = [
            [
                'name' => 'Ahmed Khan',
                'vehicle_type' => 'car',
                'vehicle_make' => 'Toyota',
                'vehicle_model' => 'Corolla 2020',
                'vehicle_color' => 'White',
                'plate_number' => 'LHR-1234',
                'rating' => 4.8,
                'total_rides' => 245,
                'has_ac' => true,
                'gender' => 'male',
            ],
            [
                'name' => 'Usman Ali',
                'vehicle_type' => 'car',
                'vehicle_make' => 'Honda',
                'vehicle_model' => 'City 2021',
                'vehicle_color' => 'Black',
                'plate_number' => 'ISB-5678',
                'rating' => 4.9,
                'total_rides' => 389,
                'has_ac' => true,
                'gender' => 'male',
            ],
            [
                'name' => 'Bilal Hussain',
                'vehicle_type' => 'ac_car',
                'vehicle_make' => 'Honda',
                'vehicle_model' => 'Civic 2022',
                'vehicle_color' => 'Silver',
                'plate_number' => 'LHR-9012',
                'rating' => 4.7,
                'total_rides' => 512,
                'has_ac' => true,
                'gender' => 'male',
            ],
            [
                'name' => 'Imran Shah',
                'vehicle_type' => 'rickshaw',
                'vehicle_make' => 'Qingqi',
                'vehicle_model' => 'Standard',
                'vehicle_color' => 'Green',
                'plate_number' => 'RWP-3456',
                'rating' => 4.5,
                'total_rides' => 678,
                'has_ac' => false,
                'gender' => 'male',
            ],
            [
                'name' => 'Farhan Malik',
                'vehicle_type' => 'bike',
                'vehicle_make' => 'Honda',
                'vehicle_model' => 'CD70',
                'vehicle_color' => 'Red',
                'plate_number' => 'LHR-7890',
                'rating' => 4.6,
                'total_rides' => 156,
                'has_ac' => false,
                'gender' => 'male',
            ],
        ];

        // More drivers with higher bids
        $driversToShow = $bidPercentage >= 30 ? 5 : ($bidPercentage >= 10 ? 4 : 3);

        return collect(array_slice($mockDrivers, 0, $driversToShow))->map(function ($driver, $index) use ($distance, $bidPercentage) {
            $baseFare = $this->calculateFare($driver['vehicle_type'], $distance);
            $bidAmount = $baseFare * ($bidPercentage / 100);
            $totalFare = $baseFare + $bidAmount;
            $distanceAway = round(1.5 + ($index * 0.8), 1); // 1.5km, 2.3km, 3.1km...
            $eta = ceil($distanceAway * 3);

            return [
                'id' => 1000 + $index, // Mock IDs starting from 1000
                'user_id' => 1000 + $index,
                'name' => $driver['name'],
                'phone' => '+923001234567',
                'gender' => $driver['gender'],
                'vehicle_type' => $driver['vehicle_type'],
                'vehicle_make' => $driver['vehicle_make'],
                'vehicle_model' => $driver['vehicle_model'],
                'vehicle_color' => $driver['vehicle_color'],
                'plate_number' => $driver['plate_number'],
                'rating' => $driver['rating'],
                'total_rides' => $driver['total_rides'],
                'distance_away' => $distanceAway,
                'eta_minutes' => $eta,
                'eta' => $eta,
                'base_fare' => $baseFare,
                'bid_amount' => round($bidAmount),
                'fare' => round($totalFare),
                'has_ac' => $driver['has_ac'],
                'accepts_cash' => true,
                'is_premium' => $driver['rating'] >= 4.8,
                'avatar' => null,
                'vehicle' => [
                    'model' => $driver['vehicle_model'],
                    'color' => $driver['vehicle_color'],
                    'plate' => $driver['plate_number'],
                ],
                '_is_mock' => true, // Flag to identify mock data
            ];
        });
    }
}