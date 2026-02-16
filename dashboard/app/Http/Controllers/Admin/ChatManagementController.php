<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Chat;
use App\Models\ChatMessage;

class ChatManagementController extends Controller
{
    /**
     * Get all chats with filters
     */
    public function getAllChats(Request $request)
    {
        try {
            $query = Chat::with(['rider', 'driver.user', 'rideRequest'])
                ->orderBy('last_message_at', 'desc');

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by date
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Search by user name
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('rider', function($subQ) use ($search) {
                        $subQ->where('name', 'like', "%{$search}%")
                             ->orWhere('phone', 'like', "%{$search}%");
                    })->orWhereHas('driver.user', function($subQ) use ($search) {
                        $subQ->where('name', 'like', "%{$search}%")
                             ->orWhere('phone', 'like', "%{$search}%");
                    });
                });
            }

            $perPage = $request->get('per_page', 20);
            $chats = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'chats' => $chats->items(),
                    'pagination' => [
                        'current_page' => $chats->currentPage(),
                        'total_pages' => $chats->lastPage(),
                        'total' => $chats->total(),
                        'per_page' => $chats->perPage(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch chats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single chat details with all messages (Admin can see everything including phone numbers)
     */
    public function getChatDetails(Request $request, $chatId)
    {
        try {
            $chat = Chat::with(['rider', 'driver.user', 'rideRequest'])
                ->findOrFail($chatId);

            $messages = ChatMessage::where('chat_id', $chatId)
                ->with('sender')
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'chat' => $chat,
                    'messages' => $messages,
                    'participants' => [
                        'rider' => [
                            'id' => $chat->rider->id,
                            'name' => $chat->rider->name,
                            'phone' => $chat->rider->phone, // Admin can see phone
                            'email' => $chat->rider->email,
                        ],
                        'driver' => [
                            'id' => $chat->driver->user->id,
                            'name' => $chat->driver->user->name,
                            'phone' => $chat->driver->user->phone, // Admin can see phone
                            'email' => $chat->driver->user->email,
                            'cnic' => $chat->driver->cnic,
                        ]
                    ],
                    'ride_info' => [
                        'id' => $chat->rideRequest->id,
                        'pickup' => $chat->rideRequest->pickup_location,
                        'dropoff' => $chat->rideRequest->dropoff_location,
                        'status' => $chat->rideRequest->status,
                        'fare' => $chat->rideRequest->fare,
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch chat details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lock/Unlock chat (stop messaging)
     */
    public function toggleChatLock(Request $request, $chatId)
    {
        try {
            $chat = Chat::findOrFail($chatId);

            $chat->status = $chat->status === 'active' ? 'locked' : 'active';
            $chat->save();

            return response()->json([
                'success' => true,
                'message' => "Chat {$chat->status} successfully",
                'data' => [
                    'chat' => $chat
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle chat lock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete inappropriate messages
     */
    public function deleteMessage(Request $request, $messageId)
    {
        try {
            $message = ChatMessage::findOrFail($messageId);
            
            // If image, delete from storage
            if ($message->type === 'image' && $message->image_url) {
                $path = str_replace('/storage/', '', $message->image_url);
                Storage::disk('public')->delete($path);
            }

            $message->delete();

            return response()->json([
                'success' => true,
                'message' => 'Message deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get chat statistics
     */
    public function getChatStats(Request $request)
    {
        try {
            $totalChats = Chat::count();
            $activeChats = Chat::where('status', 'active')->count();
            $lockedChats = Chat::where('status', 'locked')->count();
            $totalMessages = ChatMessage::count();

            $todayMessages = ChatMessage::whereDate('created_at', today())->count();
            $todayChats = Chat::whereDate('created_at', today())->count();

            // This week stats
            $weekMessages = ChatMessage::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
            $weekChats = Chat::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();

            // Messages by type
            $textMessages = ChatMessage::where('type', 'text')->count();
            $imageMessages = ChatMessage::where('type', 'image')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_chats' => $totalChats,
                    'active_chats' => $activeChats,
                    'locked_chats' => $lockedChats,
                    'total_messages' => $totalMessages,
                    'today_messages' => $todayMessages,
                    'today_chats' => $todayChats,
                    'week_messages' => $weekMessages,
                    'week_chats' => $weekChats,
                    'text_messages' => $textMessages,
                    'image_messages' => $imageMessages,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export chat history as JSON
     */
    public function exportChatHistory(Request $request, $chatId)
    {
        try {
            $chat = Chat::with(['rider', 'driver.user', 'rideRequest'])->findOrFail($chatId);
            
            $messages = ChatMessage::where('chat_id', $chatId)
                ->with('sender')
                ->orderBy('created_at', 'asc')
                ->get();

            $export = [
                'chat_info' => [
                    'chat_id' => $chat->id,
                    'ride_id' => $chat->ride_request_id,
                    'rider' => [
                        'name' => $chat->rider->name,
                        'phone' => $chat->rider->phone,
                    ],
                    'driver' => [
                        'name' => $chat->driver->user->name,
                        'phone' => $chat->driver->user->phone,
                    ],
                    'created_at' => $chat->created_at->format('Y-m-d H:i:s'),
                    'status' => $chat->status,
                ],
                'messages' => $messages->map(function($msg) {
                    return [
                        'id' => $msg->id,
                        'sender' => $msg->sender->name,
                        'sender_type' => $msg->sender_type,
                        'type' => $msg->type,
                        'message' => $msg->message ?? 'Image',
                        'image_url' => $msg->image_url,
                        'timestamp' => $msg->created_at->format('Y-m-d H:i:s'),
                    ];
                }),
                'total_messages' => $messages->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $export
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export chat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search messages by keyword
     */
    public function searchMessages(Request $request)
    {
        try {
            $keyword = $request->get('keyword');
            
            if (!$keyword) {
                return response()->json([
                    'success' => false,
                    'message' => 'Keyword is required'
                ], 422);
            }

            $messages = ChatMessage::where('type', 'text')
                ->where('message', 'like', "%{$keyword}%")
                ->with(['sender', 'chat.rider', 'chat.driver.user'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => [
                    'messages' => $messages->items(),
                    'pagination' => [
                        'current_page' => $messages->currentPage(),
                        'total_pages' => $messages->lastPage(),
                        'total' => $messages->total(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}