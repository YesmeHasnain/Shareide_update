<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SharedRide;
use App\Models\SharedRideBooking;
use App\Models\SharedRideBid;
use App\Models\SharedRideChat;
use App\Models\User;
use App\Services\NotificationService;
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
            'ride_type' => 'nullable|in:single,daily,weekly,monthly',
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

        $query = SharedRide::with(['driver.riderProfile', 'driver.driver', 'confirmedBookings.passenger.riderProfile'])
            ->open()
            ->upcoming()
            ->where('available_seats', '>=', $seats)
            ->nearby($fromLat, $fromLng, $radius);

        // Filter by date
        if ($request->date) {
            $query->whereDate('departure_time', $request->date);
        }

        // Filter by ride type
        if ($request->ride_type) {
            $query->where('ride_type', $request->ride_type);
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
            ->map(function ($ride) use ($fromLat, $fromLng) {
                $data = $this->formatRideData($ride, true);

                // Add distance from search origin
                $data['distance_from_you'] = round($this->calculateDistance(
                    $fromLat, $fromLng, $ride->from_lat, $ride->from_lng
                ), 1) . ' km';

                // Add estimated route duration (rough: 2 min per km)
                if ($ride->total_distance) {
                    $data['estimated_duration_mins'] = round($ride->total_distance * 2);
                }

                // Add passenger preview (limited info)
                $data['passenger_previews'] = $ride->confirmedBookings->take(4)->map(function ($booking) {
                    return [
                        'name' => $booking->passenger?->name,
                        'photo' => $booking->passenger?->riderProfile?->profile_photo,
                        'gender' => $booking->passenger?->gender,
                    ];
                })->values();

                return $data;
            });

        return response()->json([
            'success' => true,
            'data' => [
                'rides' => $rides,
                'total' => $rides->count(),
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
            'ride_type' => 'nullable|in:single,daily,weekly,monthly',
            'recurring_days' => 'nullable|array',
            'recurring_days.*' => 'in:mon,tue,wed,thu,fri,sat,sun',
            'end_date' => 'nullable|date|after:today',
            // Legacy field names from PostRideScreen
            'pickup_address' => 'nullable|string',
            'pickup_lat' => 'nullable|numeric',
            'pickup_lng' => 'nullable|numeric',
            'dropoff_address' => 'nullable|string',
            'dropoff_lat' => 'nullable|numeric',
            'dropoff_lng' => 'nullable|numeric',
            'available_seats' => 'nullable|integer|min:1|max:8',
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

        // Support both field naming conventions
        $fromAddress = $request->from_address ?? $request->pickup_address;
        $fromLat = $request->from_lat ?? $request->pickup_lat;
        $fromLng = $request->from_lng ?? $request->pickup_lng;
        $toAddress = $request->to_address ?? $request->dropoff_address;
        $toLat = $request->to_lat ?? $request->dropoff_lat;
        $toLng = $request->to_lng ?? $request->dropoff_lng;
        $totalSeats = $request->total_seats ?? $request->available_seats;

        // Calculate distance
        $distance = $this->calculateDistance($fromLat, $fromLng, $toLat, $toLng);

        $rideType = $request->ride_type ?? 'single';
        $endDate = $request->end_date;

        // Set default end dates for recurring rides
        if ($rideType === 'daily' && !$endDate) {
            $endDate = now()->addDays(30)->format('Y-m-d');
        } elseif ($rideType === 'weekly' && !$endDate) {
            $endDate = now()->addWeeks(4)->format('Y-m-d');
        } elseif ($rideType === 'monthly' && !$endDate) {
            $endDate = now()->addMonth()->format('Y-m-d');
        }

        $ride = SharedRide::create([
            'driver_id' => $user->id,
            'from_address' => $fromAddress,
            'from_lat' => $fromLat,
            'from_lng' => $fromLng,
            'to_address' => $toAddress,
            'to_lat' => $toLat,
            'to_lng' => $toLng,
            'departure_time' => $request->departure_time,
            'total_seats' => $totalSeats,
            'available_seats' => $totalSeats,
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
            'ride_type' => $rideType,
            'recurring_days' => $request->recurring_days,
            'end_date' => $endDate,
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

        // Send notification to driver
        try {
            $notificationService = app(NotificationService::class);
            $notificationService->sendToUser(
                $ride->driver_id,
                'New Booking Request!',
                ($user->name ?? 'A passenger') . ' wants to book ' . $seats . ' seat(s) on your ride.',
                'shared_ride_booking',
                ['ride_id' => $rideId, 'booking_id' => $booking->id]
            );
        } catch (\Exception $e) {
            \Log::error('Notification error: ' . $e->getMessage());
        }

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

        // Send notification to passenger
        try {
            $notificationService = app(NotificationService::class);
            $notificationService->sendToUser(
                $booking->passenger_id,
                'Booking Accepted!',
                'Your booking request has been accepted by the driver. Please confirm and pay to secure your seat.',
                'shared_ride_accepted',
                ['ride_id' => $booking->shared_ride_id, 'booking_id' => $booking->id]
            );
        } catch (\Exception $e) {
            \Log::error('Notification error: ' . $e->getMessage());
        }

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

        // Send notification to passenger
        try {
            $notificationService = app(NotificationService::class);
            $notificationService->sendToUser(
                $booking->passenger_id,
                'Booking Update',
                'Your booking request was not accepted. Try searching for other available rides.',
                'shared_ride_rejected',
                ['ride_id' => $booking->shared_ride_id, 'booking_id' => $booking->id]
            );
        } catch (\Exception $e) {
            \Log::error('Notification error: ' . $e->getMessage());
        }

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

        // Notify all confirmed passengers that ride has started
        try {
            $notificationService = app(NotificationService::class);
            $confirmedBookings = $ride->bookings()->whereIn('status', ['confirmed', 'picked_up'])->get();
            foreach ($confirmedBookings as $booking) {
                $notificationService->sendToUser(
                    $booking->passenger_id,
                    'Ride Started!',
                    'Your shared ride from ' . $ride->from_address . ' has started. Get ready!',
                    'shared_ride_started',
                    ['ride_id' => $ride->id]
                );
            }
        } catch (\Exception $e) {
            \Log::error('Notification error: ' . $e->getMessage());
        }

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

        // Get passengers to notify before updating
        $passengersToNotify = $ride->bookings()
            ->whereIn('status', ['confirmed', 'picked_up'])
            ->pluck('passenger_id');

        $ride->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Mark all picked up passengers as dropped off
        $ride->bookings()->where('status', 'picked_up')->update([
            'status' => 'dropped_off',
            'dropped_off_at' => now(),
        ]);

        // Notify all passengers that ride is completed
        try {
            $notificationService = app(NotificationService::class);
            foreach ($passengersToNotify as $passengerId) {
                $notificationService->sendToUser(
                    $passengerId,
                    'Ride Completed!',
                    'Your shared ride has been completed. Don\'t forget to rate your driver!',
                    'shared_ride_completed',
                    ['ride_id' => $ride->id]
                );
            }
        } catch (\Exception $e) {
            \Log::error('Notification error: ' . $e->getMessage());
        }

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

        // Get affected passengers before cancelling
        $affectedBookings = $ride->bookings()
            ->whereIn('status', ['pending', 'accepted', 'confirmed'])
            ->get();

        $ride->update([
            'status' => 'cancelled',
        ]);

        // Notify all affected passengers
        try {
            $notificationService = app(NotificationService::class);
            foreach ($affectedBookings as $affectedBooking) {
                $notificationService->sendToUser(
                    $affectedBooking->passenger_id,
                    'Ride Cancelled',
                    'The shared ride from ' . $ride->from_address . ' has been cancelled by the driver.',
                    'shared_ride_cancelled',
                    ['ride_id' => $ride->id, 'booking_id' => $affectedBooking->id]
                );
            }
        } catch (\Exception $e) {
            \Log::error('Notification error: ' . $e->getMessage());
        }

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

    /**
     * Get available rides within radius (Simple API)
     */
    public function available(Request $request)
    {
        try {
            $lat = $request->query('latitude');
            $lng = $request->query('longitude');
            $radius = $request->query('radius', 5);

            $query = SharedRide::with(['driver.driver', 'driver.riderProfile', 'confirmedBookings.passenger.riderProfile'])
                ->whereIn('status', ['open', 'active'])
                ->where('available_seats', '>', 0)
                ->where('departure_time', '>', now());

            if ($lat && $lng) {
                $latRange = $radius / 111;
                $lngRange = $radius / (111 * cos(deg2rad($lat)));
                $query->whereBetween('from_lat', [$lat - $latRange, $lat + $latRange])
                      ->whereBetween('from_lng', [$lng - $lngRange, $lng + $lngRange]);
            }

            $rides = $query->orderBy('departure_time', 'asc')->limit(20)->get();

            return response()->json([
                'success' => true,
                'rides' => $rides->map(function ($ride) use ($lat, $lng) {
                    $data = [
                        'id' => $ride->id,
                        'driver_id' => $ride->driver_id,
                        'driver' => [
                            'name' => $ride->driver->name ?? 'Driver',
                            'phone' => $ride->driver->phone,
                            'photo' => $ride->driver->riderProfile?->profile_photo,
                            'rating' => $ride->driver->driver->rating_average ?? 5.0,
                            'vehicle_model' => $ride->driver->driver->vehicle_model ?? $ride->vehicle_model ?? 'Car',
                            'completed_rides' => $ride->driver->driver->completed_rides_count ?? 0,
                            'verified' => $ride->driver->phone_verified_at ? true : false,
                        ],
                        'pickup_address' => $ride->from_address,
                        'pickup_lat' => $ride->from_lat,
                        'pickup_lng' => $ride->from_lng,
                        'dropoff_address' => $ride->to_address,
                        'dropoff_lat' => $ride->to_lat,
                        'dropoff_lng' => $ride->to_lng,
                        'available_seats' => $ride->available_seats,
                        'total_seats' => $ride->total_seats,
                        'booked_seats' => $ride->total_seats - $ride->available_seats,
                        'price_per_seat' => $ride->price_per_seat,
                        'total_distance' => $ride->total_distance,
                        'departure_time' => $ride->departure_time,
                        'ride_type' => $ride->ride_type ?? 'single',
                        'recurring_days' => $ride->recurring_days,
                        'notes' => $ride->notes,
                        'status' => $ride->status,
                        'preferences' => [
                            'women_only' => $ride->women_only,
                            'ac_available' => $ride->ac_available,
                            'luggage_allowed' => $ride->luggage_allowed,
                        ],
                        'passenger_previews' => $ride->confirmedBookings->take(4)->map(function ($booking) {
                            return [
                                'name' => $booking->passenger?->name,
                                'photo' => $booking->passenger?->riderProfile?->profile_photo,
                            ];
                        })->values(),
                    ];

                    // Add distance from user
                    if ($lat && $lng) {
                        $data['distance_from_you'] = round($this->calculateDistance(
                            $lat, $lng, $ride->from_lat, $ride->from_lng
                        ), 1);
                    }

                    return $data;
                }),
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => true, 'rides' => []]);
        }
    }

    /**
     * Place a bid on a ride
     */
    public function placeBid(Request $request, $rideId)
    {
        $validator = Validator::make($request->all(), [
            'bid_amount' => 'required|integer|min:1',
            'seats_requested' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed'], 422);
        }

        $ride = SharedRide::find($rideId);
        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
        }

        $user = $request->user();

        // Check or update existing bid
        $bid = SharedRideBid::updateOrCreate(
            ['ride_id' => $rideId, 'user_id' => $user->id],
            [
                'bid_amount' => $request->bid_amount,
                'seats_requested' => $request->seats_requested,
                'status' => 'pending',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Bid placed successfully',
            'bid' => $bid,
        ]);
    }

    /**
     * Get bids for a ride (Driver)
     */
    public function getBids(Request $request, $rideId)
    {
        $user = $request->user();
        $ride = SharedRide::where('id', $rideId)->where('driver_id', $user->id)->first();

        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $bids = SharedRideBid::with('user')
            ->where('ride_id', $rideId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'bids' => $bids->map(function ($bid) {
                return [
                    'id' => $bid->id,
                    'user_id' => $bid->user_id,
                    'user_name' => $bid->user->name ?? 'User',
                    'user_phone' => $bid->user->phone,
                    'bid_amount' => $bid->bid_amount,
                    'seats_requested' => $bid->seats_requested,
                    'status' => $bid->status,
                    'created_at' => $bid->created_at,
                ];
            }),
        ]);
    }

    /**
     * Accept/Reject bid
     */
    public function respondToBid(Request $request, $rideId, $bidId)
    {
        $action = $request->input('action');
        if (!in_array($action, ['accept', 'reject'])) {
            return response()->json(['success' => false, 'message' => 'Invalid action'], 422);
        }

        $user = $request->user();
        $ride = SharedRide::where('id', $rideId)->where('driver_id', $user->id)->first();

        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $bid = SharedRideBid::find($bidId);
        if (!$bid || $bid->ride_id != $rideId) {
            return response()->json(['success' => false, 'message' => 'Bid not found'], 404);
        }

        $bid->status = $action === 'accept' ? 'accepted' : 'rejected';
        $bid->save();

        if ($action === 'accept' && $bid->seats_requested <= $ride->available_seats) {
            $ride->available_seats -= $bid->seats_requested;
            $ride->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Bid ' . $action . 'ed',
            'bid' => $bid,
        ]);
    }

    /**
     * Get chat messages
     */
    public function getChat(Request $request, $rideId)
    {
        $user = $request->user();
        $ride = SharedRide::find($rideId);

        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
        }

        $messages = SharedRideChat::where('ride_id', $rideId)
            ->where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)->orWhere('receiver_id', $user->id);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        $otherUserId = $ride->driver_id === $user->id
            ? SharedRideBid::where('ride_id', $rideId)->first()?->user_id
            : $ride->driver_id;

        $otherUser = User::find($otherUserId);

        return response()->json([
            'success' => true,
            'messages' => $messages,
            'other_user' => $otherUser ? [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'phone' => $otherUser->phone,
            ] : null,
        ]);
    }

    /**
     * Allowed preset messages for chat safety
     */
    private $allowedMessages = [
        // Passenger presets
        "I'm on my way",
        "Where are you exactly?",
        "Please wait, coming in 2 mins",
        "Can you share your location?",
        "I'm at the pickup point",
        "Running 5 minutes late",
        "Is the ride still available?",
        "What time will you depart?",
        "Thank you!",
        "Cancel my booking please",
        // Driver presets
        "I've arrived at pickup",
        "Ride starting now",
        "Please be ready, departing soon",
        "I'll be there in 5 mins",
        "I'll be there in 10 mins",
        "Is the booking confirmed?",
        "See you soon!",
        "Ride completed, thank you!",
        "Running 5 mins late",
    ];

    /**
     * Send chat message - restricted to preset messages only
     */
    public function sendChat(Request $request, $rideId)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Message required'], 422);
        }

        $messageText = trim($request->message);

        // Validate message is from approved preset list
        if (!in_array($messageText, $this->allowedMessages)) {
            return response()->json([
                'success' => false,
                'message' => 'Only preset messages are allowed for safety.',
            ], 400);
        }

        // Block any message containing phone patterns
        if (preg_match('/(\d{10,}|\+\d{7,}|whatsapp|wa\.me)/i', $messageText)) {
            return response()->json([
                'success' => false,
                'message' => 'Sharing personal contact information is not allowed.',
            ], 400);
        }

        $user = $request->user();
        $ride = SharedRide::find($rideId);

        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
        }

        $receiverId = $ride->driver_id === $user->id
            ? SharedRideBid::where('ride_id', $rideId)->first()?->user_id ?? $ride->driver_id
            : $ride->driver_id;

        $message = SharedRideChat::create([
            'ride_id' => $rideId,
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'message' => $messageText,
        ]);

        return response()->json([
            'success' => true,
            'message' => $message,
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
            'ride_type' => $ride->ride_type ?? 'single',
            'recurring_days' => $ride->recurring_days,
            'end_date' => $ride->end_date?->format('Y-m-d'),
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
