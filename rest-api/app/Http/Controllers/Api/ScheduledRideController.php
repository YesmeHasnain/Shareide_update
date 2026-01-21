<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScheduledRide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ScheduledRideController extends Controller
{
    /**
     * Get all scheduled rides for the user
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $status = $request->get('status'); // pending, booked, completed, cancelled, failed

            $rides = ScheduledRide::where('user_id', $user->id)
                ->when($status, function ($query, $status) {
                    return $query->where('status', $status);
                })
                ->with('rideRequest.driver')
                ->orderBy('scheduled_at', 'asc')
                ->get();

            // Separate upcoming and past
            $upcoming = $rides->filter(fn($r) => $r->status === 'pending' || $r->status === 'processing');
            $past = $rides->filter(fn($r) => !in_array($r->status, ['pending', 'processing']));

            return response()->json([
                'success' => true,
                'data' => [
                    'upcoming' => $upcoming->values(),
                    'past' => $past->values(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch scheduled rides',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new scheduled ride
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_address' => 'required|string',
            'pickup_lat' => 'required|numeric|between:-90,90',
            'pickup_lng' => 'required|numeric|between:-180,180',
            'drop_address' => 'required|string',
            'drop_lat' => 'required|numeric|between:-90,90',
            'drop_lng' => 'required|numeric|between:-180,180',
            'scheduled_date' => 'required|date|after_or_equal:today',
            'scheduled_time' => 'required|date_format:H:i',
            'vehicle_type' => 'required|in:bike,rickshaw,car,ac_car',
            'payment_method' => 'required|in:cash,wallet,card,jazzcash,easypaisa',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // Combine date and time
            $scheduledAt = Carbon::parse($request->scheduled_date . ' ' . $request->scheduled_time);

            // Must be at least 30 minutes in the future
            if ($scheduledAt->lt(now()->addMinutes(30))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Scheduled time must be at least 30 minutes from now'
                ], 422);
            }

            // Can't schedule more than 7 days in advance
            if ($scheduledAt->gt(now()->addDays(7))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot schedule rides more than 7 days in advance'
                ], 422);
            }

            // Check if user already has a scheduled ride at this time (within 1 hour)
            $existingRide = ScheduledRide::where('user_id', $user->id)
                ->where('status', 'pending')
                ->whereBetween('scheduled_at', [
                    $scheduledAt->copy()->subHour(),
                    $scheduledAt->copy()->addHour()
                ])
                ->first();

            if ($existingRide) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have a scheduled ride around this time'
                ], 422);
            }

            $scheduledRide = new ScheduledRide([
                'user_id' => $user->id,
                'pickup_address' => $request->pickup_address,
                'pickup_lat' => $request->pickup_lat,
                'pickup_lng' => $request->pickup_lng,
                'drop_address' => $request->drop_address,
                'drop_lat' => $request->drop_lat,
                'drop_lng' => $request->drop_lng,
                'scheduled_date' => $request->scheduled_date,
                'scheduled_time' => $request->scheduled_time,
                'scheduled_at' => $scheduledAt,
                'vehicle_type' => $request->vehicle_type,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'status' => 'pending',
            ]);

            // Calculate distance and fare
            $scheduledRide->distance_km = $scheduledRide->calculateDistance();
            $scheduledRide->estimated_fare = $scheduledRide->calculateFare();
            $scheduledRide->save();

            return response()->json([
                'success' => true,
                'message' => 'Ride scheduled successfully',
                'data' => [
                    'scheduled_ride' => $scheduledRide,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule ride',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single scheduled ride
     */
    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();

            $ride = ScheduledRide::where('user_id', $user->id)
                ->with('rideRequest.driver')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'scheduled_ride' => $ride,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Scheduled ride not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update a scheduled ride
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'pickup_address' => 'sometimes|string',
            'pickup_lat' => 'sometimes|numeric|between:-90,90',
            'pickup_lng' => 'sometimes|numeric|between:-180,180',
            'drop_address' => 'sometimes|string',
            'drop_lat' => 'sometimes|numeric|between:-90,90',
            'drop_lng' => 'sometimes|numeric|between:-180,180',
            'scheduled_date' => 'sometimes|date|after_or_equal:today',
            'scheduled_time' => 'sometimes|date_format:H:i',
            'vehicle_type' => 'sometimes|in:bike,rickshaw,car,ac_car',
            'payment_method' => 'sometimes|in:cash,wallet,card,jazzcash,easypaisa',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            $ride = ScheduledRide::where('user_id', $user->id)
                ->where('status', 'pending')
                ->findOrFail($id);

            // Update fields
            $ride->fill($request->only([
                'pickup_address', 'pickup_lat', 'pickup_lng',
                'drop_address', 'drop_lat', 'drop_lng',
                'vehicle_type', 'payment_method', 'notes'
            ]));

            // Update schedule if provided
            if ($request->has('scheduled_date') || $request->has('scheduled_time')) {
                $date = $request->scheduled_date ?? $ride->scheduled_date->format('Y-m-d');
                $time = $request->scheduled_time ?? $ride->scheduled_time;
                $scheduledAt = Carbon::parse($date . ' ' . $time);

                if ($scheduledAt->lt(now()->addMinutes(30))) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Scheduled time must be at least 30 minutes from now'
                    ], 422);
                }

                $ride->scheduled_date = $date;
                $ride->scheduled_time = $time;
                $ride->scheduled_at = $scheduledAt;
            }

            // Recalculate if locations changed
            if ($request->hasAny(['pickup_lat', 'pickup_lng', 'drop_lat', 'drop_lng', 'vehicle_type'])) {
                $ride->distance_km = $ride->calculateDistance();
                $ride->estimated_fare = $ride->calculateFare();
            }

            $ride->save();

            return response()->json([
                'success' => true,
                'message' => 'Scheduled ride updated',
                'data' => [
                    'scheduled_ride' => $ride,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update scheduled ride',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a scheduled ride
     */
    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();

            $ride = ScheduledRide::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'processing'])
                ->findOrFail($id);

            $ride->status = 'cancelled';
            $ride->save();

            return response()->json([
                'success' => true,
                'message' => 'Scheduled ride cancelled'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel scheduled ride',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get upcoming scheduled rides count
     */
    public function upcomingCount(Request $request)
    {
        try {
            $user = $request->user();

            $count = ScheduledRide::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'processing'])
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'count' => $count,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get count',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
