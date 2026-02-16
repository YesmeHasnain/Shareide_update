<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RideRequest;
use Illuminate\Http\Request;

class IntercityController extends Controller
{
    // Create intercity ride request
    public function create(Request $request)
    {
        $request->validate([
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'pickup_address' => 'required|string',
            'drop_lat' => 'required|numeric',
            'drop_lng' => 'required|numeric',
            'drop_address' => 'required|string',
            'departure_datetime' => 'required|date|after:now',
            'seats' => 'required|integer|min:1|max:6',
            'max_passengers' => 'nullable|integer|min:1|max:6',
            'estimated_fare' => 'nullable|numeric|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $ride = RideRequest::create([
            'rider_id' => auth()->id(),
            'pickup_lat' => $request->pickup_lat,
            'pickup_lng' => $request->pickup_lng,
            'pickup_address' => $request->pickup_address,
            'drop_lat' => $request->drop_lat,
            'drop_lng' => $request->drop_lng,
            'drop_address' => $request->drop_address,
            'departure_datetime' => $request->departure_datetime,
            'seats' => $request->seats,
            'max_passengers' => $request->max_passengers ?? $request->seats,
            'estimated_fare' => $request->estimated_fare ?? $this->calculateIntercityFare($request),
            'notes' => $request->notes,
            'status' => 'pending',
            'service_type' => 'intercity',
            'is_intercity' => true,
            'is_bidding_enabled' => true,
            'negotiation_status' => 'open',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Intercity ride created successfully',
            'data' => $ride,
        ], 201);
    }

    // Search available intercity rides
    public function search(Request $request)
    {
        $request->validate([
            'pickup_lat' => 'nullable|numeric',
            'pickup_lng' => 'nullable|numeric',
            'drop_lat' => 'nullable|numeric',
            'drop_lng' => 'nullable|numeric',
            'date' => 'nullable|date',
        ]);

        $query = RideRequest::where('is_intercity', true)
            ->where('status', 'pending')
            ->where('departure_datetime', '>', now())
            ->with(['rider:id,name,profile_photo', 'bids']);

        // Filter by date if provided
        if ($request->date) {
            $query->whereDate('departure_datetime', $request->date);
        }

        // Filter by proximity to pickup
        if ($request->pickup_lat && $request->pickup_lng) {
            $lat = $request->pickup_lat;
            $lng = $request->pickup_lng;
            $query->selectRaw("*, (6371 * acos(cos(radians(?)) * cos(radians(pickup_lat)) * cos(radians(pickup_lng) - radians(?)) + sin(radians(?)) * sin(radians(pickup_lat)))) AS distance", [$lat, $lng, $lat])
                ->having('distance', '<', 50); // 50km radius for intercity pickup
        }

        $rides = $query->orderBy('departure_datetime', 'asc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $rides,
        ]);
    }

    // Join an existing intercity ride
    public function join(Request $request, $id)
    {
        $ride = RideRequest::where('is_intercity', true)
            ->where('status', 'pending')
            ->findOrFail($id);

        // Check if ride is full
        $currentPassengers = RideRequest::where('id', $id)
            ->orWhere('schedule_id', $id)
            ->count();

        if ($currentPassengers >= $ride->max_passengers) {
            return response()->json([
                'success' => false,
                'message' => 'This ride is full',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Join request sent. Waiting for driver confirmation.',
            'data' => $ride,
        ]);
    }

    // Driver posts intercity offer
    public function createDriverOffer(Request $request)
    {
        $request->validate([
            'pickup_address' => 'required|string',
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'drop_address' => 'required|string',
            'drop_lat' => 'required|numeric',
            'drop_lng' => 'required|numeric',
            'departure_datetime' => 'required|date|after:now',
            'seats' => 'required|integer|min:1|max:6',
            'fare_per_seat' => 'required|numeric|min:1',
        ]);

        $ride = RideRequest::create([
            'rider_id' => auth()->id(), // Driver creates, uses same field for now
            'driver_id' => auth()->id(),
            'pickup_lat' => $request->pickup_lat,
            'pickup_lng' => $request->pickup_lng,
            'pickup_address' => $request->pickup_address,
            'drop_lat' => $request->drop_lat,
            'drop_lng' => $request->drop_lng,
            'drop_address' => $request->drop_address,
            'departure_datetime' => $request->departure_datetime,
            'seats' => $request->seats,
            'max_passengers' => $request->seats,
            'estimated_fare' => $request->fare_per_seat,
            'status' => 'pending',
            'service_type' => 'intercity',
            'is_intercity' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Intercity offer created',
            'data' => $ride,
        ], 201);
    }

    private function calculateIntercityFare(Request $request): float
    {
        $distance = RideRequest::calculateDistance(
            $request->pickup_lat,
            $request->pickup_lng,
            $request->drop_lat,
            $request->drop_lng
        );

        // Intercity rate: Rs. 15/km with Rs. 200 base
        return max(200, round(200 + ($distance * 15)));
    }
}
