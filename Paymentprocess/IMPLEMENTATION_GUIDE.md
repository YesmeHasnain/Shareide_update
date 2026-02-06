# Bank Alfalah Payment Gateway - SHAREIDE Implementation Guide

## Overview

SHAREIDE ab Bank Alfalah ke **teeno payment methods** support karta hai:

| Payment Method | TransactionTypeId | Mode | Status |
|----------------|-------------------|------|--------|
| **Alfa Wallet** | 1 | REST API | Implemented |
| **Alfalah Bank Account** | 2 | REST API | Implemented |
| **Credit/Debit Card** | 3 | Page Redirection | Implemented |

---

## API Endpoints

### 1. Wallet Top-up (All Methods)

```
POST /api/rider-wallet/topup
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body - Card Payment:
```json
{
    "amount": 1000,
    "method": "card"
}
```

#### Request Body - Alfa Wallet:
```json
{
    "amount": 1000,
    "method": "alfa_wallet",
    "account_number": "03001234567",
    "email": "user@example.com"
}
```

#### Request Body - Bank Account:
```json
{
    "amount": 1000,
    "method": "bank_account",
    "account_number": "1234567890123456",
    "email": "user@example.com"
}
```

---

### 2. OTP Verification (For Alfa Wallet / Bank Account)

```
POST /api/rider-wallet/verify-otp
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body:
```json
{
    "order_id": "TOPUP-123-1234567890",
    "otp": "12345678"
}
```

**Note:**
- Alfa Wallet OTP = 8 digits (SMSOTP)
- Bank Account OTP = 4 digits (SMSOTAC)

---

## Payment Flows

### Flow 1: Credit/Debit Card (Page Redirection)

```
Mobile App                    Backend                    Bank Alfalah
    |                            |                            |
    |--POST /topup (card)------->|                            |
    |                            |--Handshake /HS/HS/HS------>|
    |                            |<-------AuthToken-----------|
    |<--payment_url, form_data---|                            |
    |                            |                            |
    |====WebView opens Bank's page============================>|
    |                            |                            |
    |      User enters card details on Bank's secure page      |
    |                            |                            |
    |<====Redirect to ReturnURL (callback)====================|
    |                            |                            |
    |                            |<--Callback with status-----|
    |                            |--Verify via IPN----------->|
    |                            |<--Transaction status-------|
    |<--Success/Failed page------|                            |
```

### Flow 2: Alfa Wallet / Bank Account (REST API with OTP)

```
Mobile App                    Backend                    Bank Alfalah
    |                            |                            |
    |--POST /topup (alfa_wallet)->|                           |
    |                            |--Handshake /HS/api/HSAPI-->|
    |                            |<-------AuthToken-----------|
    |                            |--Initiate /api/Tran/DoTran->|
    |                            |<--HashKey, IsOTP flag------|
    |<--requires_otp: true-------|                            |
    |                            |      Bank sends OTP to user |
    |                            |                            |
    |   User enters OTP in app   |                            |
    |                            |                            |
    |--POST /verify-otp--------->|                            |
    |                            |--Process /api/ProcessTran-->|
    |                            |<--Payment result-----------|
    |<--Success/Failed-----------|                            |
```

---

## Environment Variables (.env)

```env
# Bank Alfalah Configuration
BANKALFALAH_TEST_MODE=true           # true for sandbox, false for production
BANKALFALAH_PRODUCTION=false         # Switch to true for live

# Merchant Credentials
BANKALFALAH_MERCHANT_ID=5504
BANKALFALAH_MERCHANT_STOREID=000827
BANKALFALAH_MERCHANT_HASH=OUU362MB1urFDSfcyEIMzk1lSk27gPZ8...

# API Credentials (from Merchant Portal)
BANKALFALAH_SANDBOX_USER=fomoka
BANKALFALAH_SANDBOX_PASSWORD=EzWFGRMYULFvFzk4yqF7CA==

# Encryption Keys (16 characters each)
BANKALFALAH_KEY1=8JkVKhdfP27dXSAE
BANKALFALAH_KEY2=3256034782861394

# URLs
BANKALFALAH_RETURN_URL=https://your-domain.com/api/wallet/payment-callback
BANKALFALAH_LISTENER_URL=https://your-domain.com/api/wallet/payment-callback
```

---

## Important URLs

### Sandbox (Testing)
- Handshake (API): `https://sandbox.bankalfalah.com/HS/api/HSAPI/HSAPI`
- Handshake (Redirect): `https://sandbox.bankalfalah.com/HS/HS/HS`
- Initiate Transaction: `https://sandbox.bankalfalah.com/HS/api/Tran/DoTran`
- Process Transaction: `https://sandbox.bankalfalah.com/HS/api/ProcessTran/ProTran`
- SSO (Card Redirect): `https://sandbox.bankalfalah.com/SSO/SSO/SSO`
- IPN Status: `https://sandbox.bankalfalah.com/HS/api/IPN/OrderStatus/{MerchantId}/{StoreId}/{OrderId}`

### Production (Live)
- Replace `sandbox.bankalfalah.com` with `payments.bankalfalah.com`

---

## Test Data (Sandbox)

### Test Cards:
```
Card Number: 4111111111111111
Expiry: 12/25
CVV: 123
```

### Test OTPs:
```
SMS OTP: 1234
Email OTP: 1234
SMS OTAC: 12341234
```

---

## Files Modified

1. **BankAlfalahService.php** - Complete payment gateway service
   - `initiateHandshake()` - Step 1 for all methods
   - `initiateTransaction()` - Step 2 for REST API
   - `processTransaction()` - Step 3 for REST API
   - `initiateAlfaWalletPayment()` - Combined flow for Alfa Wallet
   - `initiateBankAccountPayment()` - Combined flow for Bank Account
   - `createPayment()` - Card payment (Page Redirection)
   - `verifyPayment()` - Callback verification
   - `checkTransactionStatus()` - IPN status check

2. **RiderWalletController.php** - Wallet API controller
   - `topUp()` - Handles all payment methods
   - `verifyOTP()` - OTP verification for Alfa Wallet / Bank Account
   - `paymentCallback()` - Card payment callback handler

3. **routes/api.php** - Added new routes
   - `POST /api/rider-wallet/verify-otp`

---

## Mobile App Integration

### Card Payment:
1. Call `/api/rider-wallet/topup` with `method: "card"`
2. Open WebView with returned `payment_url` and `form_data`
3. Listen for navigation to callback URL
4. Parse success/failure from page content

### Alfa Wallet / Bank Account:
1. Call `/api/rider-wallet/topup` with `method: "alfa_wallet"` or `"bank_account"`
2. If `requires_otp: true`, show OTP input screen
3. Wait for user to receive and enter OTP
4. Call `/api/rider-wallet/verify-otp` with OTP
5. Handle success/failure response

---

## Security Notes

1. **RequestHash** - AES-128-CBC encrypted with Key1 (key) and Key2 (IV)
2. **Never store** sensitive credentials in mobile app
3. All API calls require Bearer token authentication
4. IPN URL should be whitelisted with Bank Alfalah

---

## Go Live Checklist

1. [ ] Get production credentials from Bank Alfalah
2. [ ] Update .env with production values
3. [ ] Set `BANKALFALAH_TEST_MODE=false`
4. [ ] Set `BANKALFALAH_PRODUCTION=true`
5. [ ] Update RETURN_URL and LISTENER_URL to production domain
6. [ ] Request IPN URL whitelisting from Bank Alfalah
7. [ ] Test with real transactions (small amounts)

---

## Support

Bank Alfalah Support: 111-225-111
Merchant Portal: https://merchants.bankalfalah.com
