<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Rating;
use App\Models\RideRequest;
use App\Models\Driver;
use App\Models\User;
use App\Models\LoyaltyPoint;
use App\Services\NotificationService;

class RatingController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Rate driver (by rider)
     */
    public function rateDriver(Request $request, $rideId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
            'negative_reason' => 'required_if:rating,1,2|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // Get ride
            $ride = RideRequest::findOrFail($rideId);

            // Check if user is the rider
            if ($ride->rider_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Check if ride is completed
            if ($ride->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only rate completed rides'
                ], 400);
            }

            // Check if already rated
            $existingRating = Rating::where('ride_request_id', $rideId)
                ->whereNotNull('driver_rating')
                ->first();

            if ($existingRating) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already rated this driver'
                ], 400);
            }

            DB::beginTransaction();

            try {
                // Create or update rating
                $ratingData = [
                    'driver_rating' => $request->rating,
                    'driver_comment' => $request->comment,
                ];

                if ($request->rating <= 2) {
                    $ratingData['driver_negative_reason'] = $request->negative_reason;
                }

                $rating = Rating::updateOrCreate(
                    [
                        'ride_request_id' => $rideId,
                        'driver_id' => $ride->driver_id,
                        'rider_id' => $user->id,
                    ],
                    $ratingData
                );

                // Update driver's average rating
                $this->updateDriverRating($ride->driver_id);

                // Award or deduct loyalty points on the driver
                $driverProfile = Driver::where('user_id', $ride->driver_id)->first();
                $driverUser = $driverProfile?->user ?? User::find($ride->driver_id);

                if ($driverUser) {
                    $pointsMap = [5 => 50, 4 => 40, 3 => 30];

                    if ($request->rating >= 3) {
                        $points = $pointsMap[$request->rating];
                        LoyaltyPoint::earnPoints(
                            $driverUser,
                            $points,
                            'ride_rating',
                            $rideId,
                            "Earned from {$request->rating}-star rating"
                        );
                    } else {
                        LoyaltyPoint::deductPoints(
                            $driverUser,
                            20,
                            'negative_rating',
                            $rideId,
                            $request->negative_reason
                        );
                    }
                }

                // Send notification to driver
                $this->notificationService->notifyNewRating(
                    $ride->driver_id,
                    $request->rating,
                    $rideId
                );

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Rating submitted successfully',
                    'data' => [
                        'rating' => $rating
                    ]
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit rating',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rate rider (by driver)
     */
    public function rateRider(Request $request, $rideId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
            'negative_reason' => 'required_if:rating,1,2|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            $driver = $user->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            // Get ride
            $ride = RideRequest::findOrFail($rideId);

            // Check if user is the driver (driver_id stores user_id)
            if ($ride->driver_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Check if ride is completed
            if ($ride->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only rate completed rides'
                ], 400);
            }

            // Check if already rated
            $existingRating = Rating::where('ride_request_id', $rideId)
                ->whereNotNull('rider_rating')
                ->first();

            if ($existingRating) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already rated this rider'
                ], 400);
            }

            DB::beginTransaction();

            try {
                // Create or update rating
                $ratingData = [
                    'rider_rating' => $request->rating,
                    'rider_comment' => $request->comment,
                ];

                if ($request->rating <= 2) {
                    $ratingData['rider_negative_reason'] = $request->negative_reason;
                }

                $rating = Rating::updateOrCreate(
                    [
                        'ride_request_id' => $rideId,
                        'driver_id' => $user->id,
                        'rider_id' => $ride->rider_id,
                    ],
                    $ratingData
                );

                // Award or deduct loyalty points on the rider
                $riderUser = User::find($ride->rider_id);

                if ($riderUser) {
                    $pointsMap = [5 => 50, 4 => 40, 3 => 30];

                    if ($request->rating >= 3) {
                        $points = $pointsMap[$request->rating];
                        LoyaltyPoint::earnPoints(
                            $riderUser,
                            $points,
                            'ride_rating',
                            $rideId,
                            "Earned from {$request->rating}-star rating"
                        );
                    } else {
                        LoyaltyPoint::deductPoints(
                            $riderUser,
                            20,
                            'negative_rating',
                            $rideId,
                            $request->negative_reason
                        );
                    }
                }

                // Send notification to rider
                $this->notificationService->notifyNewRating(
                    $ride->rider_id,
                    $request->rating,
                    $rideId
                );

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Rating submitted successfully',
                    'data' => [
                        'rating' => $rating
                    ]
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit rating',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get driver's ratings
     */
    public function getDriverRatings(Request $request, $driverId)
    {
        try {
            $ratings = Rating::where('driver_id', $driverId)
                ->whereNotNull('driver_rating')
                ->with(['rider', 'rideRequest'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            $driver = Driver::where('user_id', $driverId)->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => [
                    'average_rating' => (float) $driver->rating,
                    'total_ratings' => $driver->total_rides,
                    'ratings' => $ratings->items(),
                    'pagination' => [
                        'current_page' => $ratings->currentPage(),
                        'total_pages' => $ratings->lastPage(),
                        'total' => $ratings->total(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch ratings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get rider's ratings given
     */
    public function getRiderRatings(Request $request)
    {
        try {
            $user = $request->user();

            $ratings = Rating::where('rider_id', $user->id)
                ->whereNotNull('driver_rating')
                ->with(['driver.user', 'rideRequest'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => [
                    'ratings' => $ratings->items(),
                    'pagination' => [
                        'current_page' => $ratings->currentPage(),
                        'total_pages' => $ratings->lastPage(),
                        'total' => $ratings->total(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch ratings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update driver's average rating
     */
    private function updateDriverRating($driverId)
    {
        $avgRating = Rating::where('driver_id', $driverId)
            ->whereNotNull('driver_rating')
            ->avg('driver_rating');

        $totalRatings = Rating::where('driver_id', $driverId)
            ->whereNotNull('driver_rating')
            ->count();

        Driver::where('user_id', $driverId)->update([
            'rating' => round($avgRating, 2),
            'total_rides' => $totalRatings,
        ]);
    }
}