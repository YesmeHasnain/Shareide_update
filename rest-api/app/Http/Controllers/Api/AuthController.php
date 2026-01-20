<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PhoneVerification;
use App\Models\RiderProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Send verification code to phone
     */
    public function sendCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|regex:/^\+92[0-9]{10}$/',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid phone number format. Use +92XXXXXXXXXX',
                'errors' => $validator->errors(),
            ], 422);
        }

        $phone = $request->phone;

        // Generate 6-digit code
        $code = PhoneVerification::generateCode();

        // Delete old verifications for this phone
        PhoneVerification::where('phone', $phone)->delete();

        // Create new verification
        PhoneVerification::create([
            'phone' => $phone,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(10),
            'attempts' => 0,
            'verified_at' => null,
        ]);

        // Dev mode response (production me WhatsApp/SMS bhejna hoga)
        return response()->json([
            'success' => true,
            'message' => 'Verification code sent via WhatsApp (dev mode)',
            'debug_code' => $code,
        ]);
    }

    /**
     * Verify code and check if user exists
     * - If existing user: return token + user
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

        $phone = $request->phone;
        $code  = $request->code;

        // Find verification
        $verification = PhoneVerification::where('phone', $phone)
            ->where('code', $code)
            ->first();

        if (!$verification) {
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

        // Check if user exists
        $user = User::where('phone', $phone)->first();

        // If user does NOT exist -> new user flow
        if (!$user) {
            return response()->json([
                'success' => true,
                'is_new_user' => true,
                'verification_token' => $phone, // simple token; later hum secure kar sakte hain
                'message' => 'New user. Please complete registration.',
            ]);
        }

        // Existing user -> mark verification used and issue token
        $verification->update(['verified_at' => Carbon::now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'is_new_user' => false,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'avatar' => $user->riderProfile?->avatar_path,
                'gender' => $user->riderProfile?->gender,
            ],
        ]);
    }

    /**
     * Complete registration for new user and return token
     * Matches mobile app: /auth/complete-registration
     */
    public function completeRegistration(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
            'code'  => 'required|string|size:6',
            'name'  => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $phone = $request->phone;
        $code  = $request->code;
        $name  = $request->name;

        // Find verification (must be un-used)
        $verification = PhoneVerification::where('phone', $phone)
            ->where('code', $code)
            ->first();

        if (!$verification) {
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

        // If user already exists, treat as login (fallback safety)
        $user = User::where('phone', $phone)->first();

        if (!$user) {
            $user = User::create([
                'phone'  => $phone,
                'name'   => $name,
                'role'   => 'rider',
                'status' => 'active',
            ]);

            RiderProfile::create([
                'user_id'   => $user->id,
                'full_name' => $name,
            ]);
        } else {
            // update name if user exists
            $user->update(['name' => $name]);
            if ($user->riderProfile) {
                $user->riderProfile->update(['full_name' => $name]);
            }
        }

        // Mark verification used
        $verification->update(['verified_at' => Carbon::now()]);

        // Issue token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'avatar' => $user->riderProfile?->avatar_path,
                'gender' => $user->riderProfile?->gender,
            ],
        ]);
    }

    /**
     * Get current user
     */
    public function me(Request $request)
    {
        $user = $request->user();

        $userData = [
            'id' => (string) $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
        ];

        if ($user->riderProfile) {
            $userData['rider_profile'] = [
                'full_name' => $user->riderProfile->full_name,
                'avatar_path' => $user->riderProfile->avatar_path,
                'default_city' => $user->riderProfile->default_city,
            ];
        }

        if ($user->driver) {
            $userData['driver'] = [
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

        return response()->json([
            'success' => true,
            'user' => $userData,
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
