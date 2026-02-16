<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\RideRequest;

class RideStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ride;

    public function __construct(RideRequest $ride)
    {
        $this->ride = $ride->load(['rider', 'driver']);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('ride.' . $this->ride->id),
            new PrivateChannel('user.' . $this->ride->rider_id), // Rider's private channel
            new Channel('rides'), // For admin panel
        ];

        // If driver assigned, broadcast to driver too
        if ($this->ride->driver_id) {
            $channels[] = new PrivateChannel('user.' . $this->ride->driver_id);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'ride.status.changed';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'ride_id' => $this->ride->id,
            'status' => $this->ride->status,
            'rider_id' => $this->ride->rider_id,
            'driver_id' => $this->ride->driver_id,
            'pickup_address' => $this->ride->pickup_address,
            'drop_address' => $this->ride->drop_address,
            'pickup_lat' => $this->ride->pickup_lat,
            'pickup_lng' => $this->ride->pickup_lng,
            'drop_lat' => $this->ride->drop_lat,
            'drop_lng' => $this->ride->drop_lng,
            'estimated_price' => $this->ride->estimated_price,
            'driver' => $this->ride->driver ? [
                'id' => $this->ride->driver->id,
                'name' => $this->ride->driver->name,
                'phone' => $this->ride->driver->phone,
            ] : null,
        ];
    }
}
