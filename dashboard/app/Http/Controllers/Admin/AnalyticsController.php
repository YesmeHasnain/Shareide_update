<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Driver;
use App\Models\RideRequest;
use App\Models\Payment;
use App\Models\SosAlert;
use App\Models\SupportTicket;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', '30'); // days
        $startDate = Carbon::now()->subDays($period);
        $endDate = Carbon::now();

        // Overall Stats
        $stats = $this->getOverallStats($startDate, $endDate);

        // Chart Data
        $ridesChartData = $this->getRidesChartData($startDate, $endDate);
        $revenueChartData = $this->getRevenueChartData($startDate, $endDate);
        $usersChartData = $this->getUsersChartData($startDate, $endDate);

        // Top Performers
        $topDrivers = $this->getTopDrivers($startDate, $endDate);
        $topCities = $this->getTopCities($startDate, $endDate);

        // Ride Distribution
        $ridesByStatus = $this->getRidesByStatus($startDate, $endDate);
        $ridesByVehicleType = $this->getRidesByVehicleType($startDate, $endDate);
        $ridesByHour = $this->getRidesByHour($startDate, $endDate);

        // Payment Stats
        $paymentStats = $this->getPaymentStats($startDate, $endDate);

        return view('admin.analytics.index', compact(
            'stats',
            'ridesChartData',
            'revenueChartData',
            'usersChartData',
            'topDrivers',
            'topCities',
            'ridesByStatus',
            'ridesByVehicleType',
            'ridesByHour',
            'paymentStats',
            'period'
        ));
    }

    private function getOverallStats($startDate, $endDate)
    {
        $previousStart = $startDate->copy()->subDays($startDate->diffInDays($endDate));

        return [
            'total_rides' => [
                'current' => RideRequest::whereBetween('created_at', [$startDate, $endDate])->count(),
                'previous' => RideRequest::whereBetween('created_at', [$previousStart, $startDate])->count(),
            ],
            'completed_rides' => [
                'current' => RideRequest::where('status', 'completed')->whereBetween('created_at', [$startDate, $endDate])->count(),
                'previous' => RideRequest::where('status', 'completed')->whereBetween('created_at', [$previousStart, $startDate])->count(),
            ],
            'total_revenue' => [
                'current' => Payment::where('status', 'completed')->whereBetween('created_at', [$startDate, $endDate])->sum('amount'),
                'previous' => Payment::where('status', 'completed')->whereBetween('created_at', [$previousStart, $startDate])->sum('amount'),
            ],
            'commission_earned' => [
                'current' => Payment::where('status', 'completed')->whereBetween('created_at', [$startDate, $endDate])->sum('commission_amount'),
                'previous' => Payment::where('status', 'completed')->whereBetween('created_at', [$previousStart, $startDate])->sum('commission_amount'),
            ],
            'new_users' => [
                'current' => User::where('role', 'rider')->whereBetween('created_at', [$startDate, $endDate])->count(),
                'previous' => User::where('role', 'rider')->whereBetween('created_at', [$previousStart, $startDate])->count(),
            ],
            'new_drivers' => [
                'current' => Driver::whereBetween('created_at', [$startDate, $endDate])->count(),
                'previous' => Driver::whereBetween('created_at', [$previousStart, $startDate])->count(),
            ],
            'avg_rating' => [
                'current' => Driver::where('status', 'approved')->avg('rating_average') ?? 0,
            ],
            'cancellation_rate' => [
                'current' => $this->getCancellationRate($startDate, $endDate),
                'previous' => $this->getCancellationRate($previousStart, $startDate),
            ],
        ];
    }

    private function getCancellationRate($startDate, $endDate)
    {
        $total = RideRequest::whereBetween('created_at', [$startDate, $endDate])->count();
        if ($total == 0) return 0;

        $cancelled = RideRequest::whereIn('status', ['cancelled_by_rider', 'cancelled_by_driver'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        return round(($cancelled / $total) * 100, 1);
    }

    private function getRidesChartData($startDate, $endDate)
    {
        $days = $startDate->diffInDays($endDate);
        $interval = $days > 60 ? 'week' : 'day';

        $format = $interval === 'week' ? '%Y-%u' : '%Y-%m-%d';
        $labelFormat = $interval === 'week' ? 'W' : 'M d';

        $rides = RideRequest::select(
            DB::raw("DATE_FORMAT(created_at, '{$format}') as period"),
            DB::raw('COUNT(*) as total'),
            DB::raw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed"),
            DB::raw("SUM(CASE WHEN status IN ('cancelled_by_rider', 'cancelled_by_driver') THEN 1 ELSE 0 END) as cancelled")
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return [
            'labels' => $rides->pluck('period'),
            'total' => $rides->pluck('total'),
            'completed' => $rides->pluck('completed'),
            'cancelled' => $rides->pluck('cancelled'),
        ];
    }

    private function getRevenueChartData($startDate, $endDate)
    {
        $revenue = Payment::select(
            DB::raw("DATE(created_at) as date"),
            DB::raw('SUM(amount) as total'),
            DB::raw('SUM(commission_amount) as commission'),
            DB::raw('SUM(driver_earning) as driver_earnings')
        )
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'labels' => $revenue->pluck('date')->map(fn($d) => Carbon::parse($d)->format('M d')),
            'total' => $revenue->pluck('total'),
            'commission' => $revenue->pluck('commission'),
            'driver_earnings' => $revenue->pluck('driver_earnings'),
        ];
    }

    private function getUsersChartData($startDate, $endDate)
    {
        $users = User::select(
            DB::raw("DATE(created_at) as date"),
            DB::raw("SUM(CASE WHEN role = 'rider' THEN 1 ELSE 0 END) as riders"),
            DB::raw("SUM(CASE WHEN role = 'driver' THEN 1 ELSE 0 END) as drivers")
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'labels' => $users->pluck('date')->map(fn($d) => Carbon::parse($d)->format('M d')),
            'riders' => $users->pluck('riders'),
            'drivers' => $users->pluck('drivers'),
        ];
    }

    private function getTopDrivers($startDate, $endDate)
    {
        return Driver::select('drivers.*')
            ->selectRaw('(SELECT COUNT(*) FROM ride_requests WHERE ride_requests.driver_id = drivers.user_id AND status = "completed" AND created_at BETWEEN ? AND ?) as rides_count', [$startDate, $endDate])
            ->selectRaw('(SELECT SUM(driver_earning) FROM payments WHERE payments.driver_id = drivers.id AND status = "completed" AND created_at BETWEEN ? AND ?) as earnings', [$startDate, $endDate])
            ->with('user')
            ->where('status', 'approved')
            ->orderByDesc('rides_count')
            ->take(10)
            ->get();
    }

    private function getTopCities($startDate, $endDate)
    {
        return Driver::select('city')
            ->selectRaw('COUNT(*) as driver_count')
            ->selectRaw('SUM(completed_rides_count) as total_rides')
            ->where('status', 'approved')
            ->groupBy('city')
            ->orderByDesc('total_rides')
            ->take(10)
            ->get();
    }

    private function getRidesByStatus($startDate, $endDate)
    {
        return RideRequest::select('status')
            ->selectRaw('COUNT(*) as count')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');
    }

    private function getRidesByVehicleType($startDate, $endDate)
    {
        return RideRequest::select('ride_requests.id')
            ->join('drivers', 'drivers.user_id', '=', 'ride_requests.driver_id')
            ->select('drivers.vehicle_type')
            ->selectRaw('COUNT(*) as count')
            ->whereBetween('ride_requests.created_at', [$startDate, $endDate])
            ->groupBy('drivers.vehicle_type')
            ->get()
            ->pluck('count', 'vehicle_type');
    }

    private function getRidesByHour($startDate, $endDate)
    {
        return RideRequest::select(
            DB::raw('HOUR(created_at) as hour'),
            DB::raw('COUNT(*) as count')
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->pluck('count', 'hour');
    }

    private function getPaymentStats($startDate, $endDate)
    {
        return Payment::select('payment_method')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('SUM(amount) as total')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('payment_method')
            ->get();
    }

    // Export analytics data
    public function export(Request $request)
    {
        $period = $request->get('period', '30');
        $startDate = Carbon::now()->subDays($period);
        $endDate = Carbon::now();

        $stats = $this->getOverallStats($startDate, $endDate);

        $filename = 'analytics_' . date('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($stats, $startDate, $endDate) {
            $file = fopen('php://output', 'w');

            fputcsv($file, ['SHAREIDE Analytics Report']);
            fputcsv($file, ['Period: ' . $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d')]);
            fputcsv($file, []);
            fputcsv($file, ['Metric', 'Current Period', 'Previous Period', 'Change %']);

            foreach ($stats as $key => $value) {
                $current = $value['current'] ?? 0;
                $previous = $value['previous'] ?? 0;
                $change = $previous > 0 ? round((($current - $previous) / $previous) * 100, 1) : 0;

                fputcsv($file, [
                    ucwords(str_replace('_', ' ', $key)),
                    is_numeric($current) ? number_format($current, 2) : $current,
                    is_numeric($previous) ? number_format($previous, 2) : $previous,
                    $change . '%'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
