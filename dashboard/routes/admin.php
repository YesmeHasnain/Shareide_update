<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DriverManagementController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\RideManagementController;
use App\Http\Controllers\Admin\AdminChatController;
use App\Http\Controllers\Admin\PaymentManagementController;
use App\Http\Controllers\Admin\PromoCodeManagementController;
use App\Http\Controllers\Admin\SOSManagementController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\MapController;
use App\Http\Controllers\Admin\FareManagementController;
use App\Http\Controllers\Admin\SupportTicketController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\AdminRoleController;
use App\Http\Controllers\Admin\SystemAlertController;
use App\Http\Controllers\Admin\BulkActionController;
use App\Http\Controllers\Admin\SharedRideController;
use App\Http\Controllers\Admin\LoyaltyController;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// Auth routes (public)
Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
Route::post('/login', [AdminAuthController::class, 'login'])->name('admin.login.post');
Route::post('/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

// Protected admin routes
Route::middleware(['auth', 'admin'])->group(function () {

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('admin.dashboard');

    // Real-time Stats API (for live dashboard updates)
    Route::get('/api/realtime-stats', [DashboardController::class, 'realtimeStats'])->name('admin.realtime-stats');

    // Driver Management
    Route::prefix('drivers')->name('admin.drivers.')->group(function () {
        Route::get('/', [DriverManagementController::class, 'index'])->name('index');
        Route::get('/pending', [DriverManagementController::class, 'pending'])->name('pending');
        Route::get('/export', [DriverManagementController::class, 'export'])->name('export');
        Route::get('/{id}', [DriverManagementController::class, 'show'])->name('show');
        Route::get('/{id}/documents', [DriverManagementController::class, 'documents'])->name('documents');
        Route::post('/{id}/approve', [DriverManagementController::class, 'approve'])->name('approve');
        Route::post('/{id}/reject', [DriverManagementController::class, 'reject'])->name('reject');
        Route::post('/{id}/block', [DriverManagementController::class, 'block'])->name('block');
        Route::post('/{id}/unblock', [DriverManagementController::class, 'unblock'])->name('unblock');
    });

    // User Management
    Route::prefix('users')->name('admin.users.')->group(function () {
        Route::get('/', [UserManagementController::class, 'index'])->name('index');
        Route::get('/export', [UserManagementController::class, 'export'])->name('export');
        Route::get('/{id}', [UserManagementController::class, 'show'])->name('show');
        Route::post('/{id}/block', [UserManagementController::class, 'block'])->name('block');
        Route::post('/{id}/unblock', [UserManagementController::class, 'unblock'])->name('unblock');
        Route::delete('/{id}', [UserManagementController::class, 'destroy'])->name('destroy');
    });

    // Ride Management
    Route::prefix('rides')->name('admin.rides.')->group(function () {
        Route::get('/', [RideManagementController::class, 'index'])->name('index');
        Route::get('/active', [RideManagementController::class, 'active'])->name('active');
        Route::get('/scheduled', [RideManagementController::class, 'scheduled'])->name('scheduled');
        Route::get('/export', [RideManagementController::class, 'export'])->name('export');
        Route::get('/{id}', [RideManagementController::class, 'show'])->name('show');
        Route::post('/{id}/cancel', [RideManagementController::class, 'cancel'])->name('cancel');
    });

    // Shared Rides / Carpooling Management
    Route::prefix('shared-rides')->name('admin.shared-rides.')->group(function () {
        Route::get('/', [SharedRideController::class, 'index'])->name('index');
        Route::get('/active', [SharedRideController::class, 'active'])->name('active');
        Route::get('/bookings', [SharedRideController::class, 'bookings'])->name('bookings');
        Route::get('/{id}', [SharedRideController::class, 'show'])->name('show');
        Route::post('/{id}/cancel', [SharedRideController::class, 'cancel'])->name('cancel');
        Route::post('/bookings/{id}/cancel', [SharedRideController::class, 'cancelBooking'])->name('cancel-booking');
    });

    // Chat Management
    Route::prefix('chats')->name('admin.chats.')->group(function () {
        Route::get('/', [AdminChatController::class, 'index'])->name('index');
        Route::get('/search', [AdminChatController::class, 'searchMessages'])->name('search');
        Route::get('/{id}', [AdminChatController::class, 'show'])->name('show');
        Route::get('/{id}/export', [AdminChatController::class, 'export'])->name('export');
        Route::post('/{id}/toggle-lock', [AdminChatController::class, 'toggleLock'])->name('toggle-lock');
        Route::delete('/{chatId}/messages/{messageId}', [AdminChatController::class, 'deleteMessage'])->name('delete-message');
    });

    // Payment Management
    Route::prefix('payments')->name('admin.payments.')->group(function () {
        Route::get('/', [PaymentManagementController::class, 'index'])->name('index');
        Route::get('/withdrawals', [PaymentManagementController::class, 'withdrawals'])->name('withdrawals');
        Route::get('/driver-wallets', [PaymentManagementController::class, 'driverWallets'])->name('driver-wallets');
        Route::get('/rider-wallets', [PaymentManagementController::class, 'riderWallets'])->name('rider-wallets');
        Route::get('/transactions', [PaymentManagementController::class, 'transactions'])->name('transactions');
        Route::post('/withdrawals/{id}/approve', [PaymentManagementController::class, 'approveWithdrawal'])->name('approve-withdrawal');
        Route::post('/withdrawals/{id}/reject', [PaymentManagementController::class, 'rejectWithdrawal'])->name('reject-withdrawal');
        Route::post('/{id}/refund', [PaymentManagementController::class, 'refund'])->name('refund');
    });

    // Promo Code Management
    Route::prefix('promo-codes')->name('admin.promo-codes.')->group(function () {
        Route::get('/', [PromoCodeManagementController::class, 'index'])->name('index');
        Route::get('/create', [PromoCodeManagementController::class, 'create'])->name('create');
        Route::post('/', [PromoCodeManagementController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [PromoCodeManagementController::class, 'edit'])->name('edit');
        Route::put('/{id}', [PromoCodeManagementController::class, 'update'])->name('update');
        Route::post('/{id}/toggle', [PromoCodeManagementController::class, 'toggleStatus'])->name('toggle');
        Route::delete('/{id}', [PromoCodeManagementController::class, 'destroy'])->name('destroy');
        Route::get('/{id}/usage', [PromoCodeManagementController::class, 'usageHistory'])->name('usage');
    });

    // SOS Management
    Route::prefix('sos')->name('admin.sos.')->group(function () {
        Route::get('/', [SOSManagementController::class, 'index'])->name('index');
        Route::get('/active', [SOSManagementController::class, 'active'])->name('active');
        Route::get('/export', [SOSManagementController::class, 'export'])->name('export');
        Route::get('/{id}', [SOSManagementController::class, 'show'])->name('show');
        Route::post('/{id}/resolve', [SOSManagementController::class, 'resolve'])->name('resolve');
        Route::post('/{id}/false-alarm', [SOSManagementController::class, 'falseAlarm'])->name('false-alarm');
        Route::post('/{id}/notify-police', [SOSManagementController::class, 'notifyPolice'])->name('notify-police');
        Route::post('/{id}/notify-contacts', [SOSManagementController::class, 'notifyContacts'])->name('notify-contacts');
    });

    // Reports
    Route::prefix('reports')->name('admin.reports.')->group(function () {
        Route::get('/revenue', [ReportController::class, 'revenue'])->name('revenue');
        Route::get('/rides', [ReportController::class, 'rides'])->name('rides');
        Route::get('/users', [ReportController::class, 'users'])->name('users');
        Route::get('/drivers', [ReportController::class, 'drivers'])->name('drivers');
        Route::get('/export', [ReportController::class, 'export'])->name('export');
    });

    // Settings
    Route::prefix('settings')->name('admin.settings.')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::post('/general', [SettingsController::class, 'updateGeneral'])->name('general');
        Route::post('/commission', [SettingsController::class, 'updateCommission'])->name('commission');
        Route::post('/pricing', [SettingsController::class, 'updatePricing'])->name('pricing');
        Route::post('/notifications', [SettingsController::class, 'updateNotifications'])->name('notifications');
        Route::get('/profile', [SettingsController::class, 'profile'])->name('profile');
        Route::post('/profile', [SettingsController::class, 'updateProfile'])->name('profile.update');
        Route::delete('/profile/photo', [SettingsController::class, 'removePhoto'])->name('profile.photo.remove');
        Route::post('/password', [SettingsController::class, 'updatePassword'])->name('password');
        Route::get('/admin-users', [SettingsController::class, 'adminUsers'])->name('admin-users');
        Route::post('/admin-users', [SettingsController::class, 'createAdmin'])->name('admin-users.create');
        Route::delete('/admin-users/{id}', [SettingsController::class, 'deleteAdmin'])->name('admin-users.delete');
        Route::post('/clear-cache', [SettingsController::class, 'clearCache'])->name('clear-cache');
    });

    // Analytics Dashboard
    Route::prefix('analytics')->name('admin.analytics.')->group(function () {
        Route::get('/', [AnalyticsController::class, 'index'])->name('index');
        Route::get('/export', [AnalyticsController::class, 'export'])->name('export');
    });

    // Live Map
    Route::prefix('map')->name('admin.map.')->group(function () {
        Route::get('/', [MapController::class, 'index'])->name('index');
        Route::get('/live-data', [MapController::class, 'liveData'])->name('live-data');
        Route::get('/driver/{id}', [MapController::class, 'driverDetails'])->name('driver');
        Route::get('/ride/{id}', [MapController::class, 'rideDetails'])->name('ride');
    });

    // Fare & Commission Management
    Route::prefix('fare')->name('admin.fare.')->group(function () {
        Route::get('/', [FareManagementController::class, 'index'])->name('index');
        Route::post('/store', [FareManagementController::class, 'storeFare'])->name('store');
        Route::delete('/{id}', [FareManagementController::class, 'deleteFare'])->name('delete');
        Route::post('/calculate', [FareManagementController::class, 'calculateFare'])->name('calculate');
    });
    Route::prefix('surge')->name('admin.surge.')->group(function () {
        Route::post('/store', [FareManagementController::class, 'storeSurge'])->name('store');
        Route::post('/{id}/deactivate', [FareManagementController::class, 'deactivateSurge'])->name('deactivate');
    });
    Route::prefix('commission')->name('admin.commission.')->group(function () {
        Route::post('/store', [FareManagementController::class, 'storeCommission'])->name('store');
        Route::delete('/{id}', [FareManagementController::class, 'deleteCommission'])->name('delete');
    });
    Route::prefix('zone')->name('admin.zone.')->group(function () {
        Route::post('/store', [FareManagementController::class, 'storeZone'])->name('store');
        Route::delete('/{id}', [FareManagementController::class, 'deleteZone'])->name('delete');
    });

    // Support Tickets
    Route::prefix('support')->name('admin.support.')->group(function () {
        Route::get('/', [SupportTicketController::class, 'index'])->name('index');
        Route::get('/{id}', [SupportTicketController::class, 'show'])->name('show');
        Route::post('/{id}/reply', [SupportTicketController::class, 'reply'])->name('reply');
        Route::post('/{id}/status', [SupportTicketController::class, 'updateStatus'])->name('status');
        Route::post('/{id}/priority', [SupportTicketController::class, 'updatePriority'])->name('priority');
        Route::post('/{id}/assign', [SupportTicketController::class, 'assign'])->name('assign');
        Route::get('/{id}/guest-activity', [SupportTicketController::class, 'guestActivity'])->name('guest-activity');
        Route::post('/{id}/typing', [SupportTicketController::class, 'typing'])->name('typing');
        Route::get('/{id}/messages', [SupportTicketController::class, 'getMessages'])->name('messages');
        Route::get('/{id}/file/{messageId}', [SupportTicketController::class, 'getAttachment'])->name('file');
        Route::post('/{id}/upload', [SupportTicketController::class, 'uploadAttachment'])->name('upload');
    });

    // Audit Logs
    Route::prefix('audit')->name('admin.audit.')->group(function () {
        Route::get('/', [AuditLogController::class, 'index'])->name('index');
        Route::get('/export', [AuditLogController::class, 'export'])->name('export');
        Route::get('/{id}', [AuditLogController::class, 'show'])->name('show');
    });

    // Admin Roles & Users
    Route::prefix('roles')->name('admin.roles.')->group(function () {
        Route::get('/', [AdminRoleController::class, 'index'])->name('index');
        Route::post('/store', [AdminRoleController::class, 'createRole'])->name('store');
        Route::put('/{id}', [AdminRoleController::class, 'updateRole'])->name('update');
        Route::delete('/{id}', [AdminRoleController::class, 'deleteRole'])->name('delete');
        Route::post('/admin/store', [AdminRoleController::class, 'createAdmin'])->name('admin.store');
        Route::put('/admin/{id}', [AdminRoleController::class, 'updateAdmin'])->name('admin.update');
        Route::post('/admin/{id}/toggle', [AdminRoleController::class, 'toggleAdminStatus'])->name('admin.toggle');
        Route::delete('/admin/{id}', [AdminRoleController::class, 'deleteAdmin'])->name('admin.delete');
    });

    // System Alerts
    Route::prefix('alerts')->name('admin.alerts.')->group(function () {
        Route::get('/', [SystemAlertController::class, 'index'])->name('index');
        Route::get('/unread-count', [SystemAlertController::class, 'getUnreadCount'])->name('unread-count');
        Route::get('/{id}', [SystemAlertController::class, 'show'])->name('show');
        Route::post('/{id}/resolve', [SystemAlertController::class, 'resolve'])->name('resolve');
        Route::post('/bulk-resolve', [SystemAlertController::class, 'bulkResolve'])->name('bulk-resolve');
    });

    // Bulk Actions
    Route::prefix('bulk')->name('admin.bulk.')->group(function () {
        Route::post('/drivers', [BulkActionController::class, 'driversAction'])->name('drivers');
        Route::post('/riders', [BulkActionController::class, 'ridersAction'])->name('riders');
        Route::post('/rides', [BulkActionController::class, 'ridesAction'])->name('rides');
        Route::post('/tickets', [BulkActionController::class, 'ticketsAction'])->name('tickets');
    });

    // Loyalty & Rewards Management
    Route::prefix('loyalty')->name('admin.loyalty.')->group(function () {
        Route::get('/', [LoyaltyController::class, 'index'])->name('index');
        Route::get('/tiers', [LoyaltyController::class, 'tiers'])->name('tiers');
        Route::post('/tiers', [LoyaltyController::class, 'storeTier'])->name('tiers.store');
        Route::put('/tiers/{id}', [LoyaltyController::class, 'updateTier'])->name('tiers.update');
        Route::get('/rewards', [LoyaltyController::class, 'rewards'])->name('rewards');
        Route::post('/rewards', [LoyaltyController::class, 'storeReward'])->name('rewards.store');
        Route::put('/rewards/{id}', [LoyaltyController::class, 'updateReward'])->name('rewards.update');
        Route::post('/rewards/{id}/toggle', [LoyaltyController::class, 'toggleReward'])->name('rewards.toggle');
        Route::get('/achievements', [LoyaltyController::class, 'achievements'])->name('achievements');
        Route::post('/achievements', [LoyaltyController::class, 'storeAchievement'])->name('achievements.store');
        Route::get('/redemptions', [LoyaltyController::class, 'redemptions'])->name('redemptions');
        Route::get('/users/{userId}/points', [LoyaltyController::class, 'userPoints'])->name('user-points');
        Route::post('/users/{userId}/add-points', [LoyaltyController::class, 'addPoints'])->name('add-points');
    });
});
