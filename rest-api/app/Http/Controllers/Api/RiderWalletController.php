<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\RiderWallet;
use App\Models\RiderTransaction;
use App\Models\PaymentMethod;
use Carbon\Carbon;

class RiderWalletController extends Controller
{
    /**
     * Get wallet balance and summary
     */
    public function getBalance(Request $request)
    {
        try {
            $user = $request->user();

            $wallet = RiderWallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0, 'total_spent' => 0, 'total_topped_up' => 0]
            );

            // Get this month's stats
            $thisMonthSpent = RiderTransaction::where('user_id', $user->id)
                ->where('type', 'payment')
                ->whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->sum('amount');

            $totalRides = RiderTransaction::where('user_id', $user->id)
                ->where('type', 'payment')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'balance' => (float) $wallet->balance,
                    'total_spent' => (float) $wallet->total_spent,
                    'total_topped_up' => (float) $wallet->total_topped_up,
                    'this_month_spent' => (float) abs($thisMonthSpent),
                    'total_rides' => $totalRides,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch balance',
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
            $user = $request->user();

            $perPage = $request->get('per_page', 20);

            $transactions = RiderTransaction::where('user_id', $user->id)
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
     * Top up wallet
     */
    public function topUp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:100|max:50000',
            'method' => 'required|in:jazzcash,easypaisa,card',
            'payment_details' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            DB::beginTransaction();

            $wallet = RiderWallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0, 'total_spent' => 0, 'total_topped_up' => 0]
            );

            // Simulate payment processing (in production, integrate with actual payment gateway)
            $referenceId = 'TXN' . strtoupper(uniqid());

            // Update wallet
            $wallet->balance += $request->amount;
            $wallet->total_topped_up += $request->amount;
            $wallet->save();

            // Create transaction record
            RiderTransaction::create([
                'user_id' => $user->id,
                'type' => 'topup',
                'amount' => $request->amount,
                'balance_after' => $wallet->balance,
                'description' => 'Wallet top-up via ' . ucfirst($request->method),
                'reference_id' => $referenceId,
                'status' => 'completed',
                'metadata' => [
                    'method' => $request->method,
                    'payment_details' => $request->payment_details ?? [],
                ]
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Wallet topped up successfully',
                'data' => [
                    'new_balance' => (float) $wallet->balance,
                    'reference_id' => $referenceId,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process top-up',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment methods
     */
    public function getPaymentMethods(Request $request)
    {
        try {
            $user = $request->user();

            $methods = PaymentMethod::where('user_id', $user->id)
                ->orderBy('is_default', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            // Always include cash as an option
            $cashExists = $methods->where('type', 'cash')->first();
            if (!$cashExists) {
                $methods->prepend([
                    'id' => 0,
                    'type' => 'cash',
                    'label' => 'Cash',
                    'is_default' => $methods->isEmpty(),
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'methods' => $methods
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment methods',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add payment method
     */
    public function addPaymentMethod(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:card,jazzcash,easypaisa',
            'label' => 'required|string|max:50',
            'last_four' => 'required_if:type,card|string|size:4',
            'mobile_number' => 'required_if:type,jazzcash,easypaisa|string|regex:/^03[0-9]{9}$/',
            'details' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // Set as default if first method
            $isFirst = PaymentMethod::where('user_id', $user->id)->count() === 0;

            $method = PaymentMethod::create([
                'user_id' => $user->id,
                'type' => $request->type,
                'label' => $request->label,
                'last_four' => $request->last_four,
                'mobile_number' => $request->mobile_number,
                'details' => $request->details ?? [],
                'is_default' => $isFirst,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment method added successfully',
                'data' => [
                    'method' => $method
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add payment method',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set default payment method
     */
    public function setDefaultMethod(Request $request, $id)
    {
        try {
            $user = $request->user();

            // Unset all defaults
            PaymentMethod::where('user_id', $user->id)
                ->update(['is_default' => false]);

            // Set new default
            $method = PaymentMethod::where('user_id', $user->id)
                ->where('id', $id)
                ->firstOrFail();

            $method->is_default = true;
            $method->save();

            return response()->json([
                'success' => true,
                'message' => 'Default payment method updated'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update default method',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete payment method
     */
    public function deletePaymentMethod(Request $request, $id)
    {
        try {
            $user = $request->user();

            $method = PaymentMethod::where('user_id', $user->id)
                ->where('id', $id)
                ->firstOrFail();

            if ($method->type === 'cash') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot remove cash payment method'
                ], 400);
            }

            $method->delete();

            return response()->json([
                'success' => true,
                'message' => 'Payment method removed successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove payment method',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
