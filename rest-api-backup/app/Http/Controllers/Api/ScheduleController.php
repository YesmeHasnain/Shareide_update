<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ScheduleController extends Controller
{
    /**
     * Get all schedules for the authenticated driver
     */
    public function index(Request $request)
    {
        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No driver profile found'
                ]);
            }

            $schedules = Schedule::where('driver_id', $driver->id)
                ->orderBy('departure_time')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $schedules
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch schedules',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new schedule
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_location' => 'required|string|max:255',
            'from_latitude' => 'required|numeric',
            'from_longitude' => 'required|numeric',
            'to_location' => 'required|string|max:255',
            'to_latitude' => 'required|numeric',
            'to_longitude' => 'required|numeric',
            'departure_time' => 'required|date_format:H:i',
            'days' => 'required|array|min:1',
            'days.*' => 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $schedule = Schedule::create([
                'driver_id' => $driver->id,
                'from_location' => $request->from_location,
                'from_latitude' => $request->from_latitude,
                'from_longitude' => $request->from_longitude,
                'to_location' => $request->to_location,
                'to_latitude' => $request->to_latitude,
                'to_longitude' => $request->to_longitude,
                'departure_time' => $request->departure_time,
                'days' => $request->days,
                'is_active' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Schedule created successfully',
                'data' => $schedule
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create schedule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific schedule
     */
    public function show(Request $request, $id)
    {
        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $schedule = Schedule::where('driver_id', $driver->id)
                ->where('id', $id)
                ->first();

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Schedule not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $schedule
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch schedule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a schedule
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'from_location' => 'sometimes|string|max:255',
            'from_latitude' => 'sometimes|numeric',
            'from_longitude' => 'sometimes|numeric',
            'to_location' => 'sometimes|string|max:255',
            'to_latitude' => 'sometimes|numeric',
            'to_longitude' => 'sometimes|numeric',
            'departure_time' => 'sometimes|date_format:H:i',
            'days' => 'sometimes|array|min:1',
            'days.*' => 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $schedule = Schedule::where('driver_id', $driver->id)
                ->where('id', $id)
                ->first();

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Schedule not found'
                ], 404);
            }

            $schedule->update($request->only([
                'from_location',
                'from_latitude',
                'from_longitude',
                'to_location',
                'to_latitude',
                'to_longitude',
                'departure_time',
                'days',
                'is_active',
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Schedule updated successfully',
                'data' => $schedule->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update schedule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a schedule
     */
    public function destroy(Request $request, $id)
    {
        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $schedule = Schedule::where('driver_id', $driver->id)
                ->where('id', $id)
                ->first();

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Schedule not found'
                ], 404);
            }

            $schedule->delete();

            return response()->json([
                'success' => true,
                'message' => 'Schedule deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete schedule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle schedule active status
     */
    public function toggleActive(Request $request, $id)
    {
        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $schedule = Schedule::where('driver_id', $driver->id)
                ->where('id', $id)
                ->first();

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Schedule not found'
                ], 404);
            }

            $schedule->is_active = !$schedule->is_active;
            $schedule->save();

            return response()->json([
                'success' => true,
                'message' => $schedule->is_active ? 'Schedule activated' : 'Schedule deactivated',
                'data' => $schedule
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle schedule',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
