<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class TwilioWhatsAppService
{
    protected $client;
    protected $fromNumber;

    public function __construct()
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $this->fromNumber = config('services.twilio.whatsapp_from');

        if ($sid && $token) {
            $this->client = new Client($sid, $token);
        }
    }

    /**
     * Send OTP via WhatsApp
     */
    public function sendOTP(string $phoneNumber, string $otp): array
    {
        try {
            // Format phone number for WhatsApp (must include country code)
            $formattedNumber = $this->formatPhoneNumber($phoneNumber);

            if (!$this->client) {
                // Development mode - log OTP instead of sending
                Log::info("WhatsApp OTP for {$formattedNumber}: {$otp}");
                return [
                    'success' => true,
                    'message' => 'OTP sent (dev mode)',
                    'dev_otp' => $otp, // Only in dev
                ];
            }

            $message = $this->client->messages->create(
                "whatsapp:{$formattedNumber}",
                [
                    'from' => "whatsapp:{$this->fromNumber}",
                    'body' => $this->getOTPMessage($otp),
                ]
            );

            Log::info("WhatsApp OTP sent to {$formattedNumber}, SID: {$message->sid}");

            return [
                'success' => true,
                'message' => 'OTP sent successfully via WhatsApp',
                'message_sid' => $message->sid,
            ];

        } catch (\Exception $e) {
            Log::error("Failed to send WhatsApp OTP: " . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Failed to send OTP: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Format phone number for Pakistan
     */
    protected function formatPhoneNumber(string $phone): string
    {
        // Remove any spaces, dashes, or special characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // If starts with 0, replace with +92
        if (str_starts_with($phone, '0')) {
            $phone = '+92' . substr($phone, 1);
        }

        // If doesn't start with +, add +92
        if (!str_starts_with($phone, '+')) {
            if (str_starts_with($phone, '92')) {
                $phone = '+' . $phone;
            } else {
                $phone = '+92' . $phone;
            }
        }

        return $phone;
    }

    /**
     * Get OTP message template
     */
    protected function getOTPMessage(string $otp): string
    {
        return "🚗 *SHAREIDE*\n\n" .
               "Your verification code is: *{$otp}*\n\n" .
               "This code will expire in 5 minutes.\n\n" .
               "If you didn't request this code, please ignore this message.";
    }

    /**
     * Send ride notification via WhatsApp
     */
    public function sendRideNotification(string $phoneNumber, array $rideDetails): array
    {
        try {
            $formattedNumber = $this->formatPhoneNumber($phoneNumber);

            if (!$this->client) {
                Log::info("WhatsApp notification for {$formattedNumber}: " . json_encode($rideDetails));
                return ['success' => true, 'message' => 'Notification sent (dev mode)'];
            }

            $message = $this->client->messages->create(
                "whatsapp:{$formattedNumber}",
                [
                    'from' => "whatsapp:{$this->fromNumber}",
                    'body' => $this->getRideNotificationMessage($rideDetails),
                ]
            );

            return [
                'success' => true,
                'message_sid' => $message->sid,
            ];

        } catch (\Exception $e) {
            Log::error("Failed to send WhatsApp notification: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Get ride notification message
     */
    protected function getRideNotificationMessage(array $details): string
    {
        $type = $details['type'] ?? 'update';

        switch ($type) {
            case 'driver_assigned':
                return "🚗 *SHAREIDE - Driver Assigned!*\n\n" .
                       "Driver: {$details['driver_name']}\n" .
                       "Vehicle: {$details['vehicle']}\n" .
                       "Plate: {$details['plate_number']}\n" .
                       "ETA: {$details['eta']} minutes\n\n" .
                       "Track your ride in the app!";

            case 'driver_arrived':
                return "🚗 *SHAREIDE*\n\n" .
                       "Your driver has arrived!\n" .
                       "Please proceed to the pickup point.";

            case 'ride_completed':
                return "🚗 *SHAREIDE - Ride Completed*\n\n" .
                       "Fare: Rs. {$details['fare']}\n" .
                       "Distance: {$details['distance']} km\n\n" .
                       "Thank you for riding with SHAREIDE! 🙏";

            default:
                return "🚗 *SHAREIDE*\n\n{$details['message']}";
        }
    }
}
