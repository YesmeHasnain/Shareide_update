<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Withdrawal;
use Carbon\Carbon;

class WalletController extends Controller
{
    /**
     * Get wallet balance and summary
     */
    public function getBalance(Request $request)
    {
        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $wallet = Wallet::where('driver_id', $driver->id)->first();

            if (!$wallet) {
                // Create wallet if doesn't exist
                $wallet = Wallet::create([
                    'driver_id' => $driver->id,
                    'balance' => 0,
                    'total_earned' => 0,
                    'total_withdrawn' => 0,
                    'pending_amount' => 0,
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'wallet' => $wallet
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch wallet balance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get transaction history
     */
    public function getTransactions(Request $request)
    {
        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $wallet = Wallet::where('driver_id', $driver->id)->first();

            if (!$wallet) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'transactions' => []
                    ]
                ], 200);
            }

            // Get pagination parameters
            $perPage = $request->get('per_page', 20);
            $page = $request->get('page', 1);

            $transactions = Transaction::where('wallet_id', $wallet->id)
                ->with('rideRequest')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'transactions' => $transactions->items(),
                    'pagination' => [
                        'current_page' => $transactions->currentPage(),
                        'total_pages' => $transactions->lastPage(),
                        'total' => $transactions->total(),
                        'per_page' => $transactions->perPage(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get earnings summary
     */
    public function getEarnings(Request $request)
    {
        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $wallet = Wallet::where('driver_id', $driver->id)->first();

            if (!$wallet) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'today' => 0,
                        'this_week' => 0,
                        'this_month' => 0,
                        'total_rides_today' => 0,
                        'total_rides_week' => 0,
                        'total_rides_month' => 0,
                    ]
                ], 200);
            }

            // Today's earnings
            $todayEarnings = Transaction::where('wallet_id', $wallet->id)
                ->where('type', 'earning')
                ->whereDate('created_at', Carbon::today())
                ->sum('amount');

            $todayRides = Transaction::where('wallet_id', $wallet->id)
                ->where('type', 'earning')
                ->whereDate('created_at', Carbon::today())
                ->count();

            // This week's earnings
            $weekEarnings = Transaction::where('wallet_id', $wallet->id)
                ->where('type', 'earning')
                ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
                ->sum('amount');

            $weekRides = Transaction::where('wallet_id', $wallet->id)
                ->where('type', 'earning')
                ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
                ->count();

            // This month's earnings
            $monthEarnings = Transaction::where('wallet_id', $wallet->id)
                ->where('type', 'earning')
                ->whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->sum('amount');

            $monthRides = Transaction::where('wallet_id', $wallet->id)
                ->where('type', 'earning')
                ->whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'today' => (float) $todayEarnings,
                    'this_week' => (float) $weekEarnings,
                    'this_month' => (float) $monthEarnings,
                    'total_rides_today' => $todayRides,
                    'total_rides_week' => $weekRides,
                    'total_rides_month' => $monthRides,
                    'average_per_ride_week' => $weekRides > 0 ? (float) ($weekEarnings / $weekRides) : 0,
                    'average_per_ride_month' => $monthRides > 0 ? (float) ($monthEarnings / $monthRides) : 0,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch earnings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request withdrawal
     */
    public function requestWithdrawal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:500',
            'method' => 'required|in:jazzcash,easypaisa,bank_transfer',
            'account_details' => 'required|array',
        ]);

        // Validate account details based on method
        if ($request->method === 'jazzcash' || $request->method === 'easypaisa') {
            $validator->addRules([
                'account_details.mobile' => 'required|string|regex:/^03[0-9]{9}$/',
            ]);
        } elseif ($request->method === 'bank_transfer') {
            $validator->addRules([
                'account_details.bank_name' => 'required|string',
                'account_details.account_title' => 'required|string',
                'account_details.iban' => 'required|string|size:24',
            ]);
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $wallet = Wallet::where('driver_id', $driver->id)->first();

            if (!$wallet) {
                return response()->json([
                    'success' => false,
                    'message' => 'Wallet not found'
                ], 404);
            }

            // Check minimum withdrawal amount
            $minAmount = $request->method === 'bank_transfer' ? 1000 : 500;
            if ($request->amount < $minAmount) {
                return response()->json([
                    'success' => false,
                    'message' => "Minimum withdrawal amount for {$request->method} is Rs. {$minAmount}"
                ], 400);
            }

            // Check if sufficient balance
            if ($wallet->balance < $request->amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient balance'
                ], 400);
            }

            DB::beginTransaction();

            try {
                // Create withdrawal request
                $withdrawal = Withdrawal::create([
                    'driver_id' => $driver->id,
                    'wallet_id' => $wallet->id,
                    'amount' => $request->amount,
                    'method' => $request->method,
                    'account_details' => $request->account_details,
                    'status' => 'pending',
                ]);

                // Update wallet
                $wallet->balance -= $request->amount;
                $wallet->pending_amount += $request->amount;
                $wallet->save();

                // Create transaction record
                Transaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => 'withdrawal',
                    'amount' => $request->amount,
                    'balance_after' => $wallet->balance,
                    'description' => 'Withdrawal request to ' . $request->method,
                    'metadata' => [
                        'withdrawal_id' => $withdrawal->id,
                        'method' => $request->method,
                    ]
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Withdrawal request submitted successfully. Processing time: 24-48 hours',
                    'data' => [
                        'withdrawal' => $withdrawal
                    ]
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process withdrawal request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get withdrawal history
     */
    public function getWithdrawals(Request $request)
    {
        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $withdrawals = Withdrawal::where('driver_id', $driver->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'withdrawals' => $withdrawals
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch withdrawals',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel withdrawal request (only if pending)
     */
    public function cancelWithdrawal(Request $request, $id)
    {
        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $withdrawal = Withdrawal::where('driver_id', $driver->id)
                ->where('id', $id)
                ->first();

            if (!$withdrawal) {
                return response()->json([
                    'success' => false,
                    'message' => 'Withdrawal request not found'
                ], 404);
            }

            if ($withdrawal->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending withdrawals can be cancelled'
                ], 400);
            }

            DB::beginTransaction();

            try {
                $wallet = $withdrawal->wallet;

                // Update withdrawal status
                $withdrawal->status = 'cancelled';
                $withdrawal->save();

                // Refund to wallet
                $wallet->balance += $withdrawal->amount;
                $wallet->pending_amount -= $withdrawal->amount;
                $wallet->save();

                // Create refund transaction
                Transaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => 'refund',
                    'amount' => $withdrawal->amount,
                    'balance_after' => $wallet->balance,
                    'description' => 'Withdrawal cancelled - refund',
                    'metadata' => [
                        'withdrawal_id' => $withdrawal->id,
                    ]
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Withdrawal cancelled successfully',
                    'data' => [
                        'withdrawal' => $withdrawal
                    ]
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel withdrawal',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}