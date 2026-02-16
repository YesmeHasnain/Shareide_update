<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\RideRequest;
use App\Events\NewChatMessage;

class ChatController extends Controller
{
    /**
     * Get or Create chat for a ride
     */
    public function getChatByRide(Request $request, $rideId)
    {
        try {
            $user = $request->user();
            
            $ride = RideRequest::findOrFail($rideId);

            // Check if user is part of this ride
            $isRider = $ride->rider_id === $user->id;
            $isDriver = $ride->driver_id === $user->id;

            if (!$isRider && !$isDriver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this chat'
                ], 403);
            }

            // Get or create chat
            $chat = Chat::firstOrCreate(
                ['ride_request_id' => $ride->id],
                [
                    'rider_id' => $ride->rider_id,
                    'driver_id' => $ride->driver_id,
                    'status' => 'active',
                ]
            );

            // Load relationships
            $chat->load(['rider', 'driver', 'rideRequest']);

            // Reset unread count for current user
            if ($isRider) {
                $chat->unread_count_rider = 0;
            } else {
                $chat->unread_count_driver = 0;
            }
            $chat->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'chat' => $chat,
                    'other_user' => $isRider ? [
                        'id' => $chat->driver->id,
                        'name' => $chat->driver->name,
                        'role' => 'driver',
                    ] : [
                        'id' => $chat->rider->id,
                        'name' => $chat->rider->name,
                        'role' => 'rider',
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get chat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all messages in a chat
     */
    public function getMessages(Request $request, $chatId)
    {
        try {
            $user = $request->user();
            
            $chat = Chat::findOrFail($chatId);

            // Check if user is part of this chat
            $isRider = $chat->rider_id === $user->id;
            $isDriver = $chat->driver_id === $user->id;

            if (!$isRider && !$isDriver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this chat'
                ], 403);
            }

            // Get messages with pagination
            $perPage = $request->get('per_page', 50);
            $messages = ChatMessage::where('chat_id', $chatId)
                ->with('sender')
                ->orderBy('created_at', 'asc')
                ->paginate($perPage);

            // Mark messages as read
            ChatMessage::where('chat_id', $chatId)
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'messages' => $messages->items(),
                    'pagination' => [
                        'current_page' => $messages->currentPage(),
                        'total_pages' => $messages->lastPage(),
                        'total' => $messages->total(),
                        'per_page' => $messages->perPage(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send text message
     */
    public function sendMessage(Request $request, $chatId)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            
            $chat = Chat::findOrFail($chatId);

            // Check if chat is locked
            if ($chat->status === 'locked') {
                return response()->json([
                    'success' => false,
                    'message' => 'This chat is no longer active'
                ], 403);
            }

            // Check if user is part of this chat
            $isRider = $chat->rider_id === $user->id;
            $isDriver = $chat->driver_id === $user->id;

            if (!$isRider && !$isDriver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this chat'
                ], 403);
            }

            // Create message
            $message = ChatMessage::create([
                'chat_id' => $chatId,
                'sender_id' => $user->id,
                'sender_type' => $isRider ? 'rider' : 'driver',
                'type' => 'text',
                'message' => $request->message,
            ]);

            // Update chat last message
            $chat->last_message = $request->message;
            $chat->last_message_at = now();
            $chat->last_message_by = $user->id;

            // Increment unread count for receiver
            if ($isRider) {
                $chat->unread_count_driver += 1;
            } else {
                $chat->unread_count_rider += 1;
            }

            $chat->save();

            $message->load('sender');

            // 🔥 BROADCAST REAL-TIME MESSAGE
            broadcast(new NewChatMessage($message))->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => [
                    'message' => $message
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send image message
     */
    public function sendImage(Request $request, $chatId)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            
            $chat = Chat::findOrFail($chatId);

            // Check if chat is locked
            if ($chat->status === 'locked') {
                return response()->json([
                    'success' => false,
                    'message' => 'This chat is no longer active'
                ], 403);
            }

            // Check if user is part of this chat
            $isRider = $chat->rider_id === $user->id;
            $isDriver = $chat->driver_id === $user->id;

            if (!$isRider && !$isDriver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this chat'
                ], 403);
            }

            // Upload image
            $imagePath = $request->file('image')->store('chat-images/' . $chatId, 'public');
            $imageUrl = Storage::url($imagePath);

            // Create message
            $message = ChatMessage::create([
                'chat_id' => $chatId,
                'sender_id' => $user->id,
                'sender_type' => $isRider ? 'rider' : 'driver',
                'type' => 'image',
                'image_url' => $imageUrl,
            ]);

            // Update chat last message
            $chat->last_message = '📷 Image';
            $chat->last_message_at = now();
            $chat->last_message_by = $user->id;

            // Increment unread count for receiver
            if ($isRider) {
                $chat->unread_count_driver += 1;
            } else {
                $chat->unread_count_rider += 1;
            }

            $chat->save();

            $message->load('sender');

            // 🔥 BROADCAST REAL-TIME MESSAGE
            broadcast(new NewChatMessage($message))->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'Image sent successfully',
                'data' => [
                    'message' => $message
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send voice message
     */
    public function sendVoice(Request $request, $chatId)
    {
        $validator = Validator::make($request->all(), [
            'voice' => 'required|file|mimes:mp3,wav,m4a,aac,ogg|max:10240',
            'duration' => 'nullable|integer|min:1|max:300',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            $chat = Chat::findOrFail($chatId);

            // Check if chat is locked
            if ($chat->status === 'locked') {
                return response()->json([
                    'success' => false,
                    'message' => 'This chat is no longer active'
                ], 403);
            }

            // Check if user is part of this chat
            $isRider = $chat->rider_id === $user->id;
            $isDriver = $chat->driver_id === $user->id;

            if (!$isRider && !$isDriver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this chat'
                ], 403);
            }

            // Upload voice file
            $voicePath = $request->file('voice')->store('chat-voice/' . $chatId, 'public');
            $voiceUrl = Storage::url($voicePath);

            // Create message
            $message = ChatMessage::create([
                'chat_id' => $chatId,
                'sender_id' => $user->id,
                'sender_type' => $isRider ? 'rider' : 'driver',
                'type' => 'voice',
                'media_url' => $voiceUrl,
                'media_duration' => $request->duration,
            ]);

            // Update chat last message
            $chat->last_message = 'Voice message';
            $chat->last_message_at = now();
            $chat->last_message_by = $user->id;

            // Increment unread count for receiver
            if ($isRider) {
                $chat->unread_count_driver += 1;
            } else {
                $chat->unread_count_rider += 1;
            }

            $chat->save();

            $message->load('sender');

            // Broadcast real-time message
            broadcast(new NewChatMessage($message))->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'Voice message sent successfully',
                'data' => [
                    'message' => $message
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send voice message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request, $chatId)
    {
        try {
            $user = $request->user();

            $chat = Chat::findOrFail($chatId);

            // Check if user is part of this chat
            $isRider = $chat->rider_id === $user->id;
            $isDriver = $chat->driver_id === $user->id;

            if (!$isRider && !$isDriver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this chat'
                ], 403);
            }

            // Mark all messages from other user as read
            $updated = ChatMessage::where('chat_id', $chatId)
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now()
                ]);

            // Reset unread count
            if ($isRider) {
                $chat->unread_count_rider = 0;
            } else {
                $chat->unread_count_driver = 0;
            }
            $chat->save();

            return response()->json([
                'success' => true,
                'message' => 'Messages marked as read',
                'data' => ['updated_count' => $updated]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark messages as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all active chats for user
     */
    public function getMyChats(Request $request)
    {
        try {
            $user = $request->user();

            $chats = Chat::where(function($query) use ($user) {
                $query->where('rider_id', $user->id);
                
                $query->orWhere('driver_id', $user->id);
            })
            ->with(['rider', 'driver', 'rideRequest'])
            ->orderBy('last_message_at', 'desc')
            ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'chats' => $chats
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get chats',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}