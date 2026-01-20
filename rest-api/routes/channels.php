<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Chat;

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
    
    // Check if user is part of this chat
    $isRider = $chat->rider_id === $user->id;
    $isDriver = $user->driver && $chat->driver_id === $user->driver->id;
    
    return $isRider || $isDriver;
});