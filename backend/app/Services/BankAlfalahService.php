<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Bank Alfalah Payment Gateway (APG) Service
 *
 * Per APG Merchant Integration Guide v1.1, ALL 3 payment methods
 * use Page Redirection mode (ChannelId = 1001):
 *
 * TransactionTypeId:
 *   1 = Alfa Wallet
 *   2 = Alfalah Bank Account
 *   3 = Credit/Debit Card
 *
 * Flow (2-step):
 *   Step 1: Server POST to /HS/HS/HS → get AuthToken
 *   Step 2: WebView POST to /SSO/SSO/SSO → customer sees APG checkout page
 *   After payment: customer redirected to ReturnURL with ?TS=P/RC=00/RD=/O=OrderId
 *   IPN: GET /HS/api/IPN/OrderStatus/{MerchantId}/{StoreId}/{OrderId}
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

    // Channel ID - Page Redirection for ALL methods per PDF v1.1
    const CHANNEL_REDIRECT = '1001';

    // Transaction Type IDs
    const TYPE_ALFA_WALLET = '1';
    const TYPE_BANK_ACCOUNT = '2';
    const TYPE_CARD = '3';
    const TYPE_JAZZCASH = '4';
    const TYPE_EASYPAISA = '5';

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
        $this->productionUrl = 'https://payments.bankalfalah.com';

        $testMode = env('BANKALFALAH_TEST_MODE', false);
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
     * Parse Bank Alfalah response (may be double-encoded JSON)
     */
    private function parseResponse($response)
    {
        $data = $response->json();

        if (is_string($data)) {
            $data = json_decode($data, true);
        }

        if (!is_array($data)) {
            Log::error('Bank Alfalah unparseable response', [
                'status' => $response->status(),
                'body' => substr($response->body(), 0, 500),
            ]);
            return null;
        }

        return $data;
    }

    private function getBaseUrl()
    {
        return $this->isProduction ? $this->productionUrl : $this->sandboxUrl;
    }

    /**
     * Generate AES-128-CBC encrypted RequestHash
     * Key = Key1 (16 bytes), IV = Key2 (16 bytes)
     */
    private function generateRequestHash(array $params)
    {
        if (empty($this->key1) || empty($this->key2)) {
            throw new \Exception('Bank Alfalah encryption keys are not configured');
        }

        if (strlen($this->key1) !== 16 || strlen($this->key2) !== 16) {
            throw new \Exception('Bank Alfalah encryption keys must be exactly 16 bytes');
        }

        // Build map string: key1=value1&key2=value2&...
        $mapString = '';
        foreach ($params as $key => $value) {
            $mapString .= $key . '=' . $value . '&';
        }
        $mapString = rtrim($mapString, '&');

        Log::debug('RequestHash map string', ['mapString' => $mapString]);

        $encrypted = openssl_encrypt(
            $mapString,
            'AES-128-CBC',
            $this->key1,
            OPENSSL_RAW_DATA,
            $this->key2
        );

        if ($encrypted === false) {
            throw new \Exception('Failed to generate payment RequestHash');
        }

        return base64_encode($encrypted);
    }

    /**
     * Initiate payment via Page Redirection (all 3 methods).
     *
     * Step 1: Server-side POST to /HS/HS/HS → get AuthToken
     * Step 2: Build SSO form data for WebView to POST to /SSO/SSO/SSO
     *
     * @param string $orderId Unique order reference
     * @param float $amount Payment amount
     * @param string $transactionTypeId '1'=Alfa Wallet, '2'=Bank Account, '3'=Card
     * @return array SSO form data on success
     */
    public function initiateRedirectionPayment($orderId, $amount, $transactionTypeId = '3')
    {
        $amount = number_format($amount, 2, '.', '');

        // =============================================
        // STEP 1: Handshake (server-side POST to /HS/HS/HS)
        // =============================================
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

        $handshakeParams = $paramsForHash;
        $handshakeParams['HS_RequestHash'] = $this->generateRequestHash($paramsForHash);

        $hsUrl = $this->getBaseUrl() . '/HS/HS/HS';

        Log::info('Bank Alfalah Step 1 - Handshake', [
            'url' => $hsUrl,
            'order_id' => $orderId,
            'amount' => $amount,
            'type_id' => $transactionTypeId,
        ]);

        try {
            // Don't follow redirects - Bank Alfalah returns 302 with AuthToken in URL
            $response = Http::timeout(30)
                ->withOptions(['allow_redirects' => false])
                ->asForm()
                ->post($hsUrl, $handshakeParams);

            $authToken = null;

            Log::info('Bank Alfalah Handshake Response', [
                'status' => $response->status(),
                'headers' => $response->headers(),
                'body' => substr($response->body(), 0, 500),
            ]);

            // Bank Alfalah returns 302 redirect with AuthToken in Location URL
            if ($response->status() === 302 || $response->status() === 301) {
                $location = $response->header('Location');

                if (!$location) {
                    return [
                        'success' => false,
                        'error' => 'Bank Alfalah returned redirect without Location header',
                    ];
                }

                Log::info('Bank Alfalah redirect URL', ['location' => $location]);

                // Parse query params manually - parse_str() converts + to space which corrupts AuthToken
                $queryString = parse_url($location, PHP_URL_QUERY);
                $queryParams = [];
                foreach (explode('&', $queryString ?? '') as $pair) {
                    $kv = explode('=', $pair, 2);
                    if (count($kv) === 2) {
                        $queryParams[rawurldecode($kv[0])] = rawurldecode($kv[1]);
                    }
                }

                if (($queryParams['success'] ?? '') === 'true' && !empty($queryParams['AuthToken'])) {
                    $authToken = $queryParams['AuthToken']; // Already decoded by rawurldecode above
                } else {
                    return [
                        'success' => false,
                        'error' => $queryParams['ErrorMessage'] ?? 'Handshake failed',
                    ];
                }
            } else {
                // Fallback: try parsing as JSON (some endpoints return JSON)
                $data = $this->parseResponse($response);

                if (!$data) {
                    return [
                        'success' => false,
                        'error' => 'Invalid response from Bank Alfalah (HTTP ' . $response->status() . ')',
                    ];
                }

                $success = $data['success'] ?? null;
                if ($success !== 'true' && $success !== true) {
                    return [
                        'success' => false,
                        'error' => $data['ErrorMessage'] ?? 'Handshake failed - check merchant credentials',
                    ];
                }

                $authToken = $data['AuthToken'];
            }

            if (empty($authToken)) {
                return [
                    'success' => false,
                    'error' => 'No AuthToken received from Bank Alfalah',
                ];
            }

            Log::info('Bank Alfalah AuthToken received', [
                'token_length' => strlen($authToken),
                'order_id' => $orderId,
            ]);

        } catch (\Exception $e) {
            Log::error('Bank Alfalah Handshake Error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => 'Connection to payment gateway failed: ' . $e->getMessage(),
            ];
        }

        // =============================================
        // STEP 2: Server-side POST to /SSO/SSO/SSO
        // Do this server-side to avoid WebView form encoding issues with + signs in AuthToken
        // =============================================
        $ssoParamsForHash = [
            'AuthToken' => $authToken,
            'ChannelId' => self::CHANNEL_REDIRECT,
            'Currency' => 'PKR',
            'ReturnURL' => $this->returnUrl,
            'MerchantId' => $this->merchantId,
            'StoreId' => $this->storeId,
            'MerchantHash' => $this->merchantHash,
            'MerchantUsername' => $this->merchantUsername ?? '',
            'MerchantPassword' => $this->merchantPassword ?? '',
            'TransactionTypeId' => $transactionTypeId,
            'TransactionReferenceNumber' => $orderId,
            'TransactionAmount' => $amount,
        ];

        $ssoParams = $ssoParamsForHash;
        $ssoParams['RequestHash'] = $this->generateRequestHash($ssoParamsForHash);

        $ssoUrl = $this->getBaseUrl() . '/SSO/SSO/SSO';

        Log::info('Bank Alfalah Step 2 - SSO POST (server-side)', [
            'sso_url' => $ssoUrl,
            'order_id' => $orderId,
            'amount' => $amount,
            'type_id' => $transactionTypeId,
            'auth_token_has_plus' => strpos($authToken, '+') !== false,
        ]);

        try {
            $ssoResponse = Http::timeout(30)
                ->withOptions(['allow_redirects' => false])
                ->asForm()
                ->post($ssoUrl, $ssoParams);

            Log::info('Bank Alfalah SSO Response', [
                'status' => $ssoResponse->status(),
                'location' => $ssoResponse->header('Location'),
            ]);

            if ($ssoResponse->status() === 302 || $ssoResponse->status() === 301) {
                $checkoutUrl = $ssoResponse->header('Location');

                if (empty($checkoutUrl)) {
                    return [
                        'success' => false,
                        'error' => 'Bank Alfalah SSO returned redirect without checkout URL',
                    ];
                }

                return [
                    'success' => true,
                    'payment_url' => $checkoutUrl,
                    'order_id' => $orderId,
                    'amount' => $amount,
                    'method' => 'GET',
                ];
            }

            // If not a redirect, check response body for errors
            $ssoBody = $ssoResponse->body();
            Log::error('Bank Alfalah SSO unexpected response', [
                'status' => $ssoResponse->status(),
                'body' => substr($ssoBody, 0, 500),
            ]);

            return [
                'success' => false,
                'error' => 'Bank Alfalah SSO failed (HTTP ' . $ssoResponse->status() . ')',
            ];

        } catch (\Exception $e) {
            Log::error('Bank Alfalah SSO Error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => 'SSO connection failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Create Card payment (TransactionTypeId = 3)
     */
    public function createPayment($orderId, $amount, $description = 'Shareide Wallet Top-up')
    {
        return $this->initiateRedirectionPayment($orderId, $amount, self::TYPE_CARD);
    }

    /**
     * Create Alfa Wallet payment (TransactionTypeId = 1)
     */
    public function createAlfaWalletPayment($orderId, $amount)
    {
        return $this->initiateRedirectionPayment($orderId, $amount, self::TYPE_ALFA_WALLET);
    }

    /**
     * Create Bank Account payment (TransactionTypeId = 2)
     */
    public function createBankAccountPayment($orderId, $amount)
    {
        return $this->initiateRedirectionPayment($orderId, $amount, self::TYPE_BANK_ACCOUNT);
    }

    /**
     * Create JazzCash payment (TransactionTypeId = 4)
     */
    public function createJazzCashPayment($orderId, $amount)
    {
        return $this->initiateRedirectionPayment($orderId, $amount, self::TYPE_JAZZCASH);
    }

    /**
     * Create Easypaisa payment (TransactionTypeId = 5)
     */
    public function createEasypaisaPayment($orderId, $amount)
    {
        return $this->initiateRedirectionPayment($orderId, $amount, self::TYPE_EASYPAISA);
    }

    /**
     * Verify payment callback / Check transaction status via IPN
     *
     * After payment, customer is redirected to ReturnURL with params:
     * ?TS=P/RC=00/RD=/O=OrderId
     */
    public function verifyPayment($callbackData)
    {
        Log::info('Bank Alfalah Callback Received', $callbackData);

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
     * GET /HS/api/IPN/OrderStatus/{MerchantId}/{StoreId}/{OrderId}
     */
    public function checkTransactionStatus($orderId)
    {
        $ipnUrl = $this->getBaseUrl() . "/HS/api/IPN/OrderStatus/{$this->merchantId}/{$this->storeId}/{$orderId}";

        try {
            Log::info('Checking IPN status', ['url' => $ipnUrl]);

            $response = Http::timeout(30)->get($ipnUrl);
            $data = $response->json();

            // Bank Alfalah IPN returns double-encoded JSON (string inside string)
            if (is_string($data)) {
                $data = json_decode($data, true);
            }

            Log::info('IPN Response', is_array($data) ? $data : ['raw' => substr(json_encode($data), 0, 500)]);

            if (is_array($data) && isset($data['TransactionStatus'])) {
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
        } catch (\Throwable $e) {
            Log::error('IPN check failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Refund payment (not yet implemented by Bank Alfalah)
     */
    public function refundPayment($transactionId, $amount)
    {
        Log::info('Refund requested', [
            'transaction_id' => $transactionId,
            'amount' => $amount,
        ]);

        return [
            'success' => false,
            'error' => 'Refund not implemented yet',
        ];
    }
}
