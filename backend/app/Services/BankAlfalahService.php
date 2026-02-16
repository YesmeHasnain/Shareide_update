<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Bank Alfalah Payment Gateway Service
 *
 * Supports 3 Payment Methods:
 * 1. Alfa Wallet (REST API) - TransactionTypeId = 1
 * 2. Alfalah Bank Account (REST API) - TransactionTypeId = 2
 * 3. Credit/Debit Card (Page Redirection) - TransactionTypeId = 3
 *
 * API Endpoints:
 * - Handshake: /HS/api/HSAPI/HSAPI (API) or /HS/HS/HS (Redirect)
 * - Initiate Transaction: /HS/api/Tran/DoTran
 * - Process Transaction: /HS/api/ProcessTran/ProTran
 * - SSO (Card Redirect): /SSO/SSO/SSO
 * - IPN Status Check: /HS/api/IPN/OrderStatus/{MerchantId}/{StoreId}/{OrderId}
 */
class BankAlfalahService
{
    private $merchantId;
    private $storeId;
    private $merchantHash;
    private $merchantUsername;
    private $merchantPassword;
    private $returnUrl;
    private $listenerUrl;
    private $key1;
    private $key2;
    private $sandboxUrl;
    private $productionUrl;
    private $isProduction;

    // Channel IDs
    const CHANNEL_API = '1002';        // For REST API (Alfa Wallet, Bank Account)
    const CHANNEL_REDIRECT = '1001';   // For Page Redirection (Card)

    // Transaction Type IDs
    const TYPE_ALFA_WALLET = '1';
    const TYPE_BANK_ACCOUNT = '2';
    const TYPE_CARD = '3';

    public function __construct()
    {
        $this->merchantId = config('services.bank_alfalah.merchant_id', env('BANKALFALAH_MERCHANT_ID'));
        $this->storeId = config('services.bank_alfalah.merchant_storeid', env('BANKALFALAH_MERCHANT_STOREID'));
        $this->merchantHash = config('services.bank_alfalah.merchant_hash', env('BANKALFALAH_MERCHANT_HASH'));
        $this->merchantUsername = config('services.bank_alfalah.username', env('BANKALFALAH_USERNAME', ''));
        $this->merchantPassword = config('services.bank_alfalah.password', env('BANKALFALAH_PASSWORD', ''));
        $this->returnUrl = config('services.bank_alfalah.return_url', env('BANKALFALAH_RETURN_URL'));
        $this->listenerUrl = config('services.bank_alfalah.listener_url', env('BANKALFALAH_LISTENER_URL'));
        $this->key1 = config('services.bank_alfalah.key1', env('BANKALFALAH_KEY1'));
        $this->key2 = config('services.bank_alfalah.key2', env('BANKALFALAH_KEY2'));
        $this->sandboxUrl = 'https://sandbox.bankalfalah.com';
        $this->productionUrl = env('BANKALFALAH_SANDBOX_URL', 'https://payments.bankalfalah.com');

        // Determine environment: BANKALFALAH_TEST_MODE=true means use sandbox/test
        $testMode = env('BANKALFALAH_TEST_MODE', true);
        $this->isProduction = ($testMode === false || $testMode === 'false') ? true : false;

        Log::info('BankAlfalahService initialized', [
            'is_production' => $this->isProduction,
            'base_url' => $this->getBaseUrl(),
            'merchant_id' => $this->merchantId,
            'store_id' => $this->storeId,
            'return_url' => $this->returnUrl,
            'key1_set' => !empty($this->key1),
            'key2_set' => !empty($this->key2),
        ]);
    }

    /**
     * Parse Bank Alfalah response which may return double-encoded JSON
     * (JSON string wrapped in quotes instead of a proper JSON object)
     */
    private function parseResponse($response)
    {
        $data = $response->json();

        // Bank Alfalah sometimes returns double-encoded JSON (string instead of array)
        if (is_string($data)) {
            $data = json_decode($data, true);
        }

        if (!is_array($data)) {
            Log::error('Bank Alfalah returned unparseable response', [
                'status' => $response->status(),
                'body' => substr($response->body(), 0, 500),
            ]);
            return null;
        }

        return $data;
    }

    /**
     * Build params array - Username/Password MUST always be included
     * (even if empty) as they are part of the RequestHash computation
     */
    private function buildAuthParams($prefix = '')
    {
        return [
            $prefix . 'MerchantId' => $this->merchantId,
            $prefix . 'StoreId' => $this->storeId,
            $prefix . 'MerchantHash' => $this->merchantHash,
            $prefix . 'MerchantUsername' => $this->merchantUsername ?? '',
            $prefix . 'MerchantPassword' => $this->merchantPassword ?? '',
        ];
    }

    /**
     * Get base URL based on environment
     */
    private function getBaseUrl()
    {
        return $this->isProduction ? $this->productionUrl : $this->sandboxUrl;
    }

    /**
     * Generate AES encrypted RequestHash
     * Algorithm: AES/CBC/PKCS7Padding
     * Key: Key1 (16 bytes)
     * IV: Key2 (16 bytes)
     */
    private function generateRequestHash(array $params)
    {
        // Validate encryption keys
        if (empty($this->key1) || empty($this->key2)) {
            Log::error('Bank Alfalah encryption keys are missing', [
                'key1_set' => !empty($this->key1),
                'key2_set' => !empty($this->key2),
            ]);
            throw new \Exception('Bank Alfalah encryption keys are not configured');
        }

        if (strlen($this->key1) !== 16 || strlen($this->key2) !== 16) {
            Log::error('Bank Alfalah encryption keys have invalid length', [
                'key1_length' => strlen($this->key1),
                'key2_length' => strlen($this->key2),
            ]);
            throw new \Exception('Bank Alfalah encryption keys must be exactly 16 bytes');
        }

        // Create the map string: key1=value1&key2=value2&...
        $mapString = '';
        foreach ($params as $key => $value) {
            $mapString .= $key . '=' . $value . '&';
        }
        // Remove trailing &
        $mapString = rtrim($mapString, '&');

        Log::info('RequestHash map string', ['mapString' => $mapString]);

        // AES-128-CBC encryption with PKCS7 padding
        $encrypted = openssl_encrypt(
            $mapString,
            'AES-128-CBC',
            $this->key1,
            OPENSSL_RAW_DATA,
            $this->key2
        );

        if ($encrypted === false) {
            Log::error('Bank Alfalah RequestHash encryption failed', [
                'openssl_error' => openssl_error_string(),
            ]);
            throw new \Exception('Failed to generate payment RequestHash');
        }

        // Base64 encode the result
        return base64_encode($encrypted);
    }

    /**
     * Create payment request for Credit/Debit Card
     * This uses Page Redirection method (2-step process)
     */
    public function createPayment($orderId, $amount, $description = 'Shareide Wallet Top-up')
    {
        $amount = number_format($amount, 2, '.', ''); // Format: 100.00

        // Step 1: Handshake - POST to /HS/HS/HS
        // ChannelId = 1001 for Page Redirection
        // Parameter order matches Bank Alfalah APG Integration Guide
        $paramsForHash = [
            'HS_ChannelId' => self::CHANNEL_REDIRECT,
            'HS_IsRedirectionRequest' => '1',
            'HS_MerchantId' => $this->merchantId,
            'HS_StoreId' => $this->storeId,
            'HS_ReturnURL' => $this->returnUrl,
            'HS_MerchantHash' => $this->merchantHash,
            'HS_MerchantUsername' => $this->merchantUsername ?? '',
            'HS_MerchantPassword' => $this->merchantPassword ?? '',
            'HS_TransactionReferenceNumber' => $orderId,
        ];

        // Generate RequestHash and add it to params
        $handshakeParams = $paramsForHash;
        $handshakeParams['HS_RequestHash'] = $this->generateRequestHash($paramsForHash);

        Log::info('Bank Alfalah Handshake Request', [
            'url' => $this->getBaseUrl() . '/HS/HS/HS',
            'order_id' => $orderId,
            'amount' => $amount,
            'params' => array_merge($handshakeParams, [
                'HS_MerchantPassword' => '***HIDDEN***',
                'HS_MerchantHash' => '***HIDDEN***',
                'HS_RequestHash' => substr($handshakeParams['HS_RequestHash'], 0, 50) . '...',
            ])
        ]);

        // For Credit/Debit Card, we need to return the form data for the WebView to POST
        // The WebView will POST to /HS/HS/HS, get AuthToken, then POST to /SSO/SSO/SSO

        return [
            'success' => true,
            'payment_url' => $this->getBaseUrl() . '/HS/HS/HS',
            'sso_url' => $this->getBaseUrl() . '/SSO/SSO/SSO',
            'form_data' => $handshakeParams,
            'order_id' => $orderId,
            'amount' => $amount,
            'method' => 'POST',
            // Additional data needed for Step 2 (SSO)
            'sso_params' => array_merge(
                ['ChannelId' => '1001'],
                $this->buildAuthParams(),
                [
                    'ReturnURL' => $this->returnUrl,
                    'Currency' => 'PKR',
                    'TransactionTypeId' => '3',
                    'TransactionReferenceNumber' => $orderId,
                    'TransactionAmount' => $amount,
                ]
            )
        ];
    }

    /**
     * Generate SSO form data with RequestHash
     */
    public function generateSSOFormData($authToken, $orderId, $amount)
    {
        $ssoParams = array_merge(
            [
                'AuthToken' => $authToken,
                'RequestHash' => '',
                'ChannelId' => '1001',
                'Currency' => 'PKR',
                'ReturnURL' => $this->returnUrl,
            ],
            $this->buildAuthParams(),
            [
                'TransactionTypeId' => '3',
                'TransactionReferenceNumber' => $orderId,
                'TransactionAmount' => $amount,
            ]
        );

        // Generate RequestHash
        $paramsForHash = $ssoParams;
        unset($paramsForHash['RequestHash']);
        $ssoParams['RequestHash'] = $this->generateRequestHash($paramsForHash);

        return $ssoParams;
    }

    /**
     * Verify payment callback / Check transaction status via IPN
     */
    public function verifyPayment($callbackData)
    {
        Log::info('Bank Alfalah Callback Received', $callbackData);

        // Extract order reference from callback URL params
        // Format: ?TS=P/RC=00/RD=/O=OrderId or direct params
        $orderId = $callbackData['O'] ??
                   $callbackData['orderrefnum'] ??
                   $callbackData['HS_TransactionReferenceNumber'] ??
                   $callbackData['TransactionReferenceNumber'] ?? '';

        $responseCode = $callbackData['RC'] ??
                        $callbackData['HS_ResponseCode'] ??
                        $callbackData['ResponseCode'] ?? '';

        $transactionStatus = $callbackData['TS'] ?? '';

        // Check IPN for detailed status
        if (!empty($orderId)) {
            $ipnStatus = $this->checkTransactionStatus($orderId);
            if ($ipnStatus) {
                return $ipnStatus;
            }
        }

        // Fallback to callback data
        // ResponseCode 00 = Success, TS=P means Paid
        if ($responseCode === '00' || $transactionStatus === 'P') {
            return [
                'success' => true,
                'transaction_id' => $orderId,
                'response_code' => $responseCode,
                'status' => 'completed',
                'bank_transaction_id' => $callbackData['TransactionId'] ?? null,
            ];
        }

        return [
            'success' => false,
            'error' => $callbackData['RD'] ?? $callbackData['ErrorMessage'] ?? 'Payment failed',
            'response_code' => $responseCode,
            'transaction_id' => $orderId,
        ];
    }

    /**
     * Check transaction status via IPN API
     * URL: /HS/api/IPN/OrderStatus/{MerchantId}/{StoreId}/{OrderId}
     */
    public function checkTransactionStatus($orderId)
    {
        $ipnUrl = $this->getBaseUrl() . "/HS/api/IPN/OrderStatus/{$this->merchantId}/{$this->storeId}/{$orderId}";

        try {
            Log::info('Checking IPN status', ['url' => $ipnUrl]);

            $response = Http::timeout(30)->get($ipnUrl);
            $data = $response->json();

            Log::info('IPN Response', $data);

            if (isset($data['TransactionStatus'])) {
                $isPaid = strtolower($data['TransactionStatus']) === 'paid';

                return [
                    'success' => $isPaid,
                    'transaction_id' => $data['TransactionReferenceNumber'] ?? $orderId,
                    'response_code' => $data['ResponseCode'] ?? '',
                    'status' => $isPaid ? 'completed' : 'failed',
                    'bank_transaction_id' => $data['TransactionId'] ?? null,
                    'amount' => $data['TransactionAmount'] ?? null,
                    'error' => $isPaid ? null : ($data['Description'] ?? 'Payment not successful'),
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error('IPN check failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Refund payment
     */
    public function refundPayment($transactionId, $amount)
    {
        // Refund implementation would go here
        // This requires separate API integration with Bank Alfalah
        Log::info('Refund requested', [
            'transaction_id' => $transactionId,
            'amount' => $amount,
        ]);

        return [
            'success' => false,
            'error' => 'Refund not implemented yet',
        ];
    }

    // ==========================================
    // REST API Methods for Alfa Wallet & Bank Account
    // ==========================================

    /**
     * Step 1: Initiate Handshake for REST API
     * Used for Alfa Wallet and Bank Account payments
     * URL: /HS/api/HSAPI/HSAPI
     *
     * @param string $orderId Unique transaction reference number
     * @return array Returns AuthToken on success
     */
    public function initiateHandshake($orderId)
    {
        // Parameter order matches Bank Alfalah APG Integration Guide
        $params = [
            'HS_ChannelId' => self::CHANNEL_API,
            'HS_IsRedirectionRequest' => '0',
            'HS_MerchantId' => $this->merchantId,
            'HS_StoreId' => $this->storeId,
            'HS_ReturnURL' => $this->returnUrl,
            'HS_MerchantHash' => $this->merchantHash,
            'HS_MerchantUsername' => $this->merchantUsername ?? '',
            'HS_MerchantPassword' => $this->merchantPassword ?? '',
            'HS_TransactionReferenceNumber' => $orderId,
        ];

        // Generate RequestHash from all params
        $params['HS_RequestHash'] = $this->generateRequestHash($params);

        $url = $this->getBaseUrl() . '/HS/api/HSAPI/HSAPI';

        Log::info('Bank Alfalah Handshake Request (API)', [
            'url' => $url,
            'order_id' => $orderId,
        ]);

        try {
            // Bank Alfalah requires application/x-www-form-urlencoded (NOT JSON)
            $response = Http::timeout(30)
                ->asForm()
                ->post($url, $params);

            $data = $this->parseResponse($response);

            Log::info('Bank Alfalah Handshake Response', [
                'status' => $response->status(),
                'data' => $data,
            ]);

            if (!$data) {
                return [
                    'success' => false,
                    'error' => 'Invalid response from Bank Alfalah (HTTP ' . $response->status() . ')',
                ];
            }

            if (isset($data['success']) && ($data['success'] === 'true' || $data['success'] === true)) {
                return [
                    'success' => true,
                    'auth_token' => $data['AuthToken'],
                    'return_url' => $data['ReturnURL'] ?? $this->returnUrl,
                ];
            }

            return [
                'success' => false,
                'error' => $data['ErrorMessage'] ?? 'Handshake failed',
            ];

        } catch (\Exception $e) {
            Log::error('Bank Alfalah Handshake Error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Step 2: Initiate Transaction Request
     * Creates transaction and sends OTP to customer
     * URL: /HS/api/Tran/DoTran
     *
     * @param string $authToken AuthToken from handshake
     * @param string $orderId Transaction reference number
     * @param float $amount Transaction amount
     * @param string $accountNumber Customer's wallet/account number
     * @param string $transactionType '1' for Alfa Wallet, '2' for Bank Account
     * @param string $email Customer email
     * @param string $mobile Customer mobile number
     * @return array Returns HashKey and IsOTP flag
     */
    public function initiateTransaction($authToken, $orderId, $amount, $accountNumber, $transactionType, $email, $mobile)
    {
        // Parameter order matches Bank Alfalah APG Integration Guide
        $params = [
            'ChannelId' => self::CHANNEL_API,
            'MerchantId' => $this->merchantId,
            'StoreId' => $this->storeId,
            'ReturnURL' => $this->returnUrl,
            'MerchantHash' => $this->merchantHash,
            'MerchantUsername' => $this->merchantUsername ?? '',
            'MerchantPassword' => $this->merchantPassword ?? '',
            'TransactionReferenceNumber' => $orderId,
            'AuthToken' => $authToken,
            'TransactionTypeId' => $transactionType,
            'Currency' => 'PKR',
            'TransactionAmount' => number_format($amount, 2, '.', ''),
            'MobileNumber' => $mobile,
            'AccountNumber' => $accountNumber,
            'Country' => '164',
            'EmailAddress' => $email,
        ];

        // Generate RequestHash
        $params['RequestHash'] = $this->generateRequestHash($params);

        $url = $this->getBaseUrl() . '/HS/api/Tran/DoTran';

        Log::info('Bank Alfalah Initiate Transaction Request', [
            'url' => $url,
            'order_id' => $orderId,
            'type' => $transactionType == '1' ? 'Alfa Wallet' : 'Bank Account',
            'amount' => $amount,
        ]);

        try {
            // Bank Alfalah requires application/x-www-form-urlencoded (NOT JSON)
            $response = Http::timeout(30)
                ->asForm()
                ->post($url, $params);

            $data = $this->parseResponse($response);

            Log::info('Bank Alfalah Initiate Transaction Response', [
                'status' => $response->status(),
                'data' => $data,
            ]);

            if (!$data) {
                return [
                    'success' => false,
                    'error' => 'Invalid response from Bank Alfalah',
                ];
            }

            if (isset($data['success']) && ($data['success'] === 'true' || $data['success'] === true)) {
                return [
                    'success' => true,
                    'auth_token' => $data['AuthToken'],
                    'hash_key' => $data['HashKey'],
                    'is_otp' => $data['IsOTP'] === 'true', // true = OTP sent to mobile
                    'order_id' => $data['TransactionReferenceNumber'] ?? $orderId,
                    'merchant_id' => $data['MerchantId'],
                    'store_id' => $data['StoreId'],
                    'transaction_type' => $data['TransactionTypeId'],
                    'order_datetime' => $data['order_datetime'] ?? null,
                ];
            }

            return [
                'success' => false,
                'error' => $data['ErrorMessage'] ?? 'Transaction initiation failed',
            ];

        } catch (\Exception $e) {
            Log::error('Bank Alfalah Initiate Transaction Error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Step 3: Process Transaction Request
     * Completes payment with OTP verification
     * URL: /HS/api/ProcessTran/ProTran
     *
     * @param string $authToken AuthToken from initiate transaction
     * @param string $orderId Transaction reference number
     * @param string $hashKey HashKey from initiate transaction
     * @param string $otp OTP entered by customer
     * @param bool $isOTP true = SMSOTP (8 digits), false = SMSOTAC/EmailOTAC (4 digits)
     * @param string $transactionType '1' for Alfa Wallet, '2' for Bank Account
     * @return array Transaction result
     */
    public function processTransaction($authToken, $orderId, $hashKey, $otp, $isOTP, $transactionType)
    {
        // Parameter order matches Bank Alfalah APG Integration Guide
        $params = [
            'ChannelId' => self::CHANNEL_API,
            'MerchantId' => $this->merchantId,
            'StoreId' => $this->storeId,
            'ReturnURL' => $this->returnUrl,
            'MerchantHash' => $this->merchantHash,
            'MerchantUsername' => $this->merchantUsername ?? '',
            'MerchantPassword' => $this->merchantPassword ?? '',
            'TransactionReferenceNumber' => $orderId,
            'AuthToken' => $authToken,
            'TransactionTypeId' => $transactionType,
            'Currency' => 'PKR',
            'HashKey' => $hashKey,
        ];

        // Set OTP fields based on IsOTP flag
        if ($isOTP) {
            $params['SMSOTP'] = $otp;
            $params['SMSOTAC'] = '';
            $params['EmailOTAC'] = '';
        } else {
            $params['SMSOTP'] = '';
            $params['SMSOTAC'] = $otp;
            $params['EmailOTAC'] = '';
        }

        // Generate RequestHash
        $params['RequestHash'] = $this->generateRequestHash($params);

        $url = $this->getBaseUrl() . '/HS/api/ProcessTran/ProTran';

        Log::info('Bank Alfalah Process Transaction Request', [
            'url' => $url,
            'order_id' => $orderId,
            'is_otp' => $isOTP,
        ]);

        try {
            // Bank Alfalah requires application/x-www-form-urlencoded (NOT JSON)
            $response = Http::timeout(30)
                ->asForm()
                ->post($url, $params);

            $data = $this->parseResponse($response);

            Log::info('Bank Alfalah Process Transaction Response', $data ?? ['raw' => substr($response->body(), 0, 500)]);

            if (!$data) {
                return [
                    'success' => false,
                    'error' => 'Invalid response from Bank Alfalah',
                ];
            }

            // Check for success (response_code = '00' means success)
            if (isset($data['response_code']) && $data['response_code'] === '00') {
                return [
                    'success' => true,
                    'transaction_id' => $data['order_id'] ?? $orderId,
                    'bank_transaction_id' => $data['unique_tran_id'] ?? null,
                    'status' => strtolower($data['transaction_status'] ?? 'paid'),
                    'amount' => $data['transaction_amount'] ?? null,
                    'merchant_id' => $data['merchant_id'],
                    'merchant_name' => $data['merchant_name'] ?? null,
                    'payment_method' => $data['payment_method'],
                    'account_number' => $data['account_number'] ?? null,
                    'mobile_number' => $data['mobile_number'] ?? null,
                    'order_datetime' => $data['order_datetime'] ?? null,
                    'paid_datetime' => $data['paid_datetime'] ?? null,
                    'description' => $data['description'] ?? 'Success',
                ];
            }

            return [
                'success' => false,
                'error' => $data['ErrorMessage'] ?? $data['description'] ?? 'Payment processing failed',
                'response_code' => $data['response_code'] ?? null,
            ];

        } catch (\Exception $e) {
            Log::error('Bank Alfalah Process Transaction Error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Complete Alfa Wallet Payment Flow
     * Combines all 3 steps for wallet payment
     *
     * @param string $orderId Unique order reference
     * @param float $amount Payment amount
     * @param string $walletNumber Alfa Wallet number (mobile number)
     * @param string $email Customer email
     * @param string $mobile Customer mobile
     * @return array Step 1 & 2 result (need OTP to complete)
     */
    public function initiateAlfaWalletPayment($orderId, $amount, $walletNumber, $email, $mobile)
    {
        // Step 1: Handshake
        $handshake = $this->initiateHandshake($orderId);
        if (!$handshake['success']) {
            return $handshake;
        }

        // Step 2: Initiate Transaction
        $transaction = $this->initiateTransaction(
            $handshake['auth_token'],
            $orderId,
            $amount,
            $walletNumber,
            self::TYPE_ALFA_WALLET,
            $email,
            $mobile
        );

        if (!$transaction['success']) {
            return $transaction;
        }

        // Return data needed for Step 3 (OTP verification)
        return [
            'success' => true,
            'message' => 'OTP sent to your mobile. Please verify to complete payment.',
            'auth_token' => $transaction['auth_token'],
            'hash_key' => $transaction['hash_key'],
            'is_otp' => $transaction['is_otp'],
            'order_id' => $orderId,
            'transaction_type' => self::TYPE_ALFA_WALLET,
            'requires_otp' => true,
            'otp_length' => $transaction['is_otp'] ? 8 : 4, // SMSOTP=8, OTAC=4
        ];
    }

    /**
     * Complete Bank Account Payment Flow
     * Combines all 3 steps for bank account payment
     *
     * @param string $orderId Unique order reference
     * @param float $amount Payment amount
     * @param string $accountNumber Bank account number
     * @param string $email Customer email
     * @param string $mobile Customer mobile
     * @return array Step 1 & 2 result (need OTP to complete)
     */
    public function initiateBankAccountPayment($orderId, $amount, $accountNumber, $email, $mobile)
    {
        // Step 1: Handshake
        $handshake = $this->initiateHandshake($orderId);
        if (!$handshake['success']) {
            return $handshake;
        }

        // Step 2: Initiate Transaction
        $transaction = $this->initiateTransaction(
            $handshake['auth_token'],
            $orderId,
            $amount,
            $accountNumber,
            self::TYPE_BANK_ACCOUNT,
            $email,
            $mobile
        );

        if (!$transaction['success']) {
            return $transaction;
        }

        // Return data needed for Step 3 (OTP verification)
        return [
            'success' => true,
            'message' => 'OTP sent to your mobile/email. Please verify to complete payment.',
            'auth_token' => $transaction['auth_token'],
            'hash_key' => $transaction['hash_key'],
            'is_otp' => $transaction['is_otp'],
            'order_id' => $orderId,
            'transaction_type' => self::TYPE_BANK_ACCOUNT,
            'requires_otp' => true,
            'otp_length' => $transaction['is_otp'] ? 8 : 4,
        ];
    }

    /**
     * Complete payment with OTP
     * Final step to complete Alfa Wallet or Bank Account payment
     *
     * @param string $authToken AuthToken from initiate response
     * @param string $orderId Order reference
     * @param string $hashKey HashKey from initiate response
     * @param string $otp Customer entered OTP
     * @param bool $isOTP OTP type flag
     * @param string $transactionType Transaction type (1 or 2)
     * @return array Final payment result
     */
    public function completePaymentWithOTP($authToken, $orderId, $hashKey, $otp, $isOTP, $transactionType)
    {
        return $this->processTransaction($authToken, $orderId, $hashKey, $otp, $isOTP, $transactionType);
    }
}
