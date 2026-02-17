<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PhoneVerification;
use App\Models\RiderProfile;
use App\Models\RiderWallet;
use App\Services\TwilioWhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AuthController extends Controller
{
    protected $whatsappService;

    public function __construct(TwilioWhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Send verification code to phone via WhatsApp
     */
    public function sendCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => ['required', 'string', 'regex:/^(\+?92|0)?3[0-9]{9}$/'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid phone number format. Use 03XXXXXXXXX or +923XXXXXXXXX',
                'errors' => $validator->errors(),
            ], 422);
        }

        $phone = $this->formatPhoneNumber($request->phone);

        // Check if user exists (for frontend to know)
        $existingUser = User::where('phone', $phone)->first();

        // Generate 6-digit code
        $code = PhoneVerification::generateCode();

        // Delete old verifications for this phone
        PhoneVerification::where('phone', $phone)->delete();

        // Create new verification
        PhoneVerification::create([
            'phone' => $phone,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(5),
            'attempts' => 0,
            'verified_at' => null,
        ]);

        // Send OTP via Twilio (Verify API for SMS, or WhatsApp fallback)
        $result = $this->whatsappService->sendOTP($phone, $code);

        if (!$result['success'] && !isset($result['dev_otp'])) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP. Please try again.',
            ], 500);
        }

        $response = [
            'success' => true,
            'message' => isset($result['use_verify']) ? 'Verification code sent via SMS' : 'Verification code sent via WhatsApp',
            'is_existing_user' => $existingUser !== null,
        ];

        return response()->json($response);
    }

    /**
     * Format phone number to +92 format
     */
    private function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '92' . substr($phone, 1);
        }

        if (!str_starts_with($phone, '92')) {
            $phone = '92' . $phone;
        }

        return '+' . $phone;
    }

    /**
     * Verify code and check if user exists
     * - If existing user with complete profile: return token + user (go to Home)
     * - If existing user with incomplete profile: return token + needs_profile_setup
     * - If new user: return is_new_user true (no token yet)
     */
    public function verifyCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $phone = $this->formatPhoneNumber($request->phone);
        $code  = $request->code;

        // If using Twilio Verify API, let Twilio check the code
        if ($this->whatsappService->isUsingVerifyAPI()) {
            $verifyResult = $this->whatsappService->verifyOTPCode($phone, $code);
            if (!$verifyResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid verification code',
                ], 401);
            }
            // Twilio verified - DON'T mark local record yet (completeRegistration will do it for new users)
            $verification = PhoneVerification::where('phone', $phone)->first();
        } else {
            // Local verification (WhatsApp)
            $verification = PhoneVerification::where('phone', $phone)->first();

            if (!$verification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid verification code',
                ], 401);
            }

            if ($verification->code !== $code) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid verification code',
                ], 401);
            }

            if ($verification->isExpired()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Verification code has expired',
                ], 401);
            }

            if ($verification->isVerified()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Code already used',
                ], 401);
            }
        }

        // Check if user exists - eager load driver for driver app
        $user = User::with('driver')->where('phone', $phone)->first();

        // If user does NOT exist -> new user flow (go to Gender -> Profile Setup)
        if (!$user) {
            return response()->json([
                'success' => true,
                'is_new_user' => true,
                'needs_profile_setup' => true,
                'verification_token' => base64_encode($phone . ':' . $code),
                'message' => 'New user. Please complete registration.',
            ]);
        }

        // Existing user -> mark verification used and issue token
        if ($verification) {
            $verification->update(['verified_at' => Carbon::now()]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Check if profile is complete
        $isProfileComplete = $user->riderProfile && $user->riderProfile->full_name && $user->riderProfile->gender;

        // Create wallet if not exists
        RiderWallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'total_spent' => 0, 'total_topped_up' => 0]
        );

        // Reload relationships for complete data
        $user->load(['riderProfile', 'riderWallet', 'driver']);

        return response()->json([
            'success' => true,
            'is_new_user' => false,
            'needs_profile_setup' => !$isProfileComplete,
            'message' => $isProfileComplete ? 'Login successful' : 'Please complete your profile',
            'token' => $token,
            'user' => $this->buildUserData($user),
        ]);
    }

    /**
     * Complete registration for new user and return token
     * Matches mobile app: /auth/complete-registration
     */
    public function completeRegistration(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'verification_token' => 'required|string',
            'name'  => 'required|string|max:255',
            'gender' => 'required|in:male,female,other',
            'email' => 'nullable|email|unique:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Decode verification token
        $decoded = base64_decode($request->verification_token);
        $parts = explode(':', $decoded);

        if (count($parts) !== 2) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification token',
            ], 401);
        }

        $phone = $parts[0];
        $code = $parts[1];

        // Find verification by phone (Twilio Verify uses its own codes, so we match by phone only)
        $verification = PhoneVerification::where('phone', $phone)
            ->latest()
            ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code',
            ], 401);
        }

        // For non-Verify API flow, also check the code matches
        if (!$this->whatsappService->isUsingVerifyAPI() && $verification->code !== $code) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code',
            ], 401);
        }

        if ($verification->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'Verification code has expired. Please request a new one.',
            ], 401);
        }

        if ($verification->isVerified()) {
            return response()->json([
                'success' => false,
                'message' => 'Code already used',
            ], 401);
        }

        // If user already exists, update profile
        $user = User::where('phone', $phone)->first();

        if (!$user) {
            $user = User::create([
                'phone'  => $phone,
                'name'   => $request->name,
                'email'  => $request->email,
                'role'   => 'rider',
                'status' => 'active',
            ]);

            RiderProfile::create([
                'user_id'   => $user->id,
                'full_name' => $request->name,
                'gender'    => $request->gender,
            ]);

            // Create wallet for new user
            RiderWallet::create([
                'user_id' => $user->id,
                'balance' => 0,
                'total_spent' => 0,
                'total_topped_up' => 0,
            ]);
        } else {
            // Update existing user profile
            $user->update([
                'name' => $request->name,
                'email' => $request->email ?? $user->email,
            ]);

            if ($user->riderProfile) {
                $user->riderProfile->update([
                    'full_name' => $request->name,
                    'gender' => $request->gender,
                ]);
            } else {
                RiderProfile::create([
                    'user_id'   => $user->id,
                    'full_name' => $request->name,
                    'gender'    => $request->gender,
                ]);
            }

            // Ensure wallet exists
            RiderWallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0, 'total_spent' => 0, 'total_topped_up' => 0]
            );
        }

        // Mark verification used
        $verification->update(['verified_at' => Carbon::now()]);

        // Issue token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Reload relationships for complete data
        $user->load(['riderProfile', 'riderWallet', 'driver']);

        return response()->json([
            'success' => true,
            'message' => 'Registration completed successfully',
            'token' => $token,
            'user' => $this->buildUserData($user),
        ]);
    }

    /**
     * Build complete user data array for API responses
     */
    private function buildUserData(User $user): array
    {
        $profile = $user->riderProfile;
        $wallet = $user->riderWallet;

        $userData = [
            'id' => (string) $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'email' => $user->email,
            'avatar' => $profile?->avatar_path ? url('storage/' . $profile->avatar_path) : null,
            'gender' => $profile?->gender,
            'rating' => (float) ($user->rating ?? 5.0),
            'total_rides' => (int) ($user->total_rides ?? 0),
            'loyalty_points' => (int) ($user->available_loyalty_points ?? 0),
            'wallet_balance' => (float) ($wallet?->balance ?? 0),
            'profile_complete' => $profile && $profile->full_name && $profile->gender,
        ];

        // Include driver info if user is a driver (for shareide_fleet app)
        if ($user->driver) {
            $userData['driver'] = [
                'id' => (string) $user->driver->id,
                'vehicle_type' => $user->driver->vehicle_type,
                'vehicle_model' => $user->driver->vehicle_model,
                'plate_number' => $user->driver->plate_number,
                'seats' => $user->driver->seats,
                'city' => $user->driver->city,
                'status' => $user->driver->status,
                'is_online' => $user->driver->is_online,
                'rating_average' => $user->driver->rating_average,
                'completed_rides_count' => $user->driver->completed_rides_count,
            ];
        }

        return $userData;
    }

    /**
     * Get current user
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load(['riderProfile', 'riderWallet', 'driver']);

        return response()->json([
            'success' => true,
            'user' => $this->buildUserData($user),
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }
}
