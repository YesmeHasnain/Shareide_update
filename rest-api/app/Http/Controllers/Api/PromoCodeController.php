<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\PromoCode;
use App\Models\PromoCodeUsage;

class PromoCodeController extends Controller
{
    /**
     * Validate promo code
     */
    public function validateCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'ride_amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            $code = strtoupper($request->code);

            // Find promo code
            $promoCode = PromoCode::where('code', $code)->first();

            if (!$promoCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid promo code'
                ], 404);
            }

            // Check if valid
            if (!$promoCode->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This promo code has expired or is no longer valid'
                ], 400);
            }

            // Check user eligibility
            if ($promoCode->user_type === 'new') {
                $userRidesCount = \App\Models\RideRequest::where('user_id', $user->id)
                    ->where('status', 'completed')
                    ->count();
                
                if ($userRidesCount > 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This promo code is only for new users'
                    ], 400);
                }
            }

            // Check per-user usage limit
            $userUsageCount = PromoCodeUsage::where('promo_code_id', $promoCode->id)
                ->where('user_id', $user->id)
                ->count();

            if ($userUsageCount >= $promoCode->per_user_limit) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already used this promo code the maximum number of times'
                ], 400);
            }

            // Calculate discount
            $discount = $promoCode->calculateDiscount($request->ride_amount);

            if ($discount <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Minimum ride amount of Rs. {$promoCode->min_ride_amount} required"
                ], 400);
            }

            $finalAmount = max(0, $request->ride_amount - $discount);

            return response()->json([
                'success' => true,
                'message' => 'Promo code is valid',
                'data' => [
                    'promo_code' => $promoCode,
                    'original_amount' => (float) $request->ride_amount,
                    'discount_amount' => (float) $discount,
                    'final_amount' => (float) $finalAmount,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate promo code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Apply promo code to ride
     */
    public function applyPromoCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'ride_id' => 'required|exists:ride_requests,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            $code = strtoupper($request->code);

            $ride = \App\Models\RideRequest::findOrFail($request->ride_id);

            // Check ownership
            if ($ride->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Find promo code
            $promoCode = PromoCode::where('code', $code)->first();

            if (!$promoCode || !$promoCode->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired promo code'
                ], 400);
            }

            // Calculate discount
            $discount = $promoCode->calculateDiscount($ride->fare);
            $finalAmount = max(0, $ride->fare - $discount);

            // Record usage
            PromoCodeUsage::create([
                'promo_code_id' => $promoCode->id,
                'user_id' => $user->id,
                'ride_request_id' => $ride->id,
                'original_amount' => $ride->fare,
                'discount_amount' => $discount,
                'final_amount' => $finalAmount,
            ]);

            // Update promo code usage count
            $promoCode->increment('times_used');

            // Update ride fare
            $ride->fare = $finalAmount;
            $ride->save();

            return response()->json([
                'success' => true,
                'message' => 'Promo code applied successfully',
                'data' => [
                    'original_amount' => (float) ($ride->fare + $discount),
                    'discount_amount' => (float) $discount,
                    'final_amount' => (float) $finalAmount,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to apply promo code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's promo code usage history
     */
    public function getUsageHistory(Request $request)
    {
        try {
            $user = $request->user();

            $usage = PromoCodeUsage::where('user_id', $user->id)
                ->with(['promoCode', 'rideRequest'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => [
                    'usage' => $usage->items(),
                    'pagination' => [
                        'current_page' => $usage->currentPage(),
                        'total_pages' => $usage->lastPage(),
                        'total' => $usage->total(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch usage history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active promo codes
     */
    public function getActivePromoCodes(Request $request)
    {
        try {
            $user = $request->user();

            $promoCodes = PromoCode::where('is_active', true)
                ->where(function($query) {
                    $query->whereNull('valid_until')
                        ->orWhere('valid_until', '>=', now());
                })
                ->get()
                ->filter(function($promo) use ($user) {
                    // Check user eligibility
                    if ($promo->user_type === 'new') {
                        $ridesCount = \App\Models\RideRequest::where('user_id', $user->id)
                            ->where('status', 'completed')
                            ->count();
                        return $ridesCount === 0;
                    }
                    return true;
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'promo_codes' => $promoCodes->values()
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch promo codes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}