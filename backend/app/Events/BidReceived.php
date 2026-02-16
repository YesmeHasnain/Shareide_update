<?php

namespace App\Events;

use App\Models\RideBid;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BidReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $bid;

    public function __construct(RideBid $bid)
    {
        $this->bid = $bid->load('driver');
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('ride.' . $this->bid->ride_request_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'bid.received';
    }

    public function broadcastWith(): array
    {
        return [
            'bid_id' => $this->bid->id,
            'ride_request_id' => $this->bid->ride_request_id,
            'driver_id' => $this->bid->driver_id,
            'bid_amount' => $this->bid->bid_amount,
            'eta_minutes' => $this->bid->eta_minutes,
            'note' => $this->bid->note,
            'status' => $this->bid->status,
            'expires_at' => $this->bid->expires_at?->toISOString(),
            'driver' => [
                'id' => $this->bid->driver->id,
                'name' => $this->bid->driver->name,
                'profile_photo' => $this->bid->driver->profile_photo,
            ],
        ];
    }
}
