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

class DriverStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $driver;
    public $isOnline;

    public function __construct(Driver $driver)
    {
        $this->driver = $driver;
        $this->isOnline = $driver->is_online;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('drivers'), // Public channel for admin panel
            new PrivateChannel('driver.' . $this->driver->id), // Private channel for specific driver
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'driver.status.changed';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'driver_id' => $this->driver->id,
            'user_id' => $this->driver->user_id,
            'is_online' => $this->driver->is_online,
            'current_lat' => $this->driver->current_lat,
            'current_lng' => $this->driver->current_lng,
            'vehicle_type' => $this->driver->vehicle_type,
            'name' => $this->driver->user?->name,
        ];
    }
}
