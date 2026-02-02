<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Driver;
use App\Models\RideRequest;
use App\Models\Payment;
use App\Models\Wallet;
use App\Models\RiderWallet;
use App\Models\SosAlert;
use App\Models\Chat;
use App\Models\ScheduledRide;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // User Stats
        $totalUsers = User::where('role', 'rider')->count();
        $activeUsers = User::where('role', 'rider')->where('status', 'active')->count();
        $blockedUsers = User::where('role', 'rider')->where('status', 'blocked')->count();
        $newUsersToday = User::where('role', 'rider')->whereDate('created_at', Carbon::today())->count();
        $newUsersThisWeek = User::where('role', 'rider')->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()])->count();

        // Driver Stats
        $totalDrivers = Driver::count();
        $pendingDrivers = Driver::where('status', 'pending')->count();
        $approvedDrivers = Driver::where('status', 'approved')->count();
        $rejectedDrivers = Driver::where('status', 'rejected')->count();
        $onlineDrivers = Driver::where('status', 'approved')->where('is_online', true)->count();

        // Ride Stats
        $totalRides = RideRequest::count();
        $completedRides = RideRequest::where('status', 'completed')->count();
        $cancelledRides = RideRequest::whereIn('status', ['cancelled_by_rider', 'cancelled_by_driver'])->count();
        $activeRides = RideRequest::whereIn('status', ['searching', 'driver_assigned', 'driver_arrived', 'in_progress'])->count();
        $ridesToday = RideRequest::whereDate('created_at', Carbon::today())->count();

        // Revenue Stats
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $totalCommission = Payment::where('status', 'completed')->sum('commission_amount');
        $revenueToday = Payment::where('status', 'completed')->whereDate('created_at', Carbon::today())->sum('amount');
        $revenueThisMonth = Payment::where('status', 'completed')->whereMonth('created_at', Carbon::now()->month)->sum('amount');

        // Wallet Stats
        $totalDriverWalletBalance = Wallet::sum('balance');
        $totalRiderWalletBalance = RiderWallet::sum('balance');
        $pendingWithdrawals = \App\Models\Withdrawal::where('status', 'pending')->count();

        // SOS Alerts
        $activeSOSAlerts = SosAlert::where('status', 'active')->count();
        $totalSOSAlerts = SosAlert::count();

        // Chat Stats
        $totalChats = Chat::count();
        $activeChats = Chat::where('status', 'active')->count();

        // Scheduled Rides
        $pendingScheduledRides = ScheduledRide::where('status', 'pending')->count();

        // Recent Activities
        $recentRides = RideRequest::with(['rider', 'driver'])
            ->latest()
            ->take(5)
            ->get();

        $pendingDriversList = Driver::with(['user', 'documents'])
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get();

        $recentSOSAlerts = SosAlert::with(['user', 'rideRequest'])
            ->where('status', 'active')
            ->latest()
            ->take(5)
            ->get();

        // Chart Data - Last 7 days
        $chartLabels = [];
        $ridesData = [];
        $revenueData = [];
        $usersData = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $chartLabels[] = $date->format('M d');
            $ridesData[] = RideRequest::whereDate('created_at', $date)->count();
            $revenueData[] = Payment::where('status', 'completed')->whereDate('created_at', $date)->sum('amount');
            $usersData[] = User::where('role', 'rider')->whereDate('created_at', $date)->count();
        }

        return view('admin.dashboard.index', compact(
            'totalUsers', 'activeUsers', 'blockedUsers', 'newUsersToday', 'newUsersThisWeek',
            'totalDrivers', 'pendingDrivers', 'approvedDrivers', 'rejectedDrivers', 'onlineDrivers',
            'totalRides', 'completedRides', 'cancelledRides', 'activeRides', 'ridesToday',
            'totalRevenue', 'totalCommission', 'revenueToday', 'revenueThisMonth',
            'totalDriverWalletBalance', 'totalRiderWalletBalance', 'pendingWithdrawals',
            'activeSOSAlerts', 'totalSOSAlerts',
            'totalChats', 'activeChats',
            'pendingScheduledRides',
            'recentRides', 'pendingDriversList', 'recentSOSAlerts',
            'chartLabels', 'ridesData', 'revenueData', 'usersData'
        ));
    }

    /**
     * Get real-time stats for live dashboard updates
     */
    public function realtimeStats()
    {
        return response()->json([
            'pendingDrivers' => Driver::where('status', 'pending')->count(),
            'activeAlerts' => SosAlert::where('status', 'active')->count(),
            'criticalAlerts' => \App\Models\SystemAlert::where('is_resolved', false)->where('severity', 'critical')->count(),
            'openTickets' => \App\Models\SupportTicket::where('status', 'open')->count(),
            'onlineDrivers' => Driver::where('is_online', true)->count(),
            'activeRides' => RideRequest::whereIn('status', ['searching', 'driver_assigned', 'driver_arrived', 'in_progress'])->count(),
            'todayRides' => RideRequest::whereDate('created_at', Carbon::today())->count(),
            'todayRevenue' => Payment::where('status', 'completed')->whereDate('created_at', Carbon::today())->sum('amount'),
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
