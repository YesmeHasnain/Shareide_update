<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Events\DriverStatusChanged;
use App\Events\DriverLocationUpdated;
use App\Events\RideStatusChanged;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Api\PushNotificationController;
use App\Mail\RideCompletedMail;

class DriverController extends Controller
{
    /**
     * Register or update driver
     */
    public function register(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'vehicle_type' => 'required|in:car,bike',
            'vehicle_model' => 'nullable|string|max:255',
            'plate_number' => 'nullable|string|max:50',
            'seats' => 'required|integer|min:1|max:8',
            'city' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if driver already exists
        $driver = $user->driver;

        if ($driver) {
            // Update existing driver
            $driver->update([
                'vehicle_type' => $request->vehicle_type,
                'vehicle_model' => $request->vehicle_model,
                'plate_number' => $request->plate_number,
                'seats' => $request->seats,
                'city' => $request->city,
            ]);

            $message = 'Driver profile updated successfully';
        } else {
            // Create new driver
            $driver = Driver::create([
                'user_id' => $user->id,
                'vehicle_type' => $request->vehicle_type,
                'vehicle_model' => $request->vehicle_model,
                'plate_number' => $request->plate_number,
                'seats' => $request->seats,
                'city' => $request->city,
                'status' => 'pending',
                'is_online' => false,
            ]);

            // Update user role to driver
            $user->update(['role' => 'driver']);

            $message = 'Driver registration submitted. Waiting for admin approval';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'driver' => [
                'id' => $driver->id,
                'vehicle_type' => $driver->vehicle_type,
                'vehicle_model' => $driver->vehicle_model,
                'plate_number' => $driver->plate_number,
                'seats' => $driver->seats,
                'city' => $driver->city,
                'status' => $driver->status,
                'is_online' => $driver->is_online,
                'rating_average' => $driver->rating_average,
                'completed_rides_count' => $driver->completed_rides_count,
            ],
        ]);
    }

    /**
     * Get driver dashboard stats
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        // Get today's stats
        $today = now()->startOfDay();

        $todayRides = $user->ridesAsDriver()
            ->where('status', 'completed')
            ->where('completed_at', '>=', $today)
            ->get();

        $todayEarnings = $todayRides->sum('estimated_price');
        $todayRidesCount = $todayRides->count();

        // Get this week's stats
        $weekStart = now()->startOfWeek();
        $weekRides = $user->ridesAsDriver()
            ->where('status', 'completed')
            ->where('completed_at', '>=', $weekStart)
            ->get();

        $weekEarnings = $weekRides->sum('estimated_price');
        $weekRidesCount = $weekRides->count();

        // Get total stats
        $totalRides = $driver->completed_rides_count;
        $rating = $driver->rating_average ?? 5.0;

        return response()->json([
            'success' => true,
            'data' => [
                'today_earnings' => $todayEarnings,
                'today_rides' => $todayRidesCount,
                'week_earnings' => $weekEarnings,
                'week_rides' => $weekRidesCount,
                'total_rides' => $totalRides,
                'rating' => round($rating, 1),
                'is_online' => $driver->is_online,
                'status' => $driver->status,
            ],
        ]);
    }

    /**
     * Get driver profile
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'driver' => [
                'id' => $driver->id,
                'vehicle_type' => $driver->vehicle_type,
                'vehicle_model' => $driver->vehicle_model,
                'plate_number' => $driver->plate_number,
                'seats' => $driver->seats,
                'city' => $driver->city,
                'status' => $driver->status,
                'is_online' => $driver->is_online,
                'current_lat' => $driver->current_lat,
                'current_lng' => $driver->current_lng,
                'rating_average' => $driver->rating_average,
                'completed_rides_count' => $driver->completed_rides_count,
            ],
        ]);
    }

    /**
     * Toggle driver online/offline status
     */
    public function updateStatus(Request $request)
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        // Check if driver is approved
        if ($driver->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Driver not approved yet',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'is_online' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Update status
        $driver->is_online = $request->is_online;

        // Accept both lat/lng and latitude/longitude
        $lat = $request->latitude ?? $request->lat;
        $lng = $request->longitude ?? $request->lng;

        if ($request->is_online && $lat && $lng) {
            $driver->current_lat = $lat;
            $driver->current_lng = $lng;
        }

        $driver->save();

        // Broadcast driver status change for realtime updates
        try {
            broadcast(new DriverStatusChanged($driver))->toOthers();
        } catch (\Exception $e) {
            // Silently fail - broadcasting is optional
        }

        return response()->json([
            'success' => true,
            'message' => $driver->is_online ? 'Driver is now online' : 'Driver is now offline',
            'driver' => [
                'is_online' => $driver->is_online,
                'current_lat' => $driver->current_lat,
                'current_lng' => $driver->current_lng,
            ],
        ]);
    }

    /**
     * Update driver current location
     */
    public function updateLocation(Request $request)
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        // Accept both lat/lng and latitude/longitude
        $lat = $request->latitude ?? $request->lat;
        $lng = $request->longitude ?? $request->lng;

        if (!$lat || !$lng) {
            return response()->json([
                'success' => false,
                'message' => 'Location coordinates required',
            ], 422);
        }

        // Update location
        $driver->current_lat = $lat;
        $driver->current_lng = $lng;
        $driver->last_location_update = now();
        $driver->save();

        // Broadcast location update for realtime tracking (only if driver is online)
        if ($driver->is_online) {
            try {
                broadcast(new DriverLocationUpdated($driver))->toOthers();
            } catch (\Exception $e) {
                // Silently fail - broadcasting is optional
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Location updated',
            'location' => [
                'latitude' => $driver->current_lat,
                'longitude' => $driver->current_lng,
            ],
        ]);
    }

    /**
     * Get pending ride requests for driver
     */
    public function getPendingRequests(Request $request)
    {
        try {
            $user = $request->user();
            $driver = $user->driver;

            if (!$driver) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                ]);
            }

            // Get searching rides within 10km radius
            $query = \App\Models\RideRequest::where('status', 'searching')
                ->whereNull('driver_id');

            // Filter by location if driver has current location
            if ($driver->current_lat && $driver->current_lng) {
                $latRange = 0.09; // ~10km in latitude
                $lngRange = 0.09; // ~10km in longitude
                $query->whereBetween('pickup_lat', [
                    $driver->current_lat - $latRange,
                    $driver->current_lat + $latRange
                ])->whereBetween('pickup_lng', [
                    $driver->current_lng - $lngRange,
                    $driver->current_lng + $lngRange
                ]);
            }

            // Filter by seats if applicable
            if ($driver->seats) {
                $query->where('seats', '<=', $driver->seats);
            }

            $rides = $query->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $rides->map(function ($ride) {
                    return [
                        'id' => $ride->id,
                        'pickup_location' => $ride->pickup_address,
                        'dropoff_location' => $ride->drop_address,
                        'pickup_lat' => $ride->pickup_lat,
                        'pickup_lng' => $ride->pickup_lng,
                        'drop_lat' => $ride->drop_lat,
                        'drop_lng' => $ride->drop_lng,
                        'fare' => $ride->estimated_price ?? $ride->estimated_fare ?? 0,
                        'seats' => $ride->seats,
                        'created_at' => $ride->created_at,
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            \Log::error('Get pending requests error: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }
    }

    /**
     * Get driver's assigned/pending rides
     */
    public function getRides(Request $request)
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        $status = $request->query('status', 'all');

        $query = $user->ridesAsDriver()->with(['rider.riderProfile']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $rides = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'rides' => $rides->map(function ($ride) {
                return [
                    'id' => $ride->id,
                    'rider' => [
                        'id' => $ride->rider->id,
                        'name' => $ride->rider->name,
                        'phone' => $ride->rider->phone,
                    ],
                    'pickup_address' => $ride->pickup_address,
                    'drop_address' => $ride->drop_address,
                    'pickup_lat' => $ride->pickup_lat,
                    'pickup_lng' => $ride->pickup_lng,
                    'drop_lat' => $ride->drop_lat,
                    'drop_lng' => $ride->drop_lng,
                    'seats' => $ride->seats,
                    'status' => $ride->status,
                    'estimated_price' => $ride->estimated_price,
                    'created_at' => $ride->created_at,
                ];
            }),
        ]);
    }

    /**
     * Get active ride for driver
     */
    public function getActiveRide(Request $request)
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        $ride = $user->ridesAsDriver()
            ->whereIn('status', ['driver_assigned', 'driver_arrived', 'in_progress'])
            ->with(['rider.riderProfile'])
            ->first();

        if (!$ride) {
            return response()->json([
                'success' => true,
                'message' => 'No active ride',
                'ride' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'ride' => [
                'id' => $ride->id,
                'rider' => [
                    'id' => $ride->rider->id,
                    'name' => $ride->rider->name,
                    'phone' => $ride->rider->phone,
                ],
                'pickup_address' => $ride->pickup_address,
                'drop_address' => $ride->drop_address,
                'pickup_lat' => $ride->pickup_lat,
                'pickup_lng' => $ride->pickup_lng,
                'drop_lat' => $ride->drop_lat,
                'drop_lng' => $ride->drop_lng,
                'seats' => $ride->seats,
                'status' => $ride->status,
                'estimated_price' => $ride->estimated_price,
                'created_at' => $ride->created_at,
            ],
        ]);
    }

    /**
     * Accept ride request
     */
    public function acceptRide(Request $request, $rideId)
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        // Check if driver is approved and online
        if (!$driver->isApproved()) {
            return response()->json([
                'success' => false,
                'message' => 'Driver not approved',
            ], 403);
        }

        if (!$driver->is_online) {
            return response()->json([
                'success' => false,
                'message' => 'Driver must be online to accept rides',
            ], 403);
        }

        // Find ride
        $ride = \App\Models\RideRequest::find($rideId);

        if (!$ride) {
            return response()->json([
                'success' => false,
                'message' => 'Ride not found',
            ], 404);
        }

        // Check if ride is searching
        if ($ride->status !== 'searching') {
            return response()->json([
                'success' => false,
                'message' => 'Ride is not available',
            ], 400);
        }

        // Assign driver to ride
        $ride->driver_id = $user->id;
        $ride->status = 'driver_assigned';
        $ride->save();

        // Broadcast ride status change
        broadcast(new RideStatusChanged($ride))->toOthers();

        // Notify rider that a driver accepted their ride
        if ($ride->rider_id) {
            PushNotificationController::sendToUser(
                $ride->rider_id,
                'Driver Found!',
                ($user->name ?? 'A driver') . ' has accepted your ride. They are on their way!',
                ['ride_id' => $ride->id, 'type' => 'ride_accepted', 'channel' => 'rides'],
                'ride_status'
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Ride accepted',
            'ride' => [
                'id' => $ride->id,
                'status' => $ride->status,
            ],
        ]);
    }

    /**
     * Get nearby users/passengers looking for rides
     */
    public function getNearbyUsers(Request $request)
    {
        try {
            $user = $request->user();
            $driver = $user->driver;

            if (!$driver) {
                return response()->json([
                    'success' => true,
                    'users' => [],
                ]);
            }

            $lat = $request->query('latitude', $driver->current_lat);
            $lng = $request->query('longitude', $driver->current_lng);
            $radius = $request->query('radius', 5); // Default 5km

            if (!$lat || !$lng) {
                return response()->json([
                    'success' => true,
                    'users' => [],
                ]);
            }

            // Calculate lat/lng range for radius
            $latRange = $radius / 111; // ~111km per degree of latitude
            $lngRange = $radius / (111 * cos(deg2rad($lat)));

            // Get users with active ride requests (searching status)
            $rideRequests = \App\Models\RideRequest::where('status', 'searching')
                ->whereNull('driver_id')
                ->whereBetween('pickup_lat', [$lat - $latRange, $lat + $latRange])
                ->whereBetween('pickup_lng', [$lng - $lngRange, $lng + $lngRange])
                ->with('rider')
                ->limit(20)
                ->get();

            $users = $rideRequests->map(function ($ride) {
                return [
                    'id' => $ride->rider_id,
                    'name' => $ride->rider->name ?? 'Passenger',
                    'latitude' => $ride->pickup_lat,
                    'longitude' => $ride->pickup_lng,
                    'pickup_address' => $ride->pickup_address,
                    'ride_id' => $ride->id,
                ];
            });

            return response()->json([
                'success' => true,
                'users' => $users,
            ]);
        } catch (\Exception $e) {
            \Log::error('Get nearby users error: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'users' => [],
            ]);
        }
    }

    /**
     * Update ride status
     */
    public function updateRideStatus(Request $request, $rideId)
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:driver_arrived,in_progress,completed,cancelled_by_driver',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Find ride
        $ride = \App\Models\RideRequest::find($rideId);

        if (!$ride) {
            return response()->json([
                'success' => false,
                'message' => 'Ride not found',
            ], 404);
        }

        // Check if this driver is assigned to this ride
        if ($ride->driver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $newStatus = $request->status;

        // Update timestamps based on status
        if ($newStatus === 'in_progress' && !$ride->started_at) {
            $ride->started_at = now();
        }

        if ($newStatus === 'completed') {
            $ride->completed_at = now();

            // Increment driver's completed rides count
            $driver->increment('completed_rides_count');

            // Send ride receipt email to rider
            try {
                $rider = \App\Models\User::find($ride->rider_id);
                if ($rider && $rider->email) {
                    Mail::to($rider->email)->queue(new RideCompletedMail($ride, $rider));
                }
            } catch (\Exception $e) {
                \Log::error('Failed to send ride receipt email: ' . $e->getMessage());
            }
        }

        $ride->status = $newStatus;
        $ride->save();

        // Broadcast ride status change
        broadcast(new RideStatusChanged($ride))->toOthers();

        // Send push notification to rider
        $riderId = $ride->rider_id;
        if ($riderId) {
            $notifMessages = [
                'driver_arrived' => ['Driver Arrived', 'Your driver has arrived at the pickup location.'],
                'in_progress' => ['Ride Started', 'Your ride has started. Enjoy your trip!'],
                'completed' => ['Ride Completed', 'Your ride is complete. Total fare: Rs. ' . ($ride->fare ?? 0)],
                'cancelled_by_driver' => ['Ride Cancelled', 'Your driver has cancelled the ride.'],
            ];
            if (isset($notifMessages[$newStatus])) {
                PushNotificationController::sendToUser(
                    $riderId,
                    $notifMessages[$newStatus][0],
                    $notifMessages[$newStatus][1],
                    ['ride_id' => $ride->id, 'status' => $newStatus, 'channel' => 'rides'],
                    'ride_status'
                );
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Ride status updated',
            'ride' => [
                'id' => $ride->id,
                'status' => $ride->status,
                'started_at' => $ride->started_at,
                'completed_at' => $ride->completed_at,
            ],
        ]);
    }
}