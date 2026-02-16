<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Referral;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Support\Str;

class ReferralController extends Controller
{
    /**
     * Get user's referral code
     */
    public function getReferralCode(Request $request)
    {
        try {
            $user = $request->user();

            // Check if user already has a referral
            $referral = Referral::where('referrer_id', $user->id)->first();

            if (!$referral) {
                // Generate unique referral code
                $code = $this->generateUniqueCode();

                $referral = Referral::create([
                    'referrer_id' => $user->id,
                    'referral_code' => $code,
                    'referrer_reward' => 100, // Rs. 100 for referrer
                    'referred_reward' => 50,  // Rs. 50 for new user
                    'status' => 'pending',
                ]);
            }

            // Get referral stats
            $totalReferrals = Referral::where('referrer_id', $user->id)
                ->where('status', 'completed')
                ->count();

            $pendingReferrals = Referral::where('referrer_id', $user->id)
                ->where('status', 'pending')
                ->count();

            $totalEarnings = Referral::where('referrer_id', $user->id)
                ->where('status', 'completed')
                ->where('reward_claimed', true)
                ->sum('referrer_reward');

            return response()->json([
                'success' => true,
                'data' => [
                    'referral_code' => $referral->referral_code,
                    'referrer_reward' => (float) $referral->referrer_reward,
                    'referred_reward' => (float) $referral->referred_reward,
                    'stats' => [
                        'total_referrals' => $totalReferrals,
                        'pending_referrals' => $pendingReferrals,
                        'total_earnings' => (float) $totalEarnings,
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get referral code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Apply referral code during registration
     */
    public function applyReferralCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'referral_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // Check if user already used a referral code
            $existingReferral = Referral::where('referred_id', $user->id)->first();

            if ($existingReferral) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already used a referral code'
                ], 400);
            }

            // Find referral
            $referral = Referral::where('referral_code', strtoupper($request->referral_code))
                ->whereNull('referred_id')
                ->first();

            if (!$referral) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid referral code'
                ], 404);
            }

            // Check if user is referring themselves
            if ($referral->referrer_id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot use your own referral code'
                ], 400);
            }

            DB::beginTransaction();

            try {
                // Update referral
                $referral->referred_id = $user->id;
                $referral->save();

                // Give bonus to new user (referred)
                if ($user->driver) {
                    $wallet = Wallet::where('driver_id', $user->driver->id)->first();
                    
                    if ($wallet) {
                        $wallet->balance += $referral->referred_reward;
                        $wallet->save();

                        Transaction::create([
                            'wallet_id' => $wallet->id,
                            'type' => 'bonus',
                            'amount' => $referral->referred_reward,
                            'balance_after' => $wallet->balance,
                            'description' => 'Referral signup bonus',
                            'metadata' => [
                                'referral_id' => $referral->id,
                            ]
                        ]);
                    }
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => "Congratulations! You received Rs. {$referral->referred_reward} bonus",
                    'data' => [
                        'bonus_amount' => (float) $referral->referred_reward
                    ]
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to apply referral code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete referral (after first ride)
     */
    public function completeReferral($referredUserId)
    {
        try {
            $referral = Referral::where('referred_id', $referredUserId)
                ->where('status', 'pending')
                ->first();

            if (!$referral) {
                return;
            }

            DB::beginTransaction();

            try {
                // Mark as completed
                $referral->status = 'completed';
                $referral->completed_at = now();
                $referral->save();

                // Give reward to referrer
                $referrer = User::find($referral->referrer_id);
                
                if ($referrer && $referrer->driver) {
                    $wallet = Wallet::where('driver_id', $referrer->driver->id)->first();
                    
                    if ($wallet) {
                        $wallet->balance += $referral->referrer_reward;
                        $wallet->save();

                        Transaction::create([
                            'wallet_id' => $wallet->id,
                            'type' => 'bonus',
                            'amount' => $referral->referrer_reward,
                            'balance_after' => $wallet->balance,
                            'description' => 'Referral reward - friend completed first ride',
                            'metadata' => [
                                'referral_id' => $referral->id,
                            ]
                        ]);

                        $referral->reward_claimed = true;
                        $referral->save();
                    }
                }

                DB::commit();

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            \Log::error('Referral completion error: ' . $e->getMessage());
        }
    }

    /**
     * Get referral history
     */
    public function getReferralHistory(Request $request)
    {
        try {
            $user = $request->user();

            $referrals = Referral::where('referrer_id', $user->id)
                ->with('referred')
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => [
                    'referrals' => $referrals->items(),
                    'pagination' => [
                        'current_page' => $referrals->currentPage(),
                        'total_pages' => $referrals->lastPage(),
                        'total' => $referrals->total(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch referral history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate unique referral code
     */
    private function generateUniqueCode()
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (Referral::where('referral_code', $code)->exists());

        return $code;
    }
}