<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ScheduledRide;
use App\Models\RideRequest;
use App\Models\Driver;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessScheduledRides extends Command
{
    protected $signature = 'rides:process-scheduled';
    protected $description = 'Process scheduled rides and auto-book when time comes';

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        parent::__construct();
        $this->notificationService = $notificationService;
    }

    public function handle()
    {
        $this->info('Processing scheduled rides...');

        // 1. Send 30-minute reminders
        $this->send30MinReminders();

        // 2. Send 10-minute reminders
        $this->send10MinReminders();

        // 3. Process rides ready to book (5 minutes before scheduled time)
        $this->processReadyRides();

        $this->info('Scheduled rides processing completed.');
        return 0;
    }

    /**
     * Send 30-minute reminder notifications
     */
    protected function send30MinReminders()
    {
        $rides = ScheduledRide::needs30MinReminder()->get();

        foreach ($rides as $ride) {
            try {
                $this->notificationService->sendToUser(
                    $ride->user_id,
                    'Upcoming Ride Reminder',
                    "Your scheduled ride to {$ride->drop_address} is in 30 minutes.",
                    [
                        'type' => 'scheduled_ride_reminder',
                        'scheduled_ride_id' => $ride->id,
                        'minutes' => 30,
                    ]
                );

                $ride->reminder_30min_sent = true;
                $ride->save();

                $this->info("30-min reminder sent for ride #{$ride->id}");
            } catch (\Exception $e) {
                Log::error("Failed to send 30-min reminder for ride #{$ride->id}: " . $e->getMessage());
            }
        }
    }

    /**
     * Send 10-minute reminder notifications
     */
    protected function send10MinReminders()
    {
        $rides = ScheduledRide::needs10MinReminder()->get();

        foreach ($rides as $ride) {
            try {
                $this->notificationService->sendToUser(
                    $ride->user_id,
                    'Ride Starting Soon',
                    "Your scheduled ride to {$ride->drop_address} is in 10 minutes. We're finding a driver for you.",
                    [
                        'type' => 'scheduled_ride_reminder',
                        'scheduled_ride_id' => $ride->id,
                        'minutes' => 10,
                    ]
                );

                $ride->reminder_10min_sent = true;
                $ride->save();

                $this->info("10-min reminder sent for ride #{$ride->id}");
            } catch (\Exception $e) {
                Log::error("Failed to send 10-min reminder for ride #{$ride->id}: " . $e->getMessage());
            }
        }
    }

    /**
     * Process rides that are ready to book
     */
    protected function processReadyRides()
    {
        $rides = ScheduledRide::readyToBook()->get();

        foreach ($rides as $ride) {
            $this->info("Processing scheduled ride #{$ride->id}");

            try {
                DB::beginTransaction();

                // Mark as processing
                $ride->status = 'processing';
                $ride->save();

                // Find nearby available driver
                $driver = $this->findNearbyDriver($ride);

                if ($driver) {
                    // Create ride request
                    $rideRequest = $this->createRideRequest($ride, $driver);

                    // Update scheduled ride
                    $ride->status = 'booked';
                    $ride->ride_request_id = $rideRequest->id;
                    $ride->booking_notification_sent = true;
                    $ride->save();

                    // Notify user
                    $this->notificationService->sendToUser(
                        $ride->user_id,
                        'Driver Found!',
                        "A driver has been assigned for your scheduled ride. Driver: {$driver->user->name}",
                        [
                            'type' => 'scheduled_ride_booked',
                            'scheduled_ride_id' => $ride->id,
                            'ride_request_id' => $rideRequest->id,
                            'driver_id' => $driver->id,
                        ]
                    );

                    // Notify driver
                    $this->notificationService->sendToUser(
                        $driver->user_id,
                        'New Ride Request',
                        "You have a new scheduled ride request to {$ride->drop_address}",
                        [
                            'type' => 'new_ride_request',
                            'ride_request_id' => $rideRequest->id,
                        ]
                    );

                    $this->info("Ride #{$ride->id} booked with driver #{$driver->id}");
                } else {
                    // No driver found, retry later or mark as failed
                    $ride->retry_count++;
                    $ride->last_retry_at = now();

                    if ($ride->retry_count >= 3) {
                        $ride->status = 'failed';
                        $ride->failure_reason = 'No drivers available after 3 attempts';

                        // Notify user
                        $this->notificationService->sendToUser(
                            $ride->user_id,
                            'Scheduled Ride Failed',
                            "Sorry, we couldn't find a driver for your scheduled ride. Please try booking manually.",
                            [
                                'type' => 'scheduled_ride_failed',
                                'scheduled_ride_id' => $ride->id,
                            ]
                        );

                        $this->warn("Ride #{$ride->id} failed after 3 retries");
                    } else {
                        $ride->status = 'pending'; // Will retry next minute
                        $this->info("Ride #{$ride->id} - no driver found, will retry (attempt {$ride->retry_count})");
                    }

                    $ride->save();
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Failed to process scheduled ride #{$ride->id}: " . $e->getMessage());
                $this->error("Error processing ride #{$ride->id}: " . $e->getMessage());
            }
        }
    }

    /**
     * Find a nearby available driver
     */
    protected function findNearbyDriver(ScheduledRide $ride): ?Driver
    {
        $radius = 5; // km

        $drivers = Driver::where('is_online', true)
            ->where('status', 'approved')
            ->whereNotNull('current_lat')
            ->whereNotNull('current_lng')
            ->where('vehicle_type', $ride->vehicle_type)
            ->get()
            ->filter(function ($driver) use ($ride, $radius) {
                $distance = $this->calculateDistance(
                    $ride->pickup_lat,
                    $ride->pickup_lng,
                    $driver->current_lat,
                    $driver->current_lng
                );
                return $distance <= $radius;
            })
            ->sortBy(function ($driver) use ($ride) {
                return $this->calculateDistance(
                    $ride->pickup_lat,
                    $ride->pickup_lng,
                    $driver->current_lat,
                    $driver->current_lng
                );
            });

        return $drivers->first();
    }

    /**
     * Create ride request from scheduled ride
     */
    protected function createRideRequest(ScheduledRide $ride, Driver $driver): RideRequest
    {
        return RideRequest::create([
            'rider_id' => $ride->user_id,
            'driver_id' => $driver->user_id,
            'pickup_address' => $ride->pickup_address,
            'pickup_lat' => $ride->pickup_lat,
            'pickup_lng' => $ride->pickup_lng,
            'drop_address' => $ride->drop_address,
            'drop_lat' => $ride->drop_lat,
            'drop_lng' => $ride->drop_lng,
            'distance_km' => $ride->distance_km,
            'estimated_price' => $ride->estimated_fare,
            'payment_method' => $ride->payment_method,
            'notes' => $ride->notes . ' [Scheduled Ride]',
            'seats' => 1,
            'status' => 'driver_assigned',
            'scheduled_at' => $ride->scheduled_at,
        ]);
    }

    /**
     * Calculate distance using Haversine formula
     */
    protected function calculateDistance($lat1, $lng1, $lat2, $lng2): float
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
