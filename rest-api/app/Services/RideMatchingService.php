<?php

namespace App\Services;

use App\Models\RideRequest;
use App\Models\Schedule;
use App\Models\Driver;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RideMatchingService
{
    /**
     * Match a ride request with available drivers
     */
    public function matchRideWithDrivers(RideRequest $ride)
    {
        // Get current day and time
        $currentDay = strtolower(Carbon::now()->format('l')); // monday, tuesday, etc
        $currentTime = Carbon::now()->format('H:i');

        // Find matching schedules
        $matchingSchedules = Schedule::where('is_active', true)
            ->whereJsonContains('days', $currentDay)
            ->get()
            ->filter(function ($schedule) use ($ride, $currentTime) {
                // Check if schedule time is within 30 minutes
                $scheduleTime = Carbon::parse($schedule->departure_time);
                $currentTimeCarbon = Carbon::parse($currentTime);
                $timeDiff = abs($scheduleTime->diffInMinutes($currentTimeCarbon));

                if ($timeDiff > 30) {
                    return false;
                }

                // Calculate match score based on route similarity
                $score = $this->calculateMatchScore(
                    $ride->pickup_latitude,
                    $ride->pickup_longitude,
                    $ride->dropoff_latitude,
                    $ride->dropoff_longitude,
                    $schedule->from_latitude,
                    $schedule->from_longitude,
                    $schedule->to_latitude,
                    $schedule->to_longitude
                );

                return $score >= 70; // Minimum 70% match
            });

        $matchedDrivers = [];

        foreach ($matchingSchedules as $schedule) {
            $driver = Driver::with('user')->find($schedule->driver_id);

            // Check if driver is online and approved
            if (!$driver || $driver->status !== 'approved' || !$driver->is_online) {
                continue;
            }

            // Check if driver has active ride
            $hasActiveRide = RideRequest::where('driver_id', $driver->id)
                ->whereIn('status', ['accepted', 'started'])
                ->exists();

            if ($hasActiveRide) {
                continue;
            }

            // Calculate match score
            $score = $this->calculateMatchScore(
                $ride->pickup_latitude,
                $ride->pickup_longitude,
                $ride->dropoff_latitude,
                $ride->dropoff_longitude,
                $schedule->from_latitude,
                $schedule->from_longitude,
                $schedule->to_latitude,
                $schedule->to_longitude
            );

            $matchedDrivers[] = [
                'driver' => $driver,
                'schedule' => $schedule,
                'match_score' => $score,
                'distance_from_pickup' => $this->calculateDistance(
                    $driver->current_latitude,
                    $driver->current_longitude,
                    $ride->pickup_latitude,
                    $ride->pickup_longitude
                )
            ];
        }

        // Sort by match score and distance
        usort($matchedDrivers, function ($a, $b) {
            if ($a['match_score'] !== $b['match_score']) {
                return $b['match_score'] <=> $a['match_score'];
            }
            return $a['distance_from_pickup'] <=> $b['distance_from_pickup'];
        });

        return $matchedDrivers;
    }

    /**
     * Calculate match score between ride and schedule (0-100)
     */
    private function calculateMatchScore($rideFromLat, $rideFromLng, $rideToLat, $rideToLng, $schedFromLat, $schedFromLng, $schedToLat, $schedToLng)
    {
        // Calculate distance between pickup points
        $pickupDistance = $this->calculateDistance($rideFromLat, $rideFromLng, $schedFromLat, $schedFromLng);
        
        // Calculate distance between dropoff points
        $dropoffDistance = $this->calculateDistance($rideToLat, $rideToLng, $schedToLat, $schedToLng);

        // Score calculation (within 2km = 100%, decreases linearly)
        $pickupScore = max(0, 100 - ($pickupDistance * 25)); // 25% decrease per km
        $dropoffScore = max(0, 100 - ($dropoffDistance * 25));

        // Average score
        return ($pickupScore + $dropoffScore) / 2;
    }

    /**
     * Calculate distance between two points (Haversine formula) - Returns KM
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Earth radius in kilometers

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return round($angle * $earthRadius, 2);
    }

    /**
     * Calculate estimated time and fare
     */
    public function calculateFareAndTime(RideRequest $ride)
    {
        // Calculate distance
        $distance = $this->calculateDistance(
            $ride->pickup_latitude,
            $ride->pickup_longitude,
            $ride->dropoff_latitude,
            $ride->dropoff_longitude
        );

        // Estimate duration (assuming 40 km/h average speed)
        $duration = round(($distance / 40) * 60); // in minutes

        // Fare calculation
        $baseFare = 50; // Rs. 50 base fare
        $perKmRate = 30; // Rs. 30 per km
        $commissionRate = 0.20; // 20% commission

        $fare = $baseFare + ($distance * $perKmRate);
        $commission = $fare * $commissionRate;
        $driverEarning = $fare - $commission;

        return [
            'distance_km' => $distance,
            'duration_minutes' => $duration,
            'fare' => round($fare, 2),
            'commission_amount' => round($commission, 2),
            'driver_earning' => round($driverEarning, 2),
        ];
    }

    /**
     * Auto-assign ride to best matched driver
     */
    public function autoAssignRide(RideRequest $ride)
    {
        $matchedDrivers = $this->matchRideWithDrivers($ride);

        if (empty($matchedDrivers)) {
            return [
                'success' => false,
                'message' => 'No available drivers found for this route'
            ];
        }

        // Get best matched driver
        $bestMatch = $matchedDrivers[0];

        // Update ride with matched driver
        $ride->driver_id = $bestMatch['driver']->id;
        $ride->schedule_id = $bestMatch['schedule']->id;
        $ride->match_score = $bestMatch['match_score'];
        $ride->matched_at = now();
        $ride->status = 'matched';
        $ride->save();

        return [
            'success' => true,
            'driver' => $bestMatch['driver'],
            'match_score' => $bestMatch['match_score'],
            'distance' => $bestMatch['distance_from_pickup']
        ];
    }
}