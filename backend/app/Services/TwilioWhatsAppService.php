<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class TwilioWhatsAppService
{
    protected $client;
    protected $fromNumber;
    protected $verifySid;

    public function __construct()
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.whatsapp_from');
        $this->fromNumber = str_replace('whatsapp:', '', $from);
        $this->verifySid = config('services.twilio.verify_sid');

        if ($sid && $token) {
            $this->client = new Client($sid, $token);
        }
    }

    /**
     * Send OTP - uses Verify API if configured, falls back to WhatsApp messaging
     */
    public function sendOTP(string $phoneNumber, string $otp): array
    {
        try {
            $formattedNumber = $this->formatPhoneNumber($phoneNumber);

            if (!$this->client) {
                Log::warning("Twilio not configured. OTP could not be sent to {$formattedNumber}");
                return [
                    'success' => false,
                    'message' => 'SMS service not configured. Please contact support.',
                ];
            }

            // PRODUCTION: Use Twilio Verify API (sends SMS automatically)
            if ($this->verifySid) {
                return $this->sendViaVerifyAPI($formattedNumber);
            }

            // FALLBACK: Send via WhatsApp Messaging API
            return $this->sendViaWhatsApp($formattedNumber, $otp);

        } catch (\Exception $e) {
            Log::error("Failed to send OTP: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to send OTP: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send OTP via Twilio Verify API (Production - SMS to any number)
     * Twilio generates and sends the code automatically
     */
    protected function sendViaVerifyAPI(string $phoneNumber): array
    {
        $verification = $this->client->verify->v2
            ->services($this->verifySid)
            ->verifications
            ->create($phoneNumber, 'sms');

        Log::info("Verify OTP sent to {$phoneNumber}, Status: {$verification->status}");

        return [
            'success' => true,
            'message' => 'OTP sent via SMS',
            'verify_sid' => $verification->sid,
            'use_verify' => true,
        ];
    }

    /**
     * Verify OTP code via Twilio Verify API
     */
    public function verifyOTPCode(string $phoneNumber, string $code): array
    {
        try {
            if (!$this->client || !$this->verifySid) {
                return ['success' => false, 'message' => 'Verify service not configured'];
            }

            $formattedNumber = $this->formatPhoneNumber($phoneNumber);

            $check = $this->client->verify->v2
                ->services($this->verifySid)
                ->verificationChecks
                ->create([
                    'to' => $formattedNumber,
                    'code' => $code,
                ]);

            if ($check->status === 'approved') {
                return ['success' => true, 'message' => 'Code verified'];
            }

            return ['success' => false, 'message' => 'Invalid code'];

        } catch (\Exception $e) {
            Log::error("Verify check failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Verification failed'];
        }
    }

    /**
     * Check if Verify API is being used
     */
    public function isUsingVerifyAPI(): bool
    {
        return $this->client && $this->verifySid;
    }

    /**
     * Send OTP via WhatsApp Messaging API (Fallback/sandbox)
     */
    protected function sendViaWhatsApp(string $phoneNumber, string $otp): array
    {
        $message = $this->client->messages->create(
            "whatsapp:{$phoneNumber}",
            [
                'from' => "whatsapp:{$this->fromNumber}",
                'body' => $this->getOTPMessage($otp),
            ]
        );

        Log::info("WhatsApp OTP sent to {$phoneNumber}, SID: {$message->sid}");

        return [
            'success' => true,
            'message' => 'OTP sent via WhatsApp',
            'message_sid' => $message->sid,
        ];
    }

    /**
     * Format phone number for Pakistan
     */
    protected function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '+92' . substr($phone, 1);
        }

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
     * Get OTP message template (for WhatsApp fallback)
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
