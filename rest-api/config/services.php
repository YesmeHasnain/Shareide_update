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
        'merchant_id' => env('BANKALFALAH_MERCHANT_ID'),
        'application_id' => env('BANKALFALAH_APPLICATION_ID', '0'),
        'username' => env('BANKALFALAH_USERNAME'),
        'password' => env('BANKALFALAH_PASSWORD'),
        'merchant_hash' => env('BANKALFALAH_MERCHANT_HASH'),
        'merchant_storeid' => env('BANKALFALAH_MERCHANT_STOREID'),
        'key1' => env('BANKALFALAH_KEY1'),
        'key2' => env('BANKALFALAH_KEY2'),
        'return_url' => env('BANKALFALAH_RETURN_URL'),
        'listener_url' => env('BANKALFALAH_LISTENER_URL'),
        'sandbox_url' => env('BANKALFALAH_SANDBOX_URL', 'https://sandbox.bankalfalah.com'),
        'sandbox_user' => env('BANKALFALAH_SANDBOX_USER'),
        'sandbox_password' => env('BANKALFALAH_SANDBOX_PASSWORD'),
        'sandbox' => env('APP_ENV') === 'local',
    ],

    /*
    |--------------------------------------------------------------------------
    | Google Maps Configuration
    |--------------------------------------------------------------------------
    */
    'google' => [
        'maps_key' => env('GOOGLE_MAPS_API_KEY', 'AIzaSyDyPM6e0TnfPpwQYbHufx1LfYHi-Y6FbEM'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Firebase Push Notifications
    |--------------------------------------------------------------------------
    */
    'firebase' => [
        'server_key' => env('FIREBASE_SERVER_KEY'),
        'project_id' => env('FIREBASE_PROJECT_ID'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Google Cloud Vision (CNIC OCR Verification)
    |--------------------------------------------------------------------------
    */
    'google_vision' => [
        'key' => env('GOOGLE_CLOUD_VISION_KEY'),
    ],

];
