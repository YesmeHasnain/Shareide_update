<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\DeviceToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send push notification to user
     */
    public function sendToUser($userId, $title, $body, $type, $data = [])
    {
        try {
            // Save notification in database
            $notification = Notification::create([
                'user_id' => $userId,
                'title' => $title,
                'body' => $body,
                'type' => $type,
                'data' => $data,
            ]);

            // Get user's device tokens
            $tokens = DeviceToken::where('user_id', $userId)
                ->where('is_active', true)
                ->pluck('token')
                ->toArray();

            if (empty($tokens)) {
                Log::info("No device tokens for user {$userId}");
                return [
                    'success' => true,
                    'message' => 'Notification saved but no device tokens found'
                ];
            }

            // Try FCM first, fallback to OneSignal
            $result = $this->sendViaFCM($tokens, $title, $body, $data);
            
            if (!$result['success']) {
                $result = $this->sendViaOneSignal($tokens, $title, $body, $data);
            }

            if ($result['success']) {
                $notification->update([
                    'is_sent' => true,
                    'sent_at' => now(),
                ]);
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('Notification Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send via FCM (Firebase Cloud Messaging)
     */
    private function sendViaFCM($tokens, $title, $body, $data = [])
    {
        $fcmServerKey = env('FCM_SERVER_KEY');

        if (!$fcmServerKey) {
            return ['success' => false, 'message' => 'FCM not configured'];
        }

        $payload = [
            'registration_ids' => $tokens,
            'notification' => [
                'title' => $title,
                'body' => $body,
                'sound' => 'default',
                'badge' => '1',
            ],
            'data' => $data,
            'priority' => 'high',
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'key=' . $fcmServerKey,
                'Content-Type' => 'application/json',
            ])->post('https://fcm.googleapis.com/fcm/send', $payload);

            if ($response->successful()) {
                Log::info('FCM notification sent successfully');
                return ['success' => true, 'message' => 'Sent via FCM'];
            }

            Log::warning('FCM failed: ' . $response->body());
            return ['success' => false, 'message' => 'FCM request failed'];

        } catch (\Exception $e) {
            Log::error('FCM exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send via OneSignal (Alternative)
     */
    private function sendViaOneSignal($tokens, $title, $body, $data = [])
    {
        $appId = env('ONESIGNAL_APP_ID');
        $restApiKey = env('ONESIGNAL_REST_API_KEY');

        if (!$appId || !$restApiKey) {
            return ['success' => false, 'message' => 'OneSignal not configured'];
        }

        $payload = [
            'app_id' => $appId,
            'include_player_ids' => $tokens,
            'headings' => ['en' => $title],
            'contents' => ['en' => $body],
            'data' => $data,
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $restApiKey,
                'Content-Type' => 'application/json',
            ])->post('https://onesignal.com/api/v1/notifications', $payload);

            if ($response->successful()) {
                Log::info('OneSignal notification sent successfully');
                return ['success' => true, 'message' => 'Sent via OneSignal'];
            }

            Log::warning('OneSignal failed: ' . $response->body());
            return ['success' => false, 'message' => 'OneSignal request failed'];

        } catch (\Exception $e) {
            Log::error('OneSignal exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // ... rest of the methods remain same (notifyDriver, notifyRider, etc.)
    
    /**
     * Send notification to driver
     */
    public function notifyDriver($driverId, $title, $body, $type, $data = [])
    {
        $driver = \App\Models\Driver::find($driverId);
        if (!$driver) {
            return ['success' => false, 'message' => 'Driver not found'];
        }

        return $this->sendToUser($driver->user_id, $title, $body, $type, $data);
    }

    /**
     * Send notification to rider
     */
    public function notifyRider($riderId, $title, $body, $type, $data = [])
    {
        return $this->sendToUser($riderId, $title, $body, $type, $data);
    }

    /**
     * Notify about new ride request
     */
    public function notifyNewRideRequest($driverId, $rideId)
    {
        return $this->notifyDriver(
            $driverId,
            'New Ride Request! 🚗',
            'You have a new ride request matching your schedule',
            'ride_request',
            ['ride_id' => $rideId]
        );
    }

    /**
     * Notify rider - ride accepted
     */
    public function notifyRideAccepted($riderId, $rideId, $driverName)
    {
        return $this->notifyRider(
            $riderId,
            'Ride Accepted! ✅',
            "{$driverName} has accepted your ride request",
            'ride_accepted',
            ['ride_id' => $rideId]
        );
    }

    /**
     * Notify rider - ride started
     */
    public function notifyRideStarted($riderId, $rideId)
    {
        return $this->notifyRider(
            $riderId,
            'Ride Started! 🚗',
            'Your ride has started. Have a safe journey!',
            'ride_started',
            ['ride_id' => $rideId]
        );
    }

    /**
     * Notify rider - ride completed
     */
    public function notifyRideCompleted($riderId, $rideId, $fare)
    {
        return $this->notifyRider(
            $riderId,
            'Ride Completed! 🎉',
            "Your ride is complete. Fare: Rs. {$fare}",
            'ride_completed',
            ['ride_id' => $rideId]
        );
    }

    /**
     * Notify about ride cancellation
     */
    public function notifyRideCancelled($userId, $rideId, $cancelledBy)
    {
        return $this->sendToUser(
            $userId,
            'Ride Cancelled ❌',
            "Your ride has been cancelled by {$cancelledBy}",
            'ride_cancelled',
            ['ride_id' => $rideId]
        );
    }

    /**
     * Notify about new chat message
     */
    public function notifyNewMessage($userId, $senderName, $chatId)
    {
        return $this->sendToUser(
            $userId,
            "New message from {$senderName} 💬",
            'Tap to view message',
            'new_message',
            ['chat_id' => $chatId]
        );
    }

    /**
     * Notify driver - application approved
     */
    public function notifyDriverApproved($driverId)
    {
        return $this->notifyDriver(
            $driverId,
            'Congratulations! 🎉',
            'Your driver application has been approved. You can now start accepting rides!',
            'driver_approved',
            []
        );
    }

    /**
     * Notify driver - application rejected
     */
    public function notifyDriverRejected($driverId, $reason)
    {
        return $this->notifyDriver(
            $driverId,
            'Application Update ⚠️',
            "Your application was not approved. Reason: {$reason}",
            'driver_rejected',
            []
        );
    }

    /**
     * Notify about withdrawal approval
     */
    public function notifyWithdrawalApproved($driverId, $amount)
    {
        return $this->notifyDriver(
            $driverId,
            'Withdrawal Approved! 💰',
            "Your withdrawal of Rs. {$amount} has been approved and will be processed within 24-48 hours",
            'withdrawal_approved',
            []
        );
    }

    /**
     * Notify about withdrawal rejection
     */
    public function notifyWithdrawalRejected($driverId, $amount, $reason)
    {
        return $this->notifyDriver(
            $driverId,
            'Withdrawal Update ⚠️',
            "Your withdrawal request of Rs. {$amount} was rejected. Reason: {$reason}",
            'withdrawal_rejected',
            []
        );
    }

    /**
     * Notify about payment received
     */
    public function notifyPaymentReceived($driverId, $amount, $rideId)
    {
        return $this->notifyDriver(
            $driverId,
            'Payment Received! 💵',
            "You earned Rs. {$amount} from your recent ride",
            'payment_received',
            ['ride_id' => $rideId]
        );
    }

    /**
     * Notify about new rating
     */
    public function notifyNewRating($userId, $rating, $rideId)
    {
        $stars = str_repeat('⭐', $rating);
        return $this->sendToUser(
            $userId,
            'New Rating Received!',
            "You received {$stars} ({$rating}/5) rating",
            'rating_received',
            ['ride_id' => $rideId]
        );
    }
}