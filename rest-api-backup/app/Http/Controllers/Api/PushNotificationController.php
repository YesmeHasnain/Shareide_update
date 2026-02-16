<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use App\Models\PushNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PushNotificationController extends Controller
{
    public function registerDevice(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'platform' => 'required|in:ios,android,web',
            'device_name' => 'nullable|string|max:255',
        ]);

        $deviceToken = DeviceToken::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'token' => $request->token,
            ],
            [
                'platform' => $request->platform,
                'device_name' => $request->device_name,
                'is_active' => true,
                'last_used_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Device registered successfully',
            'data' => $deviceToken,
        ]);
    }

    public function unregisterDevice(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        DeviceToken::where('user_id', auth()->id())
            ->where('token', $request->token)
            ->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Device unregistered successfully',
        ]);
    }

    public function getNotifications(Request $request)
    {
        $notifications = PushNotification::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    public function markAsRead($id)
    {
        $notification = PushNotification::where('user_id', auth()->id())
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    public function markAllAsRead()
    {
        PushNotification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }

    public function getUnreadCount()
    {
        $count = PushNotification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success' => true,
            'data' => ['unread_count' => $count],
        ]);
    }

    public static function sendToUser($userId, string $title, string $body, array $data = [], string $type = 'general')
    {
        // Save notification to database
        $notification = PushNotification::create([
            'user_id' => $userId,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'type' => $type,
        ]);

        // Get user's active device tokens
        $tokens = DeviceToken::where('user_id', $userId)
            ->where('is_active', true)
            ->pluck('token')
            ->toArray();

        if (empty($tokens)) {
            return $notification;
        }

        // Separate Expo tokens from FCM tokens
        $expoTokens = array_filter($tokens, fn($t) => str_starts_with($t, 'ExponentPushToken'));
        $fcmTokens = array_filter($tokens, fn($t) => !str_starts_with($t, 'ExponentPushToken'));

        if (!empty($expoTokens)) {
            self::sendExpo(array_values($expoTokens), $title, $body, $data);
        }
        if (!empty($fcmTokens)) {
            self::sendFCM(array_values($fcmTokens), $title, $body, $data);
        }

        return $notification;
    }

    private static function sendExpo(array $tokens, string $title, string $body, array $data = [])
    {
        $messages = array_map(fn($token) => [
            'to' => $token,
            'sound' => 'default',
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'channelId' => $data['channel'] ?? 'default',
        ], $tokens);

        try {
            Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post('https://exp.host/--/api/v2/push/send', $messages);
        } catch (\Exception $e) {
            \Log::error('Expo push notification error: ' . $e->getMessage());
        }
    }

    private static function sendFCM(array $tokens, string $title, string $body, array $data = [])
    {
        $serverKey = config('services.firebase.server_key');

        if (!$serverKey) {
            return;
        }

        foreach ($tokens as $token) {
            try {
                Http::withHeaders([
                    'Authorization' => 'key=' . $serverKey,
                    'Content-Type' => 'application/json',
                ])->post('https://fcm.googleapis.com/fcm/send', [
                    'to' => $token,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                        'sound' => 'default',
                    ],
                    'data' => $data,
                ]);
            } catch (\Exception $e) {
                \Log::error('FCM push notification error: ' . $e->getMessage());
            }
        }
    }
}
