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
                // Check if we should use test mode (for development/testing)
                $useTestMode = env('BANKALFALAH_TEST_MODE', true);

                if ($useTestMode) {
                    // TEST MODE: Simulate successful payment without Bank Alfalah
                    Log::info('Using TEST MODE for payment', ['order_id' => $orderId, 'amount' => $request->amount]);

                    // Create pending transaction
                    RiderTransaction::create([
                        'user_id' => $user->id,
                        'type' => 'topup',
                        'amount' => $request->amount,
                        'balance_after' => 0,
                        'description' => 'Wallet top-up via Card (Test Mode)',
                        'reference_id' => $orderId,
                        'status' => 'pending',
                        'metadata' => [
                            'method' => 'card_test',
                        ]
                    ]);

                    // Return inline HTML for test payment (avoids ngrok redirect issues)
                    // Use request URL to determine the base URL (works with ngrok)
                    $baseUrl = $request->getSchemeAndHttpHost();
                    $callbackUrl = $baseUrl . '/api/wallet/test-payment/process';

                    return response()->json([
                        'success' => true,
                        'message' => 'Test payment page',
                        'data' => [
                            'payment_url' => 'about:blank', // Not used in test mode
                            'form_data' => [],
                            'method' => 'GET',
                            'order_id' => $orderId,
                            'test_mode' => true,
                            'test_html' => $this->generateTestPaymentHtml($orderId, $request->amount, $callbackUrl),
                        ]
                    ]);
                }

                // PRODUCTION MODE: Use Bank Alfalah
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
     * Generate test payment HTML inline
     */
    private function generateTestPaymentHtml($orderId, $amount, $callbackUrl)
    {
        $formattedAmount = number_format($amount);
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Payment</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: #fff;
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .logo {
            width: 80px; height: 80px;
            background: #FCC014;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 24px;
            font-size: 32px;
        }
        h1 { color: #1a1a2e; font-size: 22px; margin-bottom: 8px; }
        .test-badge {
            display: inline-block;
            background: #FEF3C7;
            color: #92400E;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .amount-box {
            background: #F3F4F6;
            border-radius: 16px;
            padding: 20px;
            margin: 20px 0;
        }
        .amount-label { color: #6B7280; font-size: 14px; margin-bottom: 4px; }
        .amount-value { color: #1a1a2e; font-size: 36px; font-weight: 700; }
        .order-id { color: #9CA3AF; font-size: 12px; margin-top: 8px; }
        .buttons { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
        .btn {
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            width: 100%;
        }
        .btn-success { background: #10B981; color: #fff; }
        .btn-fail { background: #EF4444; color: #fff; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .note { color: #9CA3AF; font-size: 12px; margin-top: 20px; line-height: 1.5; }
        .spinner-small {
            width: 20px; height: 20px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
            vertical-align: middle;
            margin-right: 8px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">💳</div>
        <h1>Test Payment Gateway</h1>
        <span class="test-badge">TEST MODE</span>
        <div class="amount-box">
            <div class="amount-label">Amount to Pay</div>
            <div class="amount-value">Rs. {$formattedAmount}</div>
            <div class="order-id">Order: {$orderId}</div>
        </div>
        <div class="buttons" id="buttons">
            <button onclick="processPayment('success')" class="btn btn-success" id="payBtn">✓ Pay Now (Test)</button>
            <button onclick="processPayment('fail')" class="btn btn-fail" id="cancelBtn">✕ Cancel Payment</button>
        </div>
        <p class="note">This is a test payment page.<br>In production, Bank Alfalah will be used.</p>
    </div>

    <script>
        function processPayment(action) {
            var payBtn = document.getElementById('payBtn');
            var cancelBtn = document.getElementById('cancelBtn');
            payBtn.disabled = true;
            cancelBtn.disabled = true;

            if (action === 'success') {
                payBtn.innerHTML = '<span class="spinner-small"></span>Processing...';
            } else {
                cancelBtn.innerHTML = '<span class="spinner-small"></span>Cancelling...';
            }

            // Send message to React Native to process payment
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'test_payment',
                    action: action,
                    order_id: '{$orderId}'
                }));
            } else {
                alert('WebView communication error');
                payBtn.disabled = false;
                cancelBtn.disabled = false;
                payBtn.innerHTML = '✓ Pay Now (Test)';
                cancelBtn.innerHTML = '✕ Cancel Payment';
            }
        }
    </script>
</body>
</html>
HTML;
    }

    /**
     * Test payment page (for development/testing)
     */
    public function testPaymentPage(Request $request)
    {
        $orderId = $request->input('order_id');
        $amount = $request->input('amount');
        $userId = $request->input('user_id');

        return view('payment.test', [
            'order_id' => $orderId,
            'amount' => $amount,
            'user_id' => $userId,
        ]);
    }

    /**
     * Process test payment (for development/testing)
     */
    public function processTestPayment(Request $request)
    {
        try {
            // Handle both JSON and form data
            $data = $request->all();
            if ($request->isJson()) {
                $data = $request->json()->all();
            }

            $orderId = $data['order_id'] ?? $request->input('order_id');
            $action = $data['action'] ?? $request->input('action'); // 'success' or 'fail'

            Log::info('Processing test payment', ['order_id' => $orderId, 'action' => $action, 'data' => $data]);

            $transaction = RiderTransaction::where('reference_id', $orderId)
                ->where('status', 'pending')
                ->first();

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found or already processed',
                ], 404);
            }

            if ($action === 'success') {
                DB::beginTransaction();

                $wallet = RiderWallet::firstOrCreate(
                    ['user_id' => $transaction->user_id],
                    ['balance' => 0, 'total_spent' => 0, 'total_topped_up' => 0]
                );

                $wallet->balance += $transaction->amount;
                $wallet->total_topped_up += $transaction->amount;
                $wallet->save();

                $transaction->update([
                    'status' => 'completed',
                    'balance_after' => $wallet->balance,
                    'metadata' => array_merge($transaction->metadata ?? [], [
                        'test_mode' => true,
                        'completed_at' => now(),
                    ])
                ]);

                DB::commit();

                Log::info('Test payment successful', [
                    'order_id' => $orderId,
                    'amount' => $transaction->amount,
                    'new_balance' => $wallet->balance,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment successful',
                    'data' => [
                        'amount' => $transaction->amount,
                        'balance' => $wallet->balance,
                    ]
                ]);
            } else {
                $transaction->update([
                    'status' => 'failed',
                    'metadata' => array_merge($transaction->metadata ?? [], [
                        'test_mode' => true,
                        'error' => 'User cancelled payment',
                    ])
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment cancelled',
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Test payment error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred: ' . $e->getMessage(),
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

    /**
     * Check Bank Alfalah IPN Status for an Order
     * Public endpoint for testing
     */
    public function checkIPNStatus($orderId)
    {
        try {
            $bankAlfalah = new BankAlfalahService();
            $result = $bankAlfalah->checkTransactionStatus($orderId);

            $merchantId = env('BANKALFALAH_MERCHANT_ID', '5504');
            $storeId = env('BANKALFALAH_MERCHANT_STOREID', '000827');
            $isProduction = env('BANKALFALAH_PRODUCTION', false);
            $baseUrl = $isProduction
                ? 'https://payments.bankalfalah.com'
                : 'https://sandbox.bankalfalah.com';

            $ipnUrl = "{$baseUrl}/HS/api/IPN/OrderStatus/{$merchantId}/{$storeId}/{$orderId}";

            // Also get local transaction record
            $transaction = RiderTransaction::where('reference_id', $orderId)->first();

            return response()->json([
                'success' => true,
                'order_id' => $orderId,
                'ipn_url' => $ipnUrl,
                'bank_response' => $result,
                'local_transaction' => $transaction ? [
                    'id' => $transaction->id,
                    'user_id' => $transaction->user_id,
                    'amount' => $transaction->amount,
                    'status' => $transaction->status,
                    'method' => $transaction->metadata['method'] ?? 'unknown',
                    'created_at' => $transaction->created_at,
                ] : null,
                'environment' => $isProduction ? 'production' : 'sandbox',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get recent orders with IPN URLs
     * Public endpoint for testing
     */
    public function recentOrders()
    {
        try {
            $merchantId = env('BANKALFALAH_MERCHANT_ID', '5504');
            $storeId = env('BANKALFALAH_MERCHANT_STOREID', '000827');
            $isProduction = env('BANKALFALAH_PRODUCTION', false);
            $baseUrl = $isProduction
                ? 'https://payments.bankalfalah.com'
                : 'https://sandbox.bankalfalah.com';

            // Get last 20 transactions
            $transactions = RiderTransaction::where('type', 'topup')
                ->orderBy('created_at', 'desc')
                ->take(20)
                ->get();

            $orders = $transactions->map(function ($t) use ($baseUrl, $merchantId, $storeId) {
                return [
                    'id' => $t->id,
                    'order_id' => $t->reference_id,
                    'amount' => $t->amount,
                    'status' => $t->status,
                    'method' => $t->metadata['method'] ?? 'unknown',
                    'created_at' => $t->created_at->format('Y-m-d H:i:s'),
                    'ipn_url' => "{$baseUrl}/HS/api/IPN/OrderStatus/{$merchantId}/{$storeId}/{$t->reference_id}",
                    'check_url' => url("/api/wallet/check-ipn/{$t->reference_id}"),
                ];
            });

            return response()->json([
                'success' => true,
                'environment' => $isProduction ? 'production' : 'sandbox',
                'merchant_id' => $merchantId,
                'store_id' => $storeId,
                'orders' => $orders,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
