<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BankAlfalahService
{
    private $merchantId;
    private $applicationId;
    private $username;
    private $password;
    private $returnUrl;
    private $merchantHash;
    private $sandboxUrl;
    private $sandboxUser;
    private $sandboxPassword;
    private $storeId;
    private $key1;
    private $key2;
    private $listenerUrl;

    public function __construct()
    {
        $this->merchantId = env('BANKALFALAH_MERCHANT_ID');
        $this->applicationId = env('BANKALFALAH_APPLICATION_ID');
        $this->username = env('BANKALFALAH_USERNAME');
        $this->password = env('BANKALFALAH_PASSWORD');
        $this->returnUrl = env('BANKALFALAH_RETURN_URL');
        $this->merchantHash = env('BANKALFALAH_MERCHANT_HASH');
        $this->sandboxUrl = env('BANKALFALAH_SANDBOX_URL');
        $this->sandboxUser = env('BANKALFALAH_SANDBOX_USER');
        $this->sandboxPassword = env('BANKALFALAH_SANDBOX_PASSWORD');
        $this->storeId = env('BANKALFALAH_MERCHANT_STOREID');
        $this->key1 = env('BANKALFALAH_KEY1');
        $this->key2 = env('BANKALFALAH_KEY2');
        $this->listenerUrl = env('BANKALFALAH_LISTENER_URL');
    }

    /**
     * Generate secure hash for transaction
     */
    private function generateHash($orderId, $amount, $currency = 'PKR')
    {
        // Bank Alfalah Hash Formula: StoreId + OrderId + Amount + Currency + Key1 + Key2
        $hashString = $this->storeId . $orderId . $amount . $currency . $this->key1 . $this->key2;
        return hash('sha256', $hashString);
    }

    /**
     * Create payment request
     */
    public function createPayment($orderId, $amount, $description = 'Shareide Ride Payment')
    {
        $amount = number_format($amount, 2, '.', ''); // Format: 100.00
        
        $requestData = [
            'HS_MerchantId' => $this->merchantId,
            'HS_StoreId' => $this->storeId,
            'HS_MerchantHash' => $this->merchantHash,
            'HS_MerchantUsername' => $this->username,
            'HS_MerchantPassword' => $this->password,
            'HS_IsRedirectionRequest' => '1',
            'HS_ReturnURL' => $this->returnUrl,
            'HS_RequestHash' => $this->generateHash($orderId, $amount),
            'HS_ChannelId' => '1001', // Web
            'HS_TransactionReferenceNumber' => $orderId,
            'txnamt' => $amount,
            'basketid' => $orderId,
            'orderrefnum' => $orderId,
            'txndesc' => $description,
            'proccode' => '00',
        ];

        try {
            Log::info('Bank Alfalah Payment Request', [
                'order_id' => $orderId,
                'amount' => $amount,
                'request_data' => $requestData
            ]);

            // Return form data for frontend to submit
            return [
                'success' => true,
                'payment_url' => $this->sandboxUrl . '/HS/HS/HS',
                'form_data' => $requestData,
                'method' => 'POST'
            ];
        } catch (\Exception $e) {
            Log::error('Bank Alfalah Payment Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify payment callback
     */
    public function verifyPayment($callbackData)
    {
        Log::info('Bank Alfalah Callback Received', $callbackData);

        $receivedHash = $callbackData['HS_TransactionHash'] ?? '';
        $transactionId = $callbackData['HS_TransactionReferenceNumber'] ?? '';
        $amount = $callbackData['txnamt'] ?? '';
        $responseCode = $callbackData['HS_ResponseCode'] ?? '';
        
        $calculatedHash = $this->generateHash($transactionId, $amount);

        // Response Code 00 = Success
        if ($responseCode === '00' && $receivedHash === $calculatedHash) {
            return [
                'success' => true,
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'status' => 'completed',
                'response_code' => $responseCode,
                'bank_transaction_id' => $callbackData['HS_TransactionId'] ?? null
            ];
        }

        return [
            'success' => false,
            'error' => 'Payment failed or hash mismatch',
            'response_code' => $responseCode,
            'transaction_id' => $transactionId
        ];
    }

    /**
     * Refund payment
     */
    public function refundPayment($transactionId, $amount)
    {
        $amount = number_format($amount, 2, '.', '');
        
        $requestData = [
            'HS_MerchantId' => $this->merchantId,
            'HS_StoreId' => $this->storeId,
            'HS_MerchantHash' => $this->merchantHash,
            'HS_MerchantUsername' => $this->username,
            'HS_MerchantPassword' => $this->password,
            'HS_TransactionReferenceNumber' => $transactionId,
            'HS_RefundAmount' => $amount,
            'HS_RequestHash' => $this->generateHash($transactionId, $amount),
        ];

        try {
            $response = Http::asForm()->post($this->sandboxUrl . '/HS/api/refund', $requestData);

            Log::info('Bank Alfalah Refund Request', [
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'response' => $response->json()
            ]);

            return [
                'success' => $response->json()['success'] ?? false,
                'refund_id' => $response->json()['refund_id'] ?? null,
                'response' => $response->json()
            ];
        } catch (\Exception $e) {
            Log::error('Bank Alfalah Refund Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}