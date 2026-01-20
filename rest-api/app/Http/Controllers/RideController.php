<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\RideRequest;
use App\Services\RideMatchingService;

class RideController extends Controller
{
    protected $matchingService;

    public function __construct(RideMatchingService $matchingService)
    {
        $this->matchingService = $matchingService;
    }

    /**
     * Create new ride request
     */
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_location' => 'required|string',
            'pickup_latitude' => 'required|numeric|between:-90,90',
            'pickup_longitude' => 'required|numeric|between:-180,180',
            'dropoff_location' => 'required|string',
            'dropoff_latitude' => 'required|numeric|between:-90,90',
            'dropoff_longitude' => 'required|numeric|between:-180,180',
            'payment_method' => 'sometimes|in:cash,card,wallet',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // Create ride request
            $ride = RideRequest::create([
                'user_id' => $user->id,
                'pickup_location' => $request->pickup_location,
                'pickup_latitude' => $request->pickup_latitude,
                'pickup_longitude' => $request->pickup_longitude,
                'dropoff_location' => $request->dropoff_location,
                'dropoff_latitude' => $request->dropoff_latitude,
                'dropoff_longitude' => $request->dropoff_longitude,
                'payment_method' => $request->payment_method ?? 'cash',
                'status' => 'pending',
            ]);

            // Calculate fare and time
            $fareDetails = $this->matchingService->calculateFareAndTime($ride);
            
            $ride->update($fareDetails);

            // Auto-match with drivers
            $matchResult = $this->matchingService->autoAssignRide($ride);

            if (!$matchResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $matchResult['message'],
                    'data' => [
                        'ride' => $ride
                    ]
                ], 200);
            }

            // TODO: Send notification to driver

            $ride->load(['driver.user', 'schedule']);

            return response()->json([
                'success' => true,
                'message' => 'Ride created and matched successfully',
                'data' => [
                    'ride' => $ride,
                    'driver' => $matchResult['driver'],
                    'match_score' => $matchResult['match_score'],
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create ride',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available rides near driver (based on schedule)
     */
    public function getAvailableRides(Request $request)
    {
        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            // Get driver's active schedules
            $schedules = $driver->schedules()->where('is_active', true)->get();

            if ($schedules->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No active schedules. Please add a schedule first.',
                    'data' => ['rides' => []]
                ], 200);
            }

            // Get pending/matched rides for driver
            $rides = RideRequest::where('driver_id', $driver->id)
                ->whereIn('status', ['matched', 'pending'])
                ->with(['user', 'schedule'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'rides' => $rides
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get available rides',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ... existing methods (show, myRides, cancel, etc)
}