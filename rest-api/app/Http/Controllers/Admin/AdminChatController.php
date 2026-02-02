<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\ChatMessage;
use Illuminate\Http\Request;

class AdminChatController extends Controller
{
    /**
     * List all chats
     */
    public function index(Request $request)
    {
        $query = Chat::with(['rider', 'driver.user', 'rideRequest']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search by user name or phone
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('rider', function ($rq) use ($search) {
                    $rq->where('name', 'like', '%' . $search . '%')
                        ->orWhere('phone', 'like', '%' . $search . '%');
                })
                ->orWhereHas('driver.user', function ($dq) use ($search) {
                    $dq->where('name', 'like', '%' . $search . '%')
                        ->orWhere('phone', 'like', '%' . $search . '%');
                });
            });
        }

        $chats = $query->latest('last_message_at')->paginate(20)->withQueryString();

        $stats = [
            'total' => Chat::count(),
            'active' => Chat::where('status', 'active')->count(),
            'locked' => Chat::where('status', 'locked')->count(),
            'total_messages' => ChatMessage::count(),
            'today_messages' => ChatMessage::whereDate('created_at', today())->count(),
        ];

        return view('admin.chats.index', compact('chats', 'stats'));
    }

    /**
     * Show chat details with all messages
     */
    public function show($id)
    {
        $chat = Chat::with([
            'rider.riderProfile',
            'driver.user',
            'rideRequest',
            'messages' => function ($q) {
                $q->orderBy('created_at', 'asc');
            },
            'messages.sender'
        ])->findOrFail($id);

        return view('admin.chats.show', compact('chat'));
    }

    /**
     * Lock/Unlock a chat
     */
    public function toggleLock($id)
    {
        $chat = Chat::findOrFail($id);
        $newStatus = $chat->status === 'active' ? 'locked' : 'active';
        $chat->update(['status' => $newStatus]);

        $message = $newStatus === 'locked' ? 'Chat locked successfully.' : 'Chat unlocked successfully.';
        return back()->with('success', $message);
    }

    /**
     * Delete a specific message
     */
    public function deleteMessage($chatId, $messageId)
    {
        $message = ChatMessage::where('chat_id', $chatId)->findOrFail($messageId);

        // Delete image if exists
        if ($message->type === 'image' && $message->image_url) {
            $path = str_replace('/storage/', '', $message->image_url);
            \Storage::disk('public')->delete($path);
        }

        $message->delete();

        return back()->with('success', 'Message deleted successfully.');
    }

    /**
     * Search messages across all chats
     */
    public function searchMessages(Request $request)
    {
        $request->validate(['keyword' => 'required|string|min:2']);

        $messages = ChatMessage::with(['chat.rider', 'chat.driver.user', 'sender'])
            ->where('type', 'text')
            ->where('message', 'like', '%' . $request->keyword . '%')
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return view('admin.chats.search', compact('messages'));
    }

    /**
     * Export chat history
     */
    public function export($id)
    {
        $chat = Chat::with(['rider', 'driver.user', 'rideRequest', 'messages.sender'])->findOrFail($id);

        $data = [
            'chat_id' => $chat->id,
            'ride_id' => $chat->ride_request_id,
            'rider' => [
                'name' => $chat->rider->name,
                'phone' => $chat->rider->phone,
            ],
            'driver' => [
                'name' => $chat->driver->user->name ?? 'N/A',
                'phone' => $chat->driver->user->phone ?? 'N/A',
            ],
            'status' => $chat->status,
            'messages' => $chat->messages->map(function ($msg) {
                return [
                    'sender' => $msg->sender->name ?? 'Unknown',
                    'sender_type' => $msg->sender_type,
                    'type' => $msg->type,
                    'message' => $msg->message,
                    'timestamp' => $msg->created_at->toISOString(),
                ];
            }),
            'exported_at' => now()->toISOString(),
            'exported_by' => auth()->user()->name,
        ];

        return response()->json($data)
            ->header('Content-Disposition', 'attachment; filename="chat_' . $id . '_export.json"');
    }
}
