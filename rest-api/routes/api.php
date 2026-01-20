<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\RideController;
use App\Http\Controllers\Api\OnboardingController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PromoCodeController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\EmergencyController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\SavedPlacesController;
use App\Http\Controllers\Api\RiderWalletController;
use App\Http\Controllers\Admin\ChatManagementController;

// Health check
Route::get('/ping', function () {
    return response()->json([
        'success' => true,
        'message' => 'Shareide API is running',
        'timestamp' => now(),
    ]);
});

// Public routes (no authentication required)
Route::prefix('auth')->group(function () {
    Route::post('/send-code', [AuthController::class, 'sendCode']);
    Route::post('/verify-code', [AuthController::class, 'verifyCode']);
    Route::post('/complete-registration', [AuthController::class, 'completeRegistration']);
});

// ============================================
// PAYMENT CALLBACK (Public - No Auth Required)
// ============================================
Route::post('/payment/callback', [PaymentController::class, 'paymentCallback']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {

    // Auth routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile routes (for riders)
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'getProfile']);
        Route::put('/', [ProfileController::class, 'updateProfile']);
        Route::post('/', [ProfileController::class, 'updateProfile']);
    });

    // ============================================
    // SAVED PLACES (Passenger App)
    // ============================================
    Route::prefix('saved-places')->group(function () {
        Route::get('/', [SavedPlacesController::class, 'index']);
        Route::post('/', [SavedPlacesController::class, 'store']);
        Route::put('/{id}', [SavedPlacesController::class, 'update']);
        Route::delete('/{id}', [SavedPlacesController::class, 'destroy']);
    });

    // ============================================
    // RIDER WALLET (Passenger App)
    // ============================================
    Route::prefix('rider-wallet')->group(function () {
        Route::get('/balance', [RiderWalletController::class, 'getBalance']);
        Route::get('/transactions', [RiderWalletController::class, 'getTransactions']);
        Route::post('/topup', [RiderWalletController::class, 'topUp']);
        Route::get('/payment-methods', [RiderWalletController::class, 'getPaymentMethods']);
        Route::post('/payment-methods', [RiderWalletController::class, 'addPaymentMethod']);
        Route::post('/payment-methods/{id}/default', [RiderWalletController::class, 'setDefaultMethod']);
        Route::delete('/payment-methods/{id}', [RiderWalletController::class, 'deletePaymentMethod']);
    });

    // ============================================
    // SHAREIDE PLUS (Driver App) Routes
    // ============================================

    // Onboarding routes (5-step registration)
    Route::prefix('onboarding')->group(function () {
        Route::post('/personal-info', [OnboardingController::class, 'personalInfo']);
        Route::post('/vehicle-info', [OnboardingController::class, 'vehicleInfo']);
        Route::post('/upload-documents', [OnboardingController::class, 'uploadDocuments']);
        Route::post('/upload-selfies', [OnboardingController::class, 'uploadSelfies']);
        Route::post('/submit', [OnboardingController::class, 'submitForApproval']);
        Route::get('/status', [OnboardingController::class, 'getStatus']);
    });

    // Schedule routes (Daily routes management)
    Route::prefix('schedules')->group(function () {
        Route::get('/', [ScheduleController::class, 'index']);
        Route::post('/', [ScheduleController::class, 'store']);
        Route::get('/{id}', [ScheduleController::class, 'show']);
        Route::put('/{id}', [ScheduleController::class, 'update']);
        Route::delete('/{id}', [ScheduleController::class, 'destroy']);
        Route::post('/{id}/toggle', [ScheduleController::class, 'toggleActive']);
    });

    // Wallet routes (Earnings & Withdrawals)
    Route::prefix('wallet')->group(function () {
        Route::get('/balance', [WalletController::class, 'getBalance']);
        Route::get('/transactions', [WalletController::class, 'getTransactions']);
        Route::get('/earnings', [WalletController::class, 'getEarnings']);
        Route::post('/withdraw', [WalletController::class, 'requestWithdrawal']);
        Route::get('/withdrawals', [WalletController::class, 'getWithdrawals']);
        Route::post('/withdrawals/{id}/cancel', [WalletController::class, 'cancelWithdrawal']);
    });

    // ============================================
    // CHAT SYSTEM (Both Apps)
    // ============================================
    Route::prefix('chat')->group(function () {
        Route::get('/my-chats', [ChatController::class, 'getMyChats']);
        Route::get('/ride/{rideId}', [ChatController::class, 'getChatByRide']);
        Route::get('/{chatId}/messages', [ChatController::class, 'getMessages']);
        Route::post('/{chatId}/send', [ChatController::class, 'sendMessage']);
        Route::post('/{chatId}/send-image', [ChatController::class, 'sendImage']);
    });

    // ============================================
    // NOTIFICATIONS
    // ============================================
    Route::prefix('notifications')->group(function () {
        Route::post('/register-token', [NotificationController::class, 'registerToken']);
        Route::get('/', [NotificationController::class, 'getNotifications']);
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'deleteNotification']);
    });

    // ============================================
    // PAYMENT SYSTEM
    // ============================================
    Route::prefix('payments')->group(function () {
        Route::post('/rides/{rideId}/cash', [PaymentController::class, 'processCashPayment']);
        Route::post('/rides/{rideId}/card', [PaymentController::class, 'processCardPayment']);
        Route::get('/history', [PaymentController::class, 'getPaymentHistory']);
        Route::get('/{id}', [PaymentController::class, 'getPaymentDetails']);
    });

    // ============================================
    // PROMO CODES
    // ============================================
    Route::prefix('promo-codes')->group(function () {
        Route::get('/active', [PromoCodeController::class, 'getActivePromoCodes']);
        Route::post('/validate', [PromoCodeController::class, 'validateCode']);
        Route::post('/apply', [PromoCodeController::class, 'applyPromoCode']);
        Route::get('/usage-history', [PromoCodeController::class, 'getUsageHistory']);
    });

    // ============================================
    // REFERRAL SYSTEM
    // ============================================
    Route::prefix('referrals')->group(function () {
        Route::get('/my-code', [ReferralController::class, 'getReferralCode']);
        Route::post('/apply', [ReferralController::class, 'applyReferralCode']);
        Route::get('/history', [ReferralController::class, 'getReferralHistory']);
    });

    // ============================================
    // EMERGENCY & SOS
    // ============================================
    Route::prefix('emergency')->group(function () {
        Route::get('/contacts', [EmergencyController::class, 'getContacts']);
        Route::post('/contacts', [EmergencyController::class, 'addContact']);
        Route::put('/contacts/{id}', [EmergencyController::class, 'updateContact']);
        Route::delete('/contacts/{id}', [EmergencyController::class, 'deleteContact']);
        Route::post('/sos', [EmergencyController::class, 'triggerSOS']);
        Route::get('/sos-history', [EmergencyController::class, 'getSOSHistory']);
    });

    // ============================================
    // RATINGS & REVIEWS
    // ============================================
    Route::prefix('ratings')->group(function () {
        Route::post('/rides/{rideId}/rate-driver', [RatingController::class, 'rateDriver']);
        Route::post('/rides/{rideId}/rate-rider', [RatingController::class, 'rateRider']);
        Route::get('/drivers/{driverId}', [RatingController::class, 'getDriverRatings']);
        Route::get('/my-ratings', [RatingController::class, 'getRiderRatings']);
    });

    // ============================================
    // EXISTING Driver routes (Shareide Passenger App)
    // ============================================
    Route::prefix('driver')->group(function () {
        Route::post('/register', [DriverController::class, 'register']);
        Route::get('/profile', [DriverController::class, 'profile']);
        Route::post('/status', [DriverController::class, 'updateStatus']);
        Route::post('/location', [DriverController::class, 'updateLocation']);
        Route::get('/rides', [DriverController::class, 'getRides']);
        Route::get('/rides/active', [DriverController::class, 'getActiveRide']);
        Route::post('/rides/{id}/accept', [DriverController::class, 'acceptRide']);
        Route::post('/rides/{id}/status', [DriverController::class, 'updateRideStatus']);
    });

    // Ride routes (for riders)
    Route::prefix('rides')->group(function () {
        Route::post('/create', [RideController::class, 'create']);
        Route::get('/my', [RideController::class, 'myRides']);
        Route::get('/available', [RideController::class, 'getAvailableRides']);
        Route::post('/book', [RideController::class, 'bookRide']);
        Route::get('/active', [RideController::class, 'getActiveRide']);
        Route::get('/history', [RideController::class, 'getRideHistory']);
        Route::get('/{id}', [RideController::class, 'show']);
        Route::post('/{id}/cancel', [RideController::class, 'cancel']);
    });
});

// ============================================
// ADMIN ROUTES
// ============================================
Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    
    // Chat Management
    Route::prefix('chats')->group(function () {
        Route::get('/', [ChatManagementController::class, 'getAllChats']);
        Route::get('/stats', [ChatManagementController::class, 'getChatStats']);
        Route::get('/search', [ChatManagementController::class, 'searchMessages']);
        Route::get('/{chatId}', [ChatManagementController::class, 'getChatDetails']);
        Route::post('/{chatId}/toggle-lock', [ChatManagementController::class, 'toggleChatLock']);
        Route::delete('/messages/{messageId}', [ChatManagementController::class, 'deleteMessage']);
        Route::get('/{chatId}/export', [ChatManagementController::class, 'exportChatHistory']);
    });
});