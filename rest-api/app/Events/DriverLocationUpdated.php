<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Driver;

class DriverLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $driver;

    public function __construct(Driver $driver)
    {
        $this->driver = $driver;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [
            new Channel('drivers'), // For admin panel map
        ];

        // If driver has an active ride, broadcast to rider too
        $activeRide = $this->driver->user->ridesAsDriver()
            ->whereIn('status', ['driver_assigned', 'driver_arrived', 'in_progress'])
            ->first();

        if ($activeRide) {
            $channels[] = new PrivateChannel('ride.' . $activeRide->id);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'driver.location.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'driver_id' => $this->driver->id,
            'lat' => $this->driver->current_lat,
            'lng' => $this->driver->current_lng,
            'vehicle_type' => $this->driver->vehicle_type,
        ];
    }
}
