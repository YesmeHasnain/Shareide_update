<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Twilio WhatsApp Configuration
    |--------------------------------------------------------------------------
    */
    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_AUTH_TOKEN'),
        'whatsapp_from' => env('TWILIO_WHATSAPP_FROM', '+14155238886'), // Twilio sandbox number
    ],

    /*
    |--------------------------------------------------------------------------
    | Bank Alfalah Payment Gateway
    |--------------------------------------------------------------------------
    */
    'bank_alfalah' => [
        'merchant_id' => env('BANK_ALFALAH_MERCHANT_ID'),
        'merchant_key' => env('BANK_ALFALAH_MERCHANT_KEY'),
        'merchant_name' => env('BANK_ALFALAH_MERCHANT_NAME', 'SHAREIDE'),
        'currency' => env('BANK_ALFALAH_CURRENCY', 'PKR'),
        'base_url' => env('BANK_ALFALAH_BASE_URL', 'https://payments.bankalfalah.com'),
        'return_url' => env('BANK_ALFALAH_RETURN_URL'),
        'sandbox' => env('BANK_ALFALAH_SANDBOX', true),
    ],

];
