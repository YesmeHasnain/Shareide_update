<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\RiderWallet;
use App\Models\RiderTransaction;
use App\Models\PaymentMethod;
use App\Services\BankAlfalahService;
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

            $status = $request->get('status', 'completed');

            $query = RiderTransaction::where('user_id', $user->id);

            if ($status !== 'all') {
                $query->where('status', $status);
            }

            $transactions = $query->orderBy('created_at', 'desc')
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
     * Initiate wallet top-up
     *
     * Supported methods:
     * - card: Credit/Debit Card via Bank Alfalah (Page Redirection)
     * - alfa_wallet: Alfa Wallet via REST API (requires OTP)
     * - bank_account: Alfalah Bank Account via REST API (requires OTP)
     * - jazzcash, easypaisa: Mobile wallets (not implemented yet)
     */
    public function topUp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:100|max:50000',
            'method' => 'required|in:jazzcash,easypaisa,card,bank_alfalah,alfa_wallet,bank_account',
            // Required for Alfa Wallet / Bank Account
            'account_number' => 'required_if:method,alfa_wallet,bank_account|string',
            'email' => 'sometimes|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // Generate unique order ID
            $orderId = 'TOPUP-' . $user->id . '-' . time();

            // For Alfa Wallet payment (REST API with OTP)
            if ($request->method === 'alfa_wallet') {
                $bankAlfalah = new BankAlfalahService();

                // Get user details for notification
                $email = $request->email ?? $user->email ?? 'noreply@shareide.com';
                $mobile = $request->account_number; // Alfa Wallet uses mobile number

                $result = $bankAlfalah->initiateAlfaWalletPayment(
                    $orderId,
                    $request->amount,
                    $request->account_number, // Wallet/Mobile number
                    $email,
                    $mobile
                );

                if (!$result['success']) {
                    return response()->json([
                        'success' => false,
                        'message' => $result['error'] ?? 'Failed to initiate Alfa Wallet payment',
                    ], 500);
                }

                // Create pending transaction
                RiderTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'topup',
                    'amount' => $request->amount,
                    'balance_after' => 0,
                    'description' => 'Wallet top-up via Alfa Wallet',
                    'reference_id' => $orderId,
                    'status' => 'pending',
                    'metadata' => [
                        'method' => 'alfa_wallet',
                        'auth_token' => $result['auth_token'],
                        'hash_key' => $result['hash_key'],
                        'is_otp' => $result['is_otp'],
                        'transaction_type' => $result['transaction_type'],
                    ]
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'data' => [
                        'order_id' => $orderId,
                        'requires_otp' => true,
                        'otp_length' => $result['otp_length'],
                        'method' => 'alfa_wallet',
                    ]
                ]);
            }

            // For Alfalah Bank Account payment (REST API with OTP)
            if ($request->method === 'bank_account') {
                $bankAlfalah = new BankAlfalahService();

                // Get user details for notification
                $email = $request->email ?? $user->email ?? 'noreply@shareide.com';
                $mobile = $user->phone ?? '';

                $result = $bankAlfalah->initiateBankAccountPayment(
                    $orderId,
                    $request->amount,
                    $request->account_number, // Bank account number
                    $email,
                    $mobile
                );

                if (!$result['success']) {
                    return response()->json([
                        'success' => false,
                        'message' => $result['error'] ?? 'Failed to initiate Bank Account payment',
                    ], 500);
                }

                // Create pending transaction
                RiderTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'topup',
                    'amount' => $request->amount,
                    'balance_after' => 0,
                    'description' => 'Wallet top-up via Alfalah Bank Account',
                    'reference_id' => $orderId,
                    'status' => 'pending',
                    'metadata' => [
                        'method' => 'bank_account',
                        'auth_token' => $result['auth_token'],
                        'hash_key' => $result['hash_key'],
                        'is_otp' => $result['is_otp'],
                        'transaction_type' => $result['transaction_type'],
                    ]
                ]);

                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'data' => [
                        'order_id' => $orderId,
                        'requires_otp' => true,
                        'otp_length' => $result['otp_length'],
                        'method' => 'bank_account',
                    ]
                ]);
            }

            // For Bank Alfalah card payment (Page Redirection)
            if ($request->method === 'card' || $request->method === 'bank_alfalah') {
                // Use Bank Alfalah
                try {
                    $bankAlfalah = new BankAlfalahService();
                    $paymentResult = $bankAlfalah->createPayment(
                        $orderId,
                        $request->amount,
                        'SHAREIDE Wallet Top-up'
                    );
                } catch (\Exception $e) {
                    Log::error('Bank Alfalah createPayment failed', [
                        'error' => $e->getMessage(),
                        'order_id' => $orderId,
                        'amount' => $request->amount,
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Payment gateway error: ' . $e->getMessage(),
                    ], 500);
                }

                if (!$paymentResult['success']) {
                    Log::error('Bank Alfalah payment initiation failed', [
                        'result' => $paymentResult,
                        'order_id' => $orderId,
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to initiate payment',
                        'error' => $paymentResult['error'] ?? 'Unknown error'
                    ], 500);
                }

                // Create pending transaction
                RiderTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'topup',
                    'amount' => $request->amount,
                    'balance_after' => 0, // Will be updated on callback
                    'description' => 'Wallet top-up via Bank Alfalah',
                    'reference_id' => $orderId,
                    'status' => 'pending',
                    'metadata' => [
                        'method' => 'bank_alfalah',
                        'payment_url' => $paymentResult['payment_url'],
                    ]
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Redirecting to payment gateway',
                    'data' => [
                        'payment_url' => $paymentResult['payment_url'],
                        'form_data' => $paymentResult['form_data'],
                        'method' => $paymentResult['method'],
                        'order_id' => $orderId,
                    ]
                ]);
            }

            // For JazzCash/Easypaisa - create pending transaction
            // (These would need their own gateway integration)
            $referenceId = 'TXN-' . strtoupper(uniqid());

            RiderTransaction::create([
                'user_id' => $user->id,
                'type' => 'topup',
                'amount' => $request->amount,
                'balance_after' => 0,
                'description' => 'Wallet top-up via ' . ucfirst($request->method),
                'reference_id' => $referenceId,
                'status' => 'pending',
                'metadata' => [
                    'method' => $request->method,
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment initiated',
                'data' => [
                    'reference_id' => $referenceId,
                    'method' => $request->method,
                    'amount' => $request->amount,
                    // Mobile wallet integration details would go here
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Wallet topUp failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'method' => $request->method ?? 'unknown',
                'amount' => $request->amount ?? 0,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to process top-up: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify OTP and complete payment for Alfa Wallet / Bank Account
     */
    public function verifyOTP(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|string',
            'otp' => 'required|string|min:4|max:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // Find pending transaction
            $transaction = RiderTransaction::where('reference_id', $request->order_id)
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->first();

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found or already processed',
                ], 404);
            }

            $metadata = $transaction->metadata ?? [];

            // Check if this is an Alfa Wallet or Bank Account payment
            if (!in_array($metadata['method'] ?? '', ['alfa_wallet', 'bank_account'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'This transaction does not require OTP verification',
                ], 400);
            }

            // Get stored auth data
            $authToken = $metadata['auth_token'] ?? null;
            $hashKey = $metadata['hash_key'] ?? null;
            $isOTP = $metadata['is_otp'] ?? true;
            $transactionType = $metadata['transaction_type'] ?? '1';

            if (!$authToken || !$hashKey) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid transaction state. Please restart payment.',
                ], 400);
            }

            // Complete payment with OTP
            $bankAlfalah = new BankAlfalahService();
            $result = $bankAlfalah->completePaymentWithOTP(
                $authToken,
                $request->order_id,
                $hashKey,
                $request->otp,
                $isOTP,
                $transactionType
            );

            if ($result['success']) {
                DB::beginTransaction();

                // Get or create wallet
                $wallet = RiderWallet::firstOrCreate(
                    ['user_id' => $user->id],
                    ['balance' => 0, 'total_spent' => 0, 'total_topped_up' => 0]
                );

                // Update wallet balance
                $wallet->balance += $transaction->amount;
                $wallet->total_topped_up += $transaction->amount;
                $wallet->save();

                // Update transaction
                $transaction->update([
                    'status' => 'completed',
                    'balance_after' => $wallet->balance,
                    'metadata' => array_merge($metadata, [
                        'bank_transaction_id' => $result['bank_transaction_id'],
                        'paid_datetime' => $result['paid_datetime'],
                    ])
                ]);

                DB::commit();

                Log::info('OTP Payment successful', [
                    'order_id' => $request->order_id,
                    'amount' => $transaction->amount,
                    'new_balance' => $wallet->balance,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment successful!',
                    'data' => [
                        'amount' => $transaction->amount,
                        'balance' => $wallet->balance,
                        'transaction_id' => $result['bank_transaction_id'],
                    ]
                ]);
            } else {
                // Payment failed - check if OTP was invalid
                $transaction->update([
                    'metadata' => array_merge($metadata, [
                        'last_error' => $result['error'],
                        'last_attempt' => now(),
                    ])
                ]);

                return response()->json([
                    'success' => false,
                    'message' => $result['error'] ?? 'Payment verification failed',
                ], 400);
            }

        } catch (\Exception $e) {
            Log::error('OTP verification error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Bank Alfalah payment callback
     */
    public function paymentCallback(Request $request)
    {
        try {
            Log::info('Payment Callback Received', [
                'method' => $request->method(),
                'all_data' => $request->all(),
                'query' => $request->query(),
            ]);

            $bankAlfalah = new BankAlfalahService();
            $result = $bankAlfalah->verifyPayment($request->all());

            // Try multiple ways to find the order ID
            $orderId = $result['transaction_id']
                ?? $request->input('orderrefnum')
                ?? $request->input('HS_TransactionReferenceNumber')
                ?? $request->input('basketid');

            Log::info('Looking for transaction', ['orderId' => $orderId]);

            if (empty($orderId)) {
                Log::error('No order ID in callback', $request->all());

                // Check if this is a Bank Alfalah authentication error
                $bankSuccess = $request->input('success');
                $errorMessage = $request->input('ErrorMessage');

                if ($bankSuccess === 'false' || $bankSuccess === false) {
                    $error = $errorMessage ?: 'Bank Alfalah rejected the payment request. Please verify your credentials or try again later.';
                    return response()->view('payment.failed', [
                        'error' => $error,
                        'amount' => 0,
                    ]);
                }

                // Return HTML page for app to detect
                return response()->view('payment.failed', [
                    'error' => 'No transaction reference found',
                    'amount' => 0,
                ]);
            }

            // Find the pending transaction
            $transaction = RiderTransaction::where('reference_id', $orderId)
                ->where('status', 'pending')
                ->first();

            if (!$transaction) {
                Log::error('Transaction not found', ['orderId' => $orderId]);
                // Return HTML page for app to detect
                return response()->view('payment.failed', [
                    'error' => 'Transaction not found or already processed',
                    'amount' => 0,
                ]);
            }

            if ($result['success']) {
                DB::beginTransaction();

                // Get or create wallet
                $wallet = RiderWallet::firstOrCreate(
                    ['user_id' => $transaction->user_id],
                    ['balance' => 0, 'total_spent' => 0, 'total_topped_up' => 0]
                );

                // Update wallet balance
                $wallet->balance += $transaction->amount;
                $wallet->total_topped_up += $transaction->amount;
                $wallet->save();

                // Update transaction
                $transaction->update([
                    'status' => 'completed',
                    'balance_after' => $wallet->balance,
                    'metadata' => array_merge($transaction->metadata ?? [], [
                        'bank_transaction_id' => $result['bank_transaction_id'],
                        'response_code' => $result['response_code'],
                    ])
                ]);

                DB::commit();

                Log::info('Payment successful', [
                    'orderId' => $orderId,
                    'amount' => $transaction->amount,
                    'new_balance' => $wallet->balance,
                ]);

                // Return HTML page that app can detect
                return response()->view('payment.success', [
                    'amount' => $transaction->amount,
                    'balance' => $wallet->balance,
                ]);
            } else {
                // Payment failed
                $transaction->update([
                    'status' => 'failed',
                    'metadata' => array_merge($transaction->metadata ?? [], [
                        'error' => $result['error'],
                        'response_code' => $result['response_code'] ?? null,
                    ])
                ]);

                Log::info('Payment failed', [
                    'orderId' => $orderId,
                    'error' => $result['error'],
                ]);

                return response()->view('payment.failed', [
                    'error' => $result['error'] ?? 'Payment was not successful',
                    'amount' => $transaction->amount,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Payment callback error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->view('payment.failed', [
                'error' => 'An error occurred processing your payment',
                'amount' => 0,
            ]);
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
