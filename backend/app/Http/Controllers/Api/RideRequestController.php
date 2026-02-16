<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RideRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RideRequestController extends Controller
{
    /**
     * Create a ride request (Passenger)
     */
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_address' => 'required|string',
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'dropoff_address' => 'required|string',
            'dropoff_lat' => 'required|numeric',
            'dropoff_lng' => 'required|numeric',
            'departure_time' => 'required|date',
            'seats_needed' => 'required|integer|min:1|max:4',
            'offered_price' => 'required|numeric|min:50',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        $rideRequest = RideRequest::create([
            'rider_id' => $user->id,
            'pickup_address' => $request->pickup_address,
            'pickup_lat' => $request->pickup_lat,
            'pickup_lng' => $request->pickup_lng,
            'drop_address' => $request->dropoff_address,
            'drop_lat' => $request->dropoff_lat,
            'drop_lng' => $request->dropoff_lng,
            'scheduled_at' => $request->departure_time,
            'seats' => $request->seats_needed,
            'estimated_price' => $request->offered_price,
            'base_fare' => $request->offered_price,
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ride request posted successfully',
            'request' => $this->formatRequest($rideRequest),
        ], 201);
    }

    /**
     * Get available ride requests for drivers within radius
     */
    public function available(Request $request)
    {
        try {
            $lat = $request->query('latitude');
            $lng = $request->query('longitude');
            $radius = $request->query('radius', 5); // Default 5km

            $query = RideRequest::with('rider')
                ->where('status', 'pending')
                ->whereNull('driver_id')
                ->where('scheduled_at', '>', now());

            // Filter by location if provided
            if ($lat && $lng) {
                $latRange = $radius / 111; // ~1 degree = 111km
                $lngRange = $radius / (111 * cos(deg2rad($lat)));

                $query->whereBetween('pickup_lat', [$lat - $latRange, $lat + $latRange])
                      ->whereBetween('pickup_lng', [$lng - $lngRange, $lng + $lngRange]);
            }

            $requests = $query->orderBy('scheduled_at', 'asc')
                ->limit(20)
                ->get();

            return response()->json([
                'success' => true,
                'requests' => $requests->map(function ($req) {
                    return $this->formatRequest($req);
                }),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => true,
                'requests' => [],
            ]);
        }
    }

    /**
     * Accept a ride request (Driver)
     */
    public function accept(Request $request, $id)
    {
        $user = $request->user();
        $driver = $user->driver;

        if (!$driver || $driver->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'You must be an approved driver',
            ], 403);
        }

        $rideRequest = RideRequest::find($id);

        if (!$rideRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found',
            ], 404);
        }

        if ($rideRequest->status !== 'pending' || $rideRequest->driver_id) {
            return response()->json([
                'success' => false,
                'message' => 'This request is no longer available',
            ], 400);
        }

        $rideRequest->update([
            'driver_id' => $user->id,
            'status' => 'matched',
            'matched_at' => now(),
            'accepted_at' => now(),
        ]);

        // TODO: Send notification to passenger

        return response()->json([
            'success' => true,
            'message' => 'Ride request accepted',
            'request' => $this->formatRequest($rideRequest->fresh()),
        ]);
    }

    /**
     * Get my ride requests (Passenger)
     */
    public function myRequests(Request $request)
    {
        $user = $request->user();

        $requests = RideRequest::with(['driver', 'driverDetails'])
            ->where('rider_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'requests' => $requests->map(function ($req) {
                return $this->formatRequest($req);
            }),
        ]);
    }

    /**
     * Cancel a ride request (Passenger)
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();

        $rideRequest = RideRequest::where('id', $id)
            ->where('rider_id', $user->id)
            ->first();

        if (!$rideRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Request not found',
            ], 404);
        }

        if (in_array($rideRequest->status, ['completed', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel this request',
            ], 400);
        }

        $rideRequest->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => 'rider',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request cancelled',
        ]);
    }

    /**
     * Format request for response
     */
    private function formatRequest($req)
    {
        return [
            'id' => $req->id,
            'user_id' => $req->rider_id,
            'user' => $req->rider ? [
                'id' => $req->rider->id,
                'name' => $req->rider->name,
                'phone' => $req->rider->phone,
                'rating' => $req->rider->rating ?? 5.0,
            ] : null,
            'pickup_address' => $req->pickup_address,
            'pickup_lat' => $req->pickup_lat,
            'pickup_lng' => $req->pickup_lng,
            'dropoff_address' => $req->drop_address,
            'dropoff_lat' => $req->drop_lat,
            'dropoff_lng' => $req->drop_lng,
            'departure_time' => $req->scheduled_at,
            'seats_needed' => $req->seats ?? 1,
            'offered_price' => $req->estimated_price ?? $req->base_fare,
            'notes' => $req->notes,
            'status' => $req->status,
            'driver_id' => $req->driver_id,
            'driver' => $req->driver ? [
                'id' => $req->driver->id,
                'name' => $req->driver->name,
                'phone' => $req->driver->phone,
            ] : null,
            'created_at' => $req->created_at,
        ];
    }
}
