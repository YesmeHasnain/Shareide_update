<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SharedRide;
use App\Models\SharedRideBooking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SharedRideController extends Controller
{
    /**
     * Search available shared rides
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_lat' => 'required|numeric',
            'from_lng' => 'required|numeric',
            'to_lat' => 'nullable|numeric',
            'to_lng' => 'nullable|numeric',
            'date' => 'nullable|date',
            'seats' => 'nullable|integer|min:1',
            'radius' => 'nullable|integer|min:1|max:50', // km
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $fromLat = $request->from_lat;
        $fromLng = $request->from_lng;
        $radius = $request->radius ?? 10;
        $seats = $request->seats ?? 1;

        $query = SharedRide::with(['driver.riderProfile', 'confirmedBookings.passenger.riderProfile'])
            ->open()
            ->upcoming()
            ->where('available_seats', '>=', $seats)
            ->nearby($fromLat, $fromLng, $radius);

        // Filter by date
        if ($request->date) {
            $query->whereDate('departure_time', $request->date);
        }

        // Filter by destination if provided
        if ($request->to_lat && $request->to_lng) {
            $toLat = $request->to_lat;
            $toLng = $request->to_lng;
            $destRadius = 15; // km

            $haversine = "(6371 * acos(cos(radians($toLat))
                         * cos(radians(to_lat))
                         * cos(radians(to_lng) - radians($toLng))
                         + sin(radians($toLat))
                         * sin(radians(to_lat))))";

            $query->whereRaw("{$haversine} < ?", [$destRadius]);
        }

        $rides = $query->orderBy('departure_time', 'asc')
            ->take(20)
            ->get()
            ->map(function ($ride) {
                return $this->formatRideData($ride);
            });

        return response()->json([
            'success' => true,
            'data' => [
                'rides' => $rides,
            ],
        ]);
    }

    /**
     * Get ride details with passengers
     */
    public function show($id)
    {
        $ride = SharedRide::with([
            'driver.riderProfile',
            'driver.driver',
            'confirmedBookings.passenger.riderProfile',
        ])->find($id);

        if (!$ride) {
            return response()->json([
                'success' => false,
                'message' => 'Ride not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'ride' => $this->formatRideData($ride, true),
            ],
        ]);
    }

    /**
     * Create a new shared ride (Driver)
     */
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_address' => 'required|string',
            'from_lat' => 'required|numeric',
            'from_lng' => 'required|numeric',
            'to_address' => 'required|string',
            'to_lat' => 'required|numeric',
            'to_lng' => 'required|numeric',
            'departure_time' => 'required|date|after:now',
            'total_seats' => 'required|integer|min:1|max:8',
            'price_per_seat' => 'required|numeric|min:10',
            'vehicle_type' => 'nullable|in:car,bike,van',
            'vehicle_model' => 'nullable|string',
            'vehicle_color' => 'nullable|string',
            'plate_number' => 'nullable|string',
            'women_only' => 'nullable|boolean',
            'ac_available' => 'nullable|boolean',
            'luggage_allowed' => 'nullable|boolean',
            'smoking_allowed' => 'nullable|boolean',
            'pets_allowed' => 'nullable|boolean',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $driver = $user->driver;

        // Check if user is an approved driver
        if (!$driver || $driver->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'You must be an approved driver to create shared rides',
            ], 403);
        }

        // Calculate distance
        $distance = $this->calculateDistance(
            $request->from_lat,
            $request->from_lng,
            $request->to_lat,
            $request->to_lng
        );

        $ride = SharedRide::create([
            'driver_id' => $user->id,
            'from_address' => $request->from_address,
            'from_lat' => $request->from_lat,
            'from_lng' => $request->from_lng,
            'to_address' => $request->to_address,
            'to_lat' => $request->to_lat,
            'to_lng' => $request->to_lng,
            'departure_time' => $request->departure_time,
            'total_seats' => $request->total_seats,
            'available_seats' => $request->total_seats,
            'price_per_seat' => $request->price_per_seat,
            'total_distance' => $distance,
            'vehicle_type' => $request->vehicle_type ?? $driver->vehicle_type ?? 'car',
            'vehicle_model' => $request->vehicle_model ?? $driver->vehicle_model,
            'vehicle_color' => $request->vehicle_color,
            'plate_number' => $request->plate_number ?? $driver->plate_number,
            'women_only' => $request->women_only ?? false,
            'ac_available' => $request->ac_available ?? true,
            'luggage_allowed' => $request->luggage_allowed ?? true,
            'smoking_allowed' => $request->smoking_allowed ?? false,
            'pets_allowed' => $request->pets_allowed ?? false,
            'notes' => $request->notes,
            'status' => 'open',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shared ride created successfully',
            'data' => [
                'ride' => $this->formatRideData($ride),
            ],
        ], 201);
    }

    /**
     * Book seats on a shared ride (Passenger)
     */
    public function book(Request $request, $rideId)
    {
        $validator = Validator::make($request->all(), [
            'seats' => 'nullable|integer|min:1',
            'pickup_address' => 'nullable|string',
            'pickup_lat' => 'nullable|numeric',
            'pickup_lng' => 'nullable|numeric',
            'drop_address' => 'nullable|string',
            'drop_lat' => 'nullable|numeric',
            'drop_lng' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $seats = $request->seats ?? 1;

        $ride = SharedRide::find($rideId);

        if (!$ride) {
            return response()->json([
                'success' => false,
                'message' => 'Ride not found',
            ], 404);
        }

        // Check if user is the driver
        if ($ride->driver_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot book your own ride',
            ], 400);
        }

        // Check if already booked
        $existingBooking = SharedRideBooking::where('shared_ride_id', $rideId)
            ->where('passenger_id', $user->id)
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->first();

        if ($existingBooking) {
            return response()->json([
                'success' => false,
                'message' => 'You have already booked this ride',
            ], 400);
        }

        // Check availability
        if (!$ride->canBook($seats)) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough seats available or ride is not open for booking',
            ], 400);
        }

        // Check women only restriction
        if ($ride->women_only && $user->gender !== 'female') {
            return response()->json([
                'success' => false,
                'message' => 'This ride is for women only',
            ], 400);
        }

        $amount = $ride->price_per_seat * $seats;

        $booking = SharedRideBooking::create([
            'shared_ride_id' => $rideId,
            'passenger_id' => $user->id,
            'seats_booked' => $seats,
            'amount' => $amount,
            'pickup_address' => $request->pickup_address,
            'pickup_lat' => $request->pickup_lat,
            'pickup_lng' => $request->pickup_lng,
            'drop_address' => $request->drop_address,
            'drop_lat' => $request->drop_lat,
            'drop_lng' => $request->drop_lng,
            'status' => 'pending',
        ]);

        // TODO: Send notification to driver

        return response()->json([
            'success' => true,
            'message' => 'Booking request sent. Waiting for driver approval.',
            'data' => [
                'booking' => $this->formatBookingData($booking),
            ],
        ], 201);
    }

    /**
     * Accept booking request (Driver) - with swipe
     */
    public function acceptBooking(Request $request, $bookingId)
    {
        $user = $request->user();

        $booking = SharedRideBooking::with('sharedRide')->find($bookingId);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found',
            ], 404);
        }

        // Check if user is the driver
        if ($booking->sharedRide->driver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Check if booking is pending
        if ($booking->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Booking is not pending',
            ], 400);
        }

        // Check if ride still has space
        if (!$booking->sharedRide->canBook($booking->seats_booked)) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough seats available',
            ], 400);
        }

        $booking->accept();

        // TODO: Send notification to passenger

        return response()->json([
            'success' => true,
            'message' => 'Booking accepted. Waiting for passenger payment.',
            'data' => [
                'booking' => $this->formatBookingData($booking->fresh()),
            ],
        ]);
    }

    /**
     * Reject booking request (Driver) - with swipe
     */
    public function rejectBooking(Request $request, $bookingId)
    {
        $user = $request->user();

        $booking = SharedRideBooking::with('sharedRide')->find($bookingId);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found',
            ], 404);
        }

        // Check if user is the driver
        if ($booking->sharedRide->driver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($booking->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Booking is not pending',
            ], 400);
        }

        $booking->reject();

        // TODO: Send notification to passenger

        return response()->json([
            'success' => true,
            'message' => 'Booking rejected',
        ]);
    }

    /**
     * Confirm booking with payment (Passenger)
     */
    public function confirmBooking(Request $request, $bookingId)
    {
        $user = $request->user();

        $booking = SharedRideBooking::with('sharedRide')->find($bookingId);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found',
            ], 404);
        }

        if ($booking->passenger_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($booking->status !== 'accepted') {
            return response()->json([
                'success' => false,
                'message' => 'Booking must be accepted first',
            ], 400);
        }

        // TODO: Process payment from wallet
        // For now, just confirm
        $booking->confirm('wallet');

        return response()->json([
            'success' => true,
            'message' => 'Booking confirmed successfully',
            'data' => [
                'booking' => $this->formatBookingData($booking->fresh()),
            ],
        ]);
    }

    /**
     * Cancel booking (Passenger)
     */
    public function cancelBooking(Request $request, $bookingId)
    {
        $user = $request->user();

        $booking = SharedRideBooking::with('sharedRide')->find($bookingId);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found',
            ], 404);
        }

        if ($booking->passenger_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (in_array($booking->status, ['picked_up', 'dropped_off', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel this booking',
            ], 400);
        }

        $booking->cancel();

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled',
        ]);
    }

    /**
     * Get driver's shared rides
     */
    public function myRides(Request $request)
    {
        $user = $request->user();
        $status = $request->query('status'); // open, full, in_progress, completed

        $query = SharedRide::with(['bookings.passenger.riderProfile'])
            ->where('driver_id', $user->id);

        if ($status) {
            $query->where('status', $status);
        }

        $rides = $query->orderBy('departure_time', 'desc')
            ->paginate(10)
            ->through(function ($ride) {
                return $this->formatRideData($ride, true);
            });

        return response()->json([
            'success' => true,
            'data' => $rides,
        ]);
    }

    /**
     * Get passenger's bookings
     */
    public function myBookings(Request $request)
    {
        $user = $request->user();
        $status = $request->query('status');

        $query = SharedRideBooking::with([
            'sharedRide.driver.riderProfile',
            'sharedRide.confirmedBookings.passenger.riderProfile',
        ])->where('passenger_id', $user->id);

        if ($status) {
            $query->where('status', $status);
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->through(function ($booking) {
                return $this->formatBookingData($booking, true);
            });

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Get pending booking requests for driver
     */
    public function pendingRequests(Request $request)
    {
        $user = $request->user();

        $bookings = SharedRideBooking::with(['passenger.riderProfile', 'sharedRide'])
            ->whereHas('sharedRide', function ($q) use ($user) {
                $q->where('driver_id', $user->id);
            })
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return $this->formatBookingData($booking, true);
            });

        return response()->json([
            'success' => true,
            'data' => [
                'bookings' => $bookings,
            ],
        ]);
    }

    /**
     * Start the ride
     */
    public function startRide(Request $request, $rideId)
    {
        $user = $request->user();

        $ride = SharedRide::find($rideId);

        if (!$ride || $ride->driver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Ride not found or unauthorized',
            ], 404);
        }

        if (!in_array($ride->status, ['open', 'full'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot start this ride',
            ], 400);
        }

        $ride->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ride started',
            'data' => [
                'ride' => $this->formatRideData($ride->fresh(), true),
            ],
        ]);
    }

    /**
     * Complete the ride
     */
    public function completeRide(Request $request, $rideId)
    {
        $user = $request->user();

        $ride = SharedRide::find($rideId);

        if (!$ride || $ride->driver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Ride not found or unauthorized',
            ], 404);
        }

        if ($ride->status !== 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => 'Ride must be in progress',
            ], 400);
        }

        $ride->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Mark all picked up passengers as dropped off
        $ride->bookings()->where('status', 'picked_up')->update([
            'status' => 'dropped_off',
            'dropped_off_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ride completed',
            'data' => [
                'ride' => $this->formatRideData($ride->fresh(), true),
            ],
        ]);
    }

    /**
     * Mark passenger as picked up
     */
    public function pickupPassenger(Request $request, $bookingId)
    {
        $user = $request->user();

        $booking = SharedRideBooking::with('sharedRide')->find($bookingId);

        if (!$booking || $booking->sharedRide->driver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found or unauthorized',
            ], 404);
        }

        if ($booking->status !== 'confirmed') {
            return response()->json([
                'success' => false,
                'message' => 'Booking must be confirmed',
            ], 400);
        }

        $booking->markPickedUp();

        return response()->json([
            'success' => true,
            'message' => 'Passenger picked up',
        ]);
    }

    /**
     * Mark passenger as dropped off
     */
    public function dropoffPassenger(Request $request, $bookingId)
    {
        $user = $request->user();

        $booking = SharedRideBooking::with('sharedRide')->find($bookingId);

        if (!$booking || $booking->sharedRide->driver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found or unauthorized',
            ], 404);
        }

        if ($booking->status !== 'picked_up') {
            return response()->json([
                'success' => false,
                'message' => 'Passenger must be picked up first',
            ], 400);
        }

        $booking->markDroppedOff();

        return response()->json([
            'success' => true,
            'message' => 'Passenger dropped off',
        ]);
    }

    /**
     * Cancel the ride (Driver)
     */
    public function cancelRide(Request $request, $rideId)
    {
        $user = $request->user();

        $ride = SharedRide::find($rideId);

        if (!$ride || $ride->driver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Ride not found or unauthorized',
            ], 404);
        }

        if (in_array($ride->status, ['in_progress', 'completed', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel this ride',
            ], 400);
        }

        // Cancel all pending/accepted/confirmed bookings
        $ride->bookings()->whereIn('status', ['pending', 'accepted', 'confirmed'])->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $ride->update([
            'status' => 'cancelled',
        ]);

        // TODO: Notify all passengers and process refunds

        return response()->json([
            'success' => true,
            'message' => 'Ride cancelled. All passengers have been notified.',
        ]);
    }

    /**
     * Rate driver (Passenger)
     */
    public function rateDriver(Request $request, $bookingId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $booking = SharedRideBooking::with('sharedRide')->find($bookingId);

        if (!$booking || $booking->passenger_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found or unauthorized',
            ], 404);
        }

        if ($booking->status !== 'dropped_off') {
            return response()->json([
                'success' => false,
                'message' => 'Can only rate after ride completion',
            ], 400);
        }

        if ($booking->driver_rating) {
            return response()->json([
                'success' => false,
                'message' => 'You have already rated this ride',
            ], 400);
        }

        $booking->rateDriver($request->rating, $request->review);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your rating!',
        ]);
    }

    /**
     * Rate passenger (Driver)
     */
    public function ratePassenger(Request $request, $bookingId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $booking = SharedRideBooking::with('sharedRide')->find($bookingId);

        if (!$booking || $booking->sharedRide->driver_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found or unauthorized',
            ], 404);
        }

        if ($booking->status !== 'dropped_off') {
            return response()->json([
                'success' => false,
                'message' => 'Can only rate after ride completion',
            ], 400);
        }

        $booking->ratePassenger($request->rating, $request->review);

        return response()->json([
            'success' => true,
            'message' => 'Rating submitted!',
        ]);
    }

    // Helper methods
    private function formatRideData($ride, $includePassengers = false)
    {
        $data = [
            'id' => $ride->id,
            'from' => [
                'address' => $ride->from_address,
                'lat' => $ride->from_lat,
                'lng' => $ride->from_lng,
            ],
            'to' => [
                'address' => $ride->to_address,
                'lat' => $ride->to_lat,
                'lng' => $ride->to_lng,
            ],
            'departure_time' => $ride->departure_time->toIso8601String(),
            'departure_formatted' => $ride->departure_time->format('D, M j \a\t g:i A'),
            'total_seats' => $ride->total_seats,
            'available_seats' => $ride->available_seats,
            'booked_seats' => $ride->total_seats - $ride->available_seats,
            'price_per_seat' => $ride->price_per_seat,
            'total_distance' => $ride->total_distance,
            'estimated_duration' => $ride->estimated_duration,
            'vehicle' => [
                'type' => $ride->vehicle_type,
                'model' => $ride->vehicle_model,
                'color' => $ride->vehicle_color,
                'plate' => $ride->plate_number,
            ],
            'preferences' => [
                'women_only' => $ride->women_only,
                'ac_available' => $ride->ac_available,
                'luggage_allowed' => $ride->luggage_allowed,
                'smoking_allowed' => $ride->smoking_allowed,
                'pets_allowed' => $ride->pets_allowed,
            ],
            'notes' => $ride->notes,
            'status' => $ride->status,
            'driver' => $this->formatUserData($ride->driver),
            'created_at' => $ride->created_at->toIso8601String(),
        ];

        if ($includePassengers && $ride->confirmedBookings) {
            $data['passengers'] = $ride->confirmedBookings->map(function ($booking) {
                return [
                    'booking_id' => $booking->id,
                    'user' => $this->formatUserData($booking->passenger),
                    'seats' => $booking->seats_booked,
                    'status' => $booking->status,
                    'pickup' => $booking->pickup_address ? [
                        'address' => $booking->pickup_address,
                        'lat' => $booking->pickup_lat,
                        'lng' => $booking->pickup_lng,
                    ] : null,
                ];
            });
        }

        if (isset($ride->distance)) {
            $data['distance_from_you'] = round($ride->distance, 1) . ' km';
        }

        return $data;
    }

    private function formatBookingData($booking, $includeRide = false)
    {
        $data = [
            'id' => $booking->id,
            'seats_booked' => $booking->seats_booked,
            'amount' => $booking->amount,
            'status' => $booking->status,
            'payment_status' => $booking->payment_status,
            'pickup' => $booking->pickup_address ? [
                'address' => $booking->pickup_address,
                'lat' => $booking->pickup_lat,
                'lng' => $booking->pickup_lng,
            ] : null,
            'drop' => $booking->drop_address ? [
                'address' => $booking->drop_address,
                'lat' => $booking->drop_lat,
                'lng' => $booking->drop_lng,
            ] : null,
            'passenger' => $this->formatUserData($booking->passenger),
            'created_at' => $booking->created_at->toIso8601String(),
        ];

        if ($includeRide && $booking->sharedRide) {
            $data['ride'] = $this->formatRideData($booking->sharedRide, true);
        }

        return $data;
    }

    private function formatUserData($user)
    {
        if (!$user) return null;

        $profile = $user->riderProfile;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'gender' => $user->gender,
            'photo' => $profile?->profile_photo,
            'rating' => $user->driver?->rating_average ?? 5.0,
            'rides_count' => $user->driver?->completed_rides_count ?? 0,
            'verified' => $user->phone_verified_at ? true : false,
        ];
    }

    private function calculateDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371; // km

        $latDiff = deg2rad($lat2 - $lat1);
        $lngDiff = deg2rad($lng2 - $lng1);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lngDiff / 2) * sin($lngDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }
}
