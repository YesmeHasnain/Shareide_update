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
     * All Bank Alfalah methods (card, alfa_wallet, bank_account) use
     * Page Redirection flow per APG Integration Guide v1.1.
     * Customer is redirected to APG checkout page via WebView.
     */
    public function topUp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:100|max:50000',
            'method' => 'required|in:jazzcash,easypaisa,card,bank_alfalah,alfa_wallet,bank_account',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            $orderId = 'TOPUP-' . $user->id . '-' . time();
            $method = $request->method;

            // All methods go through Bank Alfalah APG (JazzCash/Easypaisa enabled on merchant account)
            $bankAlfalah = new BankAlfalahService();

            if ($method === 'alfa_wallet') {
                $result = $bankAlfalah->createAlfaWalletPayment($orderId, $request->amount);
                $methodLabel = 'Alfa Wallet';
            } elseif ($method === 'bank_account') {
                $result = $bankAlfalah->createBankAccountPayment($orderId, $request->amount);
                $methodLabel = 'Bank Account';
            } elseif ($method === 'jazzcash') {
                // JazzCash enabled on Bank Alfalah → use mobile wallet type
                $result = $bankAlfalah->createAlfaWalletPayment($orderId, $request->amount);
                $methodLabel = 'JazzCash';
            } elseif ($method === 'easypaisa') {
                // Easypaisa enabled on Bank Alfalah → use mobile wallet type
                $result = $bankAlfalah->createAlfaWalletPayment($orderId, $request->amount);
                $methodLabel = 'Easypaisa';
            } else {
                $result = $bankAlfalah->createPayment($orderId, $request->amount);
                $methodLabel = 'Card Payment';
            }

            if (!$result['success']) {
                Log::error('Bank Alfalah payment initiation failed', [
                    'result' => $result,
                    'order_id' => $orderId,
                    'method' => $method,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => $result['error'] ?? 'Failed to initiate payment',
                ], 500);
            }

            // Create pending transaction
            RiderTransaction::create([
                'user_id' => $user->id,
                'type' => 'topup',
                'amount' => $request->amount,
                'balance_after' => 0,
                'description' => 'Wallet top-up via ' . $methodLabel,
                'reference_id' => $orderId,
                'status' => 'pending',
                'metadata' => [
                    'method' => $method,
                    'payment_url' => $result['payment_url'],
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Redirecting to payment gateway',
                'data' => [
                    'payment_url' => $result['payment_url'],
                    'method' => $result['method'] ?? 'GET',
                    'order_id' => $orderId,
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
     * Handle Bank Alfalah payment callback
     *
     * After payment on APG checkout page, customer is redirected here with:
     * ?TS=P/RC=00/RD=/O=OrderId
     */
    public function paymentCallback(Request $request)
    {
        try {
            Log::info('Payment Callback Received', [
                'method' => $request->method(),
                'all_data' => $request->all(),
                'query' => $request->query(),
                'url' => $request->fullUrl(),
            ]);

            $bankAlfalah = new BankAlfalahService();

            // Parse the callback - Bank Alfalah may send data in URL path format
            // e.g. ?TS=P/RC=00/RD=/O=TOPUP-1-1234567890
            $callbackData = $request->all();

            // Also try to parse from URL path-style params
            $queryString = $request->server('QUERY_STRING', '');
            if (!empty($queryString) && empty($callbackData)) {
                // Parse TS=P/RC=00/RD=/O=OrderId format
                $parts = explode('/', $queryString);
                foreach ($parts as $part) {
                    $kv = explode('=', $part, 2);
                    if (count($kv) === 2) {
                        $callbackData[$kv[0]] = $kv[1];
                    }
                }
            }

            $result = $bankAlfalah->verifyPayment($callbackData);

            $orderId = $result['transaction_id']
                ?? $request->input('orderrefnum')
                ?? $request->input('HS_TransactionReferenceNumber')
                ?? $request->input('basketid');

            Log::info('Looking for transaction', ['orderId' => $orderId]);

            if (empty($orderId)) {
                Log::error('No order ID in callback', $callbackData);

                $bankSuccess = $request->input('success');
                $errorMessage = $request->input('ErrorMessage');

                if ($bankSuccess === 'false' || $bankSuccess === false) {
                    $error = $errorMessage ?: 'Bank Alfalah rejected the payment request.';
                    return response()->view('payment.failed', [
                        'error' => $error,
                        'amount' => 0,
                    ]);
                }

                return response()->view('payment.failed', [
                    'error' => 'No transaction reference found',
                    'amount' => 0,
                ]);
            }

            $transaction = RiderTransaction::where('reference_id', $orderId)
                ->where('status', 'pending')
                ->first();

            if (!$transaction) {
                Log::error('Transaction not found', ['orderId' => $orderId]);
                return response()->view('payment.failed', [
                    'error' => 'Transaction not found or already processed',
                    'amount' => 0,
                ]);
            }

            if ($result['success']) {
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

                return response()->view('payment.success', [
                    'amount' => $transaction->amount,
                    'balance' => $wallet->balance,
                ]);
            } else {
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

        } catch (\Throwable $e) {
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

            PaymentMethod::where('user_id', $user->id)
                ->update(['is_default' => false]);

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

    /**
     * Pakistan IBAN bank code mapping
     */
    private const IBAN_BANK_CODES = [
        'ALFH' => 'Bank Alfalah',
        'SCBL' => 'Standard Chartered',
        'HABB' => 'HBL',
        'MUCB' => 'MCB Bank',
        'UBLI' => 'UBL',
        'NBPA' => 'National Bank of Pakistan',
        'ABPA' => 'Allied Bank',
        'ASCM' => 'Askari Bank',
        'FAYS' => 'Faysal Bank',
        'MEZN' => 'Meezan Bank',
        'BKIP' => 'Bank of Punjab',
        'JSBL' => 'JS Bank',
        'SONE' => 'Soneri Bank',
        'HBKP' => 'Habib Metropolitan Bank',
        'BAHL' => 'Bank Al Habib',
        'SILH' => 'Silk Bank',
        'MPBL' => 'Mobilink Microfinance Bank',
        'TMFB' => 'Telenor Microfinance Bank',
    ];

    /**
     * Withdraw from rider wallet - instant withdrawal
     * Accepts IBAN, bank account number, or mobile number
     */
    public function requestWithdrawal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:100',
            'method' => 'required|in:jazzcash,easypaisa,bank_transfer',
            'account_title' => 'required|string|max:100',
            'account_number' => 'required|string|max:34',
            'bank_name' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            $accountNumber = strtoupper(preg_replace('/\s+/', '', $request->account_number));
            $method = $request->method;
            $bankName = $request->bank_name;

            // Auto-detect from IBAN
            if (str_starts_with($accountNumber, 'PK') && strlen($accountNumber) === 24) {
                $method = 'bank_transfer';
                $bankCode = substr($accountNumber, 4, 4);
                if (isset(self::IBAN_BANK_CODES[$bankCode])) {
                    $bankName = self::IBAN_BANK_CODES[$bankCode];
                }
            }
            // Auto-detect mobile wallet
            elseif (preg_match('/^03\d{9}$/', $accountNumber)) {
                $method = in_array($method, ['jazzcash', 'easypaisa']) ? $method : 'jazzcash';
            }

            $wallet = RiderWallet::where('user_id', $user->id)->first();

            if (!$wallet || $wallet->balance < $request->amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient balance',
                ], 400);
            }

            DB::beginTransaction();

            $wallet->balance -= $request->amount;
            $wallet->save();

            $methodLabel = match($method) {
                'jazzcash' => 'JazzCash',
                'easypaisa' => 'Easypaisa',
                'bank_transfer' => $bankName ?? 'Bank Transfer',
                default => ucfirst($method),
            };

            $transaction = RiderTransaction::create([
                'user_id' => $user->id,
                'type' => 'withdrawal',
                'amount' => -$request->amount,
                'balance_after' => $wallet->balance,
                'description' => 'Withdrawal to ' . $methodLabel . ' (...' . substr($accountNumber, -4) . ')',
                'reference_id' => 'WD-' . $user->id . '-' . time(),
                'status' => 'completed',
                'metadata' => [
                    'method' => $method,
                    'account_title' => $request->account_title,
                    'account_number' => $accountNumber,
                    'bank_name' => $bankName,
                    'completed_at' => now()->toIso8601String(),
                ],
            ]);

            DB::commit();

            Log::info('Withdrawal completed', [
                'user_id' => $user->id,
                'amount' => $request->amount,
                'method' => $method,
                'account' => '...' . substr($accountNumber, -4),
                'bank' => $bankName,
                'new_balance' => $wallet->balance,
                'transaction_id' => $transaction->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rs. ' . number_format($request->amount) . ' sent to ' . $methodLabel . ' successfully',
                'data' => [
                    'transaction' => $transaction,
                    'new_balance' => (float) $wallet->balance,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Withdrawal failed', ['error' => $e->getMessage(), 'user_id' => $request->user()->id ?? null]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to process withdrawal',
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
            $user = $request->user();

            $withdrawals = RiderTransaction::where('user_id', $user->id)
                ->where('type', 'withdrawal')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => ['withdrawals' => $withdrawals]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch withdrawals',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
