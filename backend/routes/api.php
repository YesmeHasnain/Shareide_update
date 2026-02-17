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
use App\Http\Controllers\Api\ScheduledRideController;
use App\Http\Controllers\Api\SharedRideController;
use App\Http\Controllers\Api\RideRequestController;
use App\Http\Controllers\Api\PushNotificationController;
use App\Http\Controllers\Api\RideBidController;
use App\Http\Controllers\Api\LoyaltyController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\IntercityController;

// Health check
Route::get('/ping', function () {
    return response()->json([
        'success' => true,
        'message' => 'Shareide API is running',
        'timestamp' => now(),
    ]);
});

// Pusher config (public - key is safe to expose)
Route::get('/pusher/config', function () {
    return response()->json([
        'success' => true,
        'data' => [
            'key' => config('broadcasting.connections.pusher.key'),
            'cluster' => config('broadcasting.connections.pusher.options.cluster', 'ap2'),
        ],
    ]);
});

// Broadcasting auth for private channels (Sanctum token auth)
Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
    return \Illuminate\Support\Facades\Broadcast::auth($request);
})->middleware('auth:sanctum');

// Public routes (no authentication required)
Route::prefix('auth')->group(function () {
    Route::post('/send-code', [AuthController::class, 'sendCode']);
    Route::post('/verify-code', [AuthController::class, 'verifyCode']);
    Route::post('/complete-registration', [AuthController::class, 'completeRegistration']);
});

// ============================================
// PAYMENT CALLBACKS (Public - No Auth Required)
// ============================================
Route::match(['get', 'post'], '/payment/callback', [PaymentController::class, 'paymentCallback']);
Route::match(['get', 'post'], '/wallet/payment-callback', [RiderWalletController::class, 'paymentCallback']);


// ============================================
// WEBSITE CONTACT FORM (Public - No Auth Required)
// ============================================
Route::post('/contact', [ContactController::class, 'submit']);

// ============================================
// AI CHATBOT (Public - No Auth Required)
// ============================================
Route::post('/chatbot/message', [ChatbotController::class, 'chat']);

// ============================================
// SUPPORT TICKET ACCESS (Public - Token Based)
// ============================================
Route::get('/support/ticket/{token}', [ContactController::class, 'viewTicket']);
Route::post('/support/ticket/{token}/reply', [ContactController::class, 'replyToTicket']);
Route::post('/support/ticket/{token}/activity', [ContactController::class, 'updateActivity']);
Route::post('/support/ticket/{token}/offline', [ContactController::class, 'goOffline']);
Route::post('/support/ticket/{token}/typing', [ContactController::class, 'typing']);
Route::get('/support/ticket/{token}/messages', [ContactController::class, 'getNewMessages']);
Route::get('/support/ticket/{token}/file/{messageId}', [ContactController::class, 'getAttachment']);
Route::post('/support/ticket/{token}/upload', [ContactController::class, 'uploadAttachment']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {

    // Auth routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ============================================
    // SUPPORT (Authenticated - App Users)
    // ============================================
    Route::post('/support/create', [ContactController::class, 'createAppTicket']);

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
        Route::post('/verify-otp', [RiderWalletController::class, 'verifyOTP']); // For Alfa Wallet / Bank Account
        Route::get('/payment-methods', [RiderWalletController::class, 'getPaymentMethods']);
        Route::post('/payment-methods', [RiderWalletController::class, 'addPaymentMethod']);
        Route::post('/payment-methods/{id}/default', [RiderWalletController::class, 'setDefaultMethod']);
        Route::delete('/payment-methods/{id}', [RiderWalletController::class, 'deletePaymentMethod']);
    });

    // ============================================
    // SCHEDULED RIDES (Passenger App)
    // ============================================
    Route::prefix('scheduled-rides')->group(function () {
        Route::get('/', [ScheduledRideController::class, 'index']);
        Route::post('/', [ScheduledRideController::class, 'store']);
        Route::get('/upcoming-count', [ScheduledRideController::class, 'upcomingCount']);
        Route::get('/{id}', [ScheduledRideController::class, 'show']);
        Route::put('/{id}', [ScheduledRideController::class, 'update']);
        Route::delete('/{id}', [ScheduledRideController::class, 'destroy']);
    });

    // ============================================
    // SHARED RIDES / CARPOOLING
    // ============================================
    Route::prefix('shared-rides')->group(function () {
        // Search & Browse
        Route::get('/search', [SharedRideController::class, 'search']);
        Route::get('/available', [SharedRideController::class, 'available']); // Simple nearby rides
        Route::get('/my-rides', [SharedRideController::class, 'myRides']); // Driver's posted rides
        Route::get('/my-bookings', [SharedRideController::class, 'myBookings']); // Passenger's bookings
        Route::get('/pending-requests', [SharedRideController::class, 'pendingRequests']); // Driver's pending requests
        Route::get('/{id}', [SharedRideController::class, 'show']);

        // Driver Actions
        Route::post('/create', [SharedRideController::class, 'create']);
        Route::post('/{id}/start', [SharedRideController::class, 'startRide']);
        Route::post('/{id}/complete', [SharedRideController::class, 'completeRide']);
        Route::post('/{id}/cancel', [SharedRideController::class, 'cancelRide']);

        // Bidding System
        Route::post('/{id}/bid', [SharedRideController::class, 'placeBid']);
        Route::get('/{id}/bids', [SharedRideController::class, 'getBids']);
        Route::post('/{id}/bids/{bidId}/respond', [SharedRideController::class, 'respondToBid']);

        // Chat System
        Route::get('/{id}/chat', [SharedRideController::class, 'getChat']);
        Route::post('/{id}/chat', [SharedRideController::class, 'sendChat']);

        // Passenger Actions
        Route::post('/{id}/book', [SharedRideController::class, 'book']);
        Route::post('/bookings/{bookingId}/confirm', [SharedRideController::class, 'confirmBooking']);
        Route::post('/bookings/{bookingId}/cancel', [SharedRideController::class, 'cancelBooking']);
        Route::post('/bookings/{bookingId}/rate', [SharedRideController::class, 'rateDriver']);

        // Driver Booking Management (Swipe Accept/Reject)
        Route::post('/bookings/{bookingId}/accept', [SharedRideController::class, 'acceptBooking']);
        Route::post('/bookings/{bookingId}/reject', [SharedRideController::class, 'rejectBooking']);
        Route::post('/bookings/{bookingId}/pickup', [SharedRideController::class, 'pickupPassenger']);
        Route::post('/bookings/{bookingId}/dropoff', [SharedRideController::class, 'dropoffPassenger']);
        Route::post('/bookings/{bookingId}/rate-passenger', [SharedRideController::class, 'ratePassenger']);
    });

    // ============================================
    // RIDE REQUESTS (Passenger requests ride, Driver accepts)
    // ============================================
    Route::prefix('ride-requests')->group(function () {
        Route::post('/create', [RideRequestController::class, 'create']);
        Route::get('/available', [RideRequestController::class, 'available']);
        Route::get('/my-requests', [RideRequestController::class, 'myRequests']);
        Route::post('/{id}/accept', [RideRequestController::class, 'accept']);
        Route::post('/{id}/cancel', [RideRequestController::class, 'cancel']);
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
        Route::post('/verify-cnic', [OnboardingController::class, 'verifyCnicFromSelfie']);
        Route::post('/submit', [OnboardingController::class, 'submitForApproval']);
        Route::get('/status', [OnboardingController::class, 'getStatus']);
    });

    // Driver real-time routes
    Route::prefix('driver')->group(function () {
        Route::post('/location', [DriverController::class, 'updateLocation']);
        Route::post('/status', [DriverController::class, 'updateStatus']);
        Route::get('/pending-requests', [DriverController::class, 'getPendingRequests']);
        Route::get('/active-ride', [DriverController::class, 'getActiveRide']);
        Route::get('/nearby-users', [DriverController::class, 'getNearbyUsers']);
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
    // CHAT SYSTEM (Both Apps) - Enhanced
    // ============================================
    Route::prefix('chat')->group(function () {
        Route::get('/my-chats', [ChatController::class, 'getMyChats']);
        Route::get('/ride/{rideId}', [ChatController::class, 'getChatByRide']);
        Route::get('/{chatId}/messages', [ChatController::class, 'getMessages']);
        Route::post('/{chatId}/send', [ChatController::class, 'sendMessage']);
        Route::post('/{chatId}/send-image', [ChatController::class, 'sendImage']);
        Route::post('/{chatId}/send-voice', [ChatController::class, 'sendVoice']);
        Route::post('/{chatId}/mark-read', [ChatController::class, 'markAsRead']);
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
    // PUSH NOTIFICATIONS (Enhanced)
    // ============================================
    Route::prefix('push-notifications')->group(function () {
        Route::post('/register-device', [PushNotificationController::class, 'registerDevice']);
        Route::post('/unregister-device', [PushNotificationController::class, 'unregisterDevice']);
        Route::get('/', [PushNotificationController::class, 'getNotifications']);
        Route::get('/unread-count', [PushNotificationController::class, 'getUnreadCount']);
        Route::post('/{id}/read', [PushNotificationController::class, 'markAsRead']);
        Route::post('/read-all', [PushNotificationController::class, 'markAllAsRead']);
    });

    // ============================================
    // RIDE BIDDING SYSTEM
    // ============================================
    Route::prefix('ride-bids')->group(function () {
        // Driver actions
        Route::post('/rides/{rideRequestId}/bid', [RideBidController::class, 'placeBid']);
        Route::get('/my-bids', [RideBidController::class, 'getMyBids']);
        Route::post('/{bidId}/withdraw', [RideBidController::class, 'withdrawBid']);
        Route::post('/{bidId}/accept-counter', [RideBidController::class, 'acceptCounter']);

        // Passenger actions
        Route::get('/rides/{rideRequestId}/bids', [RideBidController::class, 'getBidsForRide']);
        Route::post('/{bidId}/accept', [RideBidController::class, 'acceptBid']);
        Route::post('/{bidId}/reject', [RideBidController::class, 'rejectBid']);
        Route::post('/{bidId}/counter', [RideBidController::class, 'counterOffer']);
    });

    // ============================================
    // LOYALTY & REWARDS PROGRAM
    // ============================================
    Route::prefix('loyalty')->group(function () {
        // Dashboard & Points
        Route::get('/dashboard', [LoyaltyController::class, 'getDashboard']);
        Route::get('/tiers', [LoyaltyController::class, 'getTiers']);
        Route::get('/points-history', [LoyaltyController::class, 'getPointsHistory']);

        // Rewards
        Route::get('/rewards', [LoyaltyController::class, 'getRewards']);
        Route::post('/rewards/{rewardId}/redeem', [LoyaltyController::class, 'redeemReward']);
        Route::get('/my-redemptions', [LoyaltyController::class, 'getMyRedemptions']);

        // Achievements
        Route::get('/achievements', [LoyaltyController::class, 'getAchievements']);
        Route::get('/my-achievements', [LoyaltyController::class, 'getMyAchievements']);
    });

    // ============================================
    // RIDE TIPS
    // ============================================
    Route::post('/rides/{id}/tip', function (Illuminate\Http\Request $request, $id) {
        $request->validate(['amount' => 'required|numeric|min:1|max:5000']);
        $ride = \App\Models\RideRequest::where('rider_id', auth()->id())
            ->where('status', 'completed')
            ->findOrFail($id);
        $ride->update(['tip_amount' => $request->amount]);
        // Add tip to driver wallet
        if ($ride->driver_id) {
            $wallet = \App\Models\Wallet::firstOrCreate(
                ['user_id' => $ride->driver_id],
                ['balance' => 0, 'total_earned' => 0]
            );
            $wallet->increment('balance', $request->amount);
            $wallet->increment('total_earned', $request->amount);
            \App\Models\Transaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'tip',
                'amount' => $request->amount,
                'description' => 'Tip from rider for ride #' . $ride->id,
                'status' => 'completed',
            ]);
        }
        return response()->json(['success' => true, 'message' => 'Tip sent successfully']);
    });

    // ============================================
    // RIDE STOPS (Multi-stop)
    // ============================================
    Route::post('/rides/{id}/stops', function (Illuminate\Http\Request $request, $id) {
        $request->validate([
            'address' => 'required|string',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);
        $ride = \App\Models\RideRequest::where('rider_id', auth()->id())->findOrFail($id);
        $maxOrder = \App\Models\RideStop::where('ride_request_id', $id)->max('stop_order') ?? 0;
        $stop = \App\Models\RideStop::create([
            'ride_request_id' => $id,
            'address' => $request->address,
            'lat' => $request->lat,
            'lng' => $request->lng,
            'stop_order' => $maxOrder + 1,
        ]);
        // Add Rs. 50 per extra stop
        $ride->increment('estimated_price', 50);
        return response()->json(['success' => true, 'data' => $stop]);
    });

    Route::delete('/rides/{id}/stops/{stopId}', function ($id, $stopId) {
        $ride = \App\Models\RideRequest::where('rider_id', auth()->id())->findOrFail($id);
        \App\Models\RideStop::where('ride_request_id', $id)->where('id', $stopId)->delete();
        $ride->decrement('estimated_price', 50);
        return response()->json(['success' => true, 'message' => 'Stop removed']);
    });

    Route::get('/rides/{id}/stops', function ($id) {
        $stops = \App\Models\RideStop::where('ride_request_id', $id)->orderBy('stop_order')->get();
        return response()->json(['success' => true, 'data' => $stops]);
    });

    // ============================================
    // SHARE TRIP
    // ============================================
    Route::post('/rides/{id}/share', function ($id) {
        $ride = \App\Models\RideRequest::where('rider_id', auth()->id())->findOrFail($id);
        if (!$ride->share_token) {
            $ride->update(['share_token' => \Illuminate\Support\Str::random(32)]);
        }
        return response()->json([
            'success' => true,
            'data' => [
                'share_url' => 'https://shareide.com/track/' . $ride->id . '?token=' . $ride->share_token,
                'share_token' => $ride->share_token,
            ],
        ]);
    });

    // ============================================
    // DRIVER HEATMAP & EARNINGS SUMMARY
    // ============================================
    Route::get('/drivers/heatmap', function (Illuminate\Http\Request $request) {
        $zones = \App\Models\RideRequest::where('status', 'pending')
            ->where('created_at', '>', now()->subHours(2))
            ->selectRaw('ROUND(pickup_lat, 2) as zone_lat, ROUND(pickup_lng, 2) as zone_lng, COUNT(*) as demand')
            ->groupBy('zone_lat', 'zone_lng')
            ->orderByDesc('demand')
            ->limit(50)
            ->get();
        return response()->json(['success' => true, 'data' => $zones]);
    });

    Route::get('/drivers/nearby', function (Illuminate\Http\Request $request) {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius' => 'nullable|numeric|min:1|max:50',
        ]);
        $lat = $request->lat;
        $lng = $request->lng;
        $radius = $request->radius ?? 5;
        $drivers = \App\Models\Driver::where('is_online', true)
            ->whereNotNull('current_lat')
            ->whereNotNull('current_lng')
            ->selectRaw("*, (6371 * acos(cos(radians(?)) * cos(radians(current_lat)) * cos(radians(current_lng) - radians(?)) + sin(radians(?)) * sin(radians(current_lat)))) AS distance", [$lat, $lng, $lat])
            ->having('distance', '<', $radius)
            ->orderBy('distance')
            ->limit(20)
            ->get(['user_id', 'current_lat', 'current_lng', 'vehicle_type']);
        return response()->json(['success' => true, 'data' => $drivers]);
    });

    Route::get('/drivers/earnings/summary', function (Illuminate\Http\Request $request) {
        $period = $request->get('period', 'daily');
        $driverId = auth()->id();
        $query = \App\Models\RideRequest::where('driver_id', $driverId)->where('status', 'completed');

        switch ($period) {
            case 'daily':
                $query->whereDate('completed_at', today());
                break;
            case 'weekly':
                $query->whereBetween('completed_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'monthly':
                $query->whereMonth('completed_at', now()->month)->whereYear('completed_at', now()->year);
                break;
        }

        $rides = $query->get();
        $totalEarnings = $rides->sum('driver_earning');
        $totalTips = $rides->sum('tip_amount');
        $rideCount = $rides->count();
        $avgPerRide = $rideCount > 0 ? round($totalEarnings / $rideCount, 2) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'total_earnings' => $totalEarnings,
                'total_tips' => $totalTips,
                'ride_count' => $rideCount,
                'avg_per_ride' => $avgPerRide,
            ],
        ]);
    });

    // ============================================
    // DRIVER DESTINATION MODE
    // ============================================
    Route::post('/drivers/destination', function (Illuminate\Http\Request $request) {
        $request->validate([
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'active' => 'required|boolean',
        ]);
        $driver = \App\Models\Driver::where('user_id', auth()->id())->firstOrFail();
        $driver->update([
            'destination_lat' => $request->active ? $request->lat : null,
            'destination_lng' => $request->active ? $request->lng : null,
            'destination_active' => $request->active,
        ]);
        return response()->json(['success' => true, 'message' => $request->active ? 'Destination mode enabled' : 'Destination mode disabled']);
    });

    // ============================================
    // INTERCITY RIDES
    // ============================================
    Route::prefix('intercity')->group(function () {
        Route::post('/create', [IntercityController::class, 'create']);
        Route::get('/search', [IntercityController::class, 'search']);
        Route::post('/{id}/join', [IntercityController::class, 'join']);
        Route::post('/driver-offer', [IntercityController::class, 'createDriverOffer']);
    });

    // ============================================
    // EXISTING Driver routes (Shareide Passenger App)
    // ============================================
    Route::prefix('driver')->group(function () {
        Route::post('/register', [DriverController::class, 'register']);
        Route::get('/profile', [DriverController::class, 'profile']);
        Route::get('/stats', [DriverController::class, 'stats']);
        Route::post('/status', [DriverController::class, 'updateStatus']);
        Route::post('/location', [DriverController::class, 'updateLocation']);
        Route::get('/rides', [DriverController::class, 'getRides']);
        Route::get('/rides/active', [DriverController::class, 'getActiveRide']);
        Route::post('/rides/{id}/accept', [DriverController::class, 'acceptRide']);
        Route::post('/rides/{id}/status', [DriverController::class, 'updateRideStatus']);
        Route::get('/nearby-users', [DriverController::class, 'getNearbyUsers']);
    });

    // Ride routes (for riders)
    Route::prefix('rides')->group(function () {
        Route::post('/create', [RideController::class, 'create']);
        Route::get('/my', [RideController::class, 'myRides']);
        Route::get('/available', [RideController::class, 'getAvailableRides']);
        Route::get('/vehicle-types', [RideController::class, 'getVehicleTypes']);
        Route::post('/book', [RideController::class, 'bookRide']);
        Route::get('/active', [RideController::class, 'getActiveRide']);
        Route::get('/history', [RideController::class, 'getRideHistory']);

        // Fare estimation (before {id} wildcard)
        Route::get('/fare-estimate', [RideController::class, 'estimateFare']);

        // ============================================
        // BIDDING / UPSALE FEATURE (must be before {id} routes)
        // ============================================
        Route::get('/search-with-bidding', [RideController::class, 'searchRidesWithBidding']);
        Route::post('/book-with-bid', [RideController::class, 'createRideWithBid']);

        // Wildcard routes must come LAST
        Route::get('/{id}', [RideController::class, 'show']);
        Route::post('/{id}/cancel', [RideController::class, 'cancel']);
        Route::get('/{id}/bid-options', [RideController::class, 'getBidOptions']);
        Route::post('/{id}/increase-bid', [RideController::class, 'increaseBid']);
        Route::get('/{id}/driver-location', [RideController::class, 'getDriverLocationForRider']);
    });
});