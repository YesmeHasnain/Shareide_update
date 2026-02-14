<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Chat;
use App\Models\RideRequest;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

// Private chat channel - only participants can access
Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    $chat = Chat::find($chatId);

    if (!$chat) {
        return false;
    }

    // Check if user is part of this chat (driver_id stores user_id)
    $isRider = $chat->rider_id === $user->id;
    $isDriver = $chat->driver_id === $user->id;

    return $isRider || $isDriver;
});

// Private ride channel - only rider and driver can access
Broadcast::channel('ride.{rideId}', function ($user, $rideId) {
    $ride = RideRequest::find($rideId);

    if (!$ride) {
        return false;
    }

    // Check if user is rider or driver
    $isRider = $ride->rider_id === $user->id;
    $isDriver = $ride->driver_id === $user->id;

    return $isRider || $isDriver;
});

// Private user channel - for personal notifications
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Private driver channel - for driver-specific updates
Broadcast::channel('driver.{driverId}', function ($user, $driverId) {
    if (!$user->driver) {
        return false;
    }
    return (int) $user->driver->id === (int) $driverId;
});
