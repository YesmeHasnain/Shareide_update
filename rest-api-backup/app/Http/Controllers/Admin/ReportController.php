<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Driver;
use App\Models\RideRequest;
use App\Models\Payment;
use App\Models\Wallet;
use App\Models\RiderWallet;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Revenue report
     */
    public function revenue(Request $request)
    {
        $period = $request->get('period', 'month');
        $year = $request->get('year', date('Y'));
        $month = $request->get('month', date('m'));

        // Daily revenue for the selected month
        $dailyRevenue = Payment::where('status', 'completed')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(amount) as total_amount'),
                DB::raw('SUM(commission_amount) as total_commission'),
                DB::raw('COUNT(*) as total_transactions')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Monthly revenue for the year
        $monthlyRevenue = Payment::where('status', 'completed')
            ->whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(amount) as total_amount'),
                DB::raw('SUM(commission_amount) as total_commission'),
                DB::raw('COUNT(*) as total_transactions')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Revenue by payment method
        $revenueByMethod = Payment::where('status', 'completed')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->select(
                'payment_method',
                DB::raw('SUM(amount) as total_amount'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('payment_method')
            ->get();

        // Summary stats
        $summary = [
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'total_commission' => Payment::where('status', 'completed')->sum('commission_amount'),
            'this_month_revenue' => Payment::where('status', 'completed')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->sum('amount'),
            'this_month_commission' => Payment::where('status', 'completed')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->sum('commission_amount'),
        ];

        return view('admin.reports.revenue', compact('dailyRevenue', 'monthlyRevenue', 'revenueByMethod', 'summary', 'year', 'month'));
    }

    /**
     * Rides report
     */
    public function rides(Request $request)
    {
        $year = $request->get('year', date('Y'));
        $month = $request->get('month', date('m'));

        // Daily rides for the month
        $dailyRides = RideRequest::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed"),
                DB::raw("SUM(CASE WHEN status IN ('cancelled_by_rider', 'cancelled_by_driver') THEN 1 ELSE 0 END) as cancelled")
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Rides by status
        $ridesByStatus = RideRequest::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        // Peak hours analysis
        $peakHours = RideRequest::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Popular routes
        $popularRoutes = RideRequest::where('status', 'completed')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->select(
                'pickup_address',
                'drop_address',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('pickup_address', 'drop_address')
            ->orderByDesc('count')
            ->take(10)
            ->get();

        // Summary
        $summary = [
            'total_rides' => RideRequest::count(),
            'this_month_rides' => RideRequest::whereYear('created_at', $year)->whereMonth('created_at', $month)->count(),
            'completion_rate' => RideRequest::whereYear('created_at', $year)->whereMonth('created_at', $month)->count() > 0
                ? round(RideRequest::whereYear('created_at', $year)->whereMonth('created_at', $month)->where('status', 'completed')->count() / RideRequest::whereYear('created_at', $year)->whereMonth('created_at', $month)->count() * 100, 1)
                : 0,
            'avg_fare' => RideRequest::where('status', 'completed')->avg('actual_price') ?? 0,
        ];

        return view('admin.reports.rides', compact('dailyRides', 'ridesByStatus', 'peakHours', 'popularRoutes', 'summary', 'year', 'month'));
    }

    /**
     * Users report
     */
    public function users(Request $request)
    {
        $year = $request->get('year', date('Y'));

        // Monthly user signups
        $monthlySignups = User::where('role', 'rider')
            ->whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // User activity (rides per user)
        $userActivity = User::where('role', 'rider')
            ->withCount(['ridesAsRider', 'ridesAsRider as completed_rides_count' => function ($q) {
                $q->where('status', 'completed');
            }])
            ->orderByDesc('rides_as_rider_count')
            ->take(20)
            ->get();

        // User retention (users who made rides in last 30 days)
        $activeUsers30Days = User::where('role', 'rider')
            ->whereHas('ridesAsRider', function ($q) {
                $q->where('created_at', '>=', Carbon::now()->subDays(30));
            })
            ->count();

        $summary = [
            'total_users' => User::where('role', 'rider')->count(),
            'new_this_year' => User::where('role', 'rider')->whereYear('created_at', $year)->count(),
            'active_last_30_days' => $activeUsers30Days,
            'blocked_users' => User::where('role', 'rider')->where('status', 'blocked')->count(),
        ];

        return view('admin.reports.users', compact('monthlySignups', 'userActivity', 'summary', 'year'));
    }

    /**
     * Drivers report
     */
    public function drivers(Request $request)
    {
        $year = $request->get('year', date('Y'));

        // Top performing drivers
        $topDrivers = Driver::where('status', 'approved')
            ->with('user')
            ->orderByDesc('completed_rides_count')
            ->take(20)
            ->get();

        // Driver earnings
        $driverEarnings = Wallet::with('driver.user')
            ->orderByDesc('total_earned')
            ->take(20)
            ->get();

        // Online drivers by hour (current day pattern)
        $onlinePattern = Driver::where('status', 'approved')
            ->where('is_online', true)
            ->select('city', DB::raw('COUNT(*) as count'))
            ->groupBy('city')
            ->get();

        // Driver ratings distribution
        $ratingDistribution = Driver::where('status', 'approved')
            ->where('rating_average', '>', 0)
            ->select(
                DB::raw('FLOOR(rating_average) as rating'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('rating')
            ->orderBy('rating')
            ->get();

        $summary = [
            'total_drivers' => Driver::count(),
            'approved_drivers' => Driver::where('status', 'approved')->count(),
            'online_now' => Driver::where('status', 'approved')->where('is_online', true)->count(),
            'avg_rating' => Driver::where('status', 'approved')->where('rating_average', '>', 0)->avg('rating_average') ?? 0,
            'total_earnings' => Wallet::sum('total_earned'),
        ];

        return view('admin.reports.drivers', compact('topDrivers', 'driverEarnings', 'onlinePattern', 'ratingDistribution', 'summary', 'year'));
    }

    /**
     * Export report
     */
    public function export(Request $request)
    {
        $type = $request->get('type', 'revenue');
        $dateFrom = $request->get('date_from', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->get('date_to', Carbon::now()->format('Y-m-d'));

        $filename = "{$type}_report_{$dateFrom}_to_{$dateTo}.csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($type, $dateFrom, $dateTo) {
            $file = fopen('php://output', 'w');

            switch ($type) {
                case 'revenue':
                    fputcsv($file, ['Date', 'Total Amount', 'Commission', 'Transactions']);
                    $data = Payment::where('status', 'completed')
                        ->whereDate('created_at', '>=', $dateFrom)
                        ->whereDate('created_at', '<=', $dateTo)
                        ->select(
                            DB::raw('DATE(created_at) as date'),
                            DB::raw('SUM(amount) as total'),
                            DB::raw('SUM(commission_amount) as commission'),
                            DB::raw('COUNT(*) as count')
                        )
                        ->groupBy('date')
                        ->get();
                    foreach ($data as $row) {
                        fputcsv($file, [$row->date, $row->total, $row->commission, $row->count]);
                    }
                    break;

                case 'rides':
                    fputcsv($file, ['Date', 'Total Rides', 'Completed', 'Cancelled']);
                    $data = RideRequest::whereDate('created_at', '>=', $dateFrom)
                        ->whereDate('created_at', '<=', $dateTo)
                        ->select(
                            DB::raw('DATE(created_at) as date'),
                            DB::raw('COUNT(*) as total'),
                            DB::raw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed"),
                            DB::raw("SUM(CASE WHEN status IN ('cancelled_by_rider', 'cancelled_by_driver') THEN 1 ELSE 0 END) as cancelled")
                        )
                        ->groupBy('date')
                        ->get();
                    foreach ($data as $row) {
                        fputcsv($file, [$row->date, $row->total, $row->completed, $row->cancelled]);
                    }
                    break;
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
