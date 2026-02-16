<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SharedRide;
use App\Models\SharedRideBooking;
use Illuminate\Http\Request;

class SharedRideController extends Controller
{
    /**
     * Display all shared rides
     */
    public function index(Request $request)
    {
        $status = $request->query('status');

        $query = SharedRide::with(['driver', 'bookings.passenger'])
            ->withCount(['bookings as total_bookings', 'confirmedBookings as confirmed_bookings']);

        if ($status) {
            $query->where('status', $status);
        }

        $rides = $query->orderBy('departure_time', 'desc')->paginate(20);

        $stats = [
            'total' => SharedRide::count(),
            'open' => SharedRide::where('status', 'open')->count(),
            'full' => SharedRide::where('status', 'full')->count(),
            'in_progress' => SharedRide::where('status', 'in_progress')->count(),
            'completed' => SharedRide::where('status', 'completed')->count(),
            'cancelled' => SharedRide::where('status', 'cancelled')->count(),
        ];

        return view('admin.shared-rides.index', compact('rides', 'stats', 'status'));
    }

    /**
     * Display active shared rides
     */
    public function active()
    {
        $rides = SharedRide::with(['driver', 'bookings.passenger'])
            ->whereIn('status', ['open', 'full', 'in_progress'])
            ->where('departure_time', '>', now()->subHours(2))
            ->orderBy('departure_time', 'asc')
            ->paginate(20);

        return view('admin.shared-rides.active', compact('rides'));
    }

    /**
     * Display specific shared ride details
     */
    public function show($id)
    {
        $ride = SharedRide::with([
            'driver.driver',
            'bookings.passenger',
        ])->findOrFail($id);

        return view('admin.shared-rides.show', compact('ride'));
    }

    /**
     * Display all bookings
     */
    public function bookings(Request $request)
    {
        $status = $request->query('status');

        $query = SharedRideBooking::with(['sharedRide.driver', 'passenger']);

        if ($status) {
            $query->where('status', $status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(20);

        $stats = [
            'total' => SharedRideBooking::count(),
            'pending' => SharedRideBooking::where('status', 'pending')->count(),
            'confirmed' => SharedRideBooking::where('status', 'confirmed')->count(),
            'completed' => SharedRideBooking::where('status', 'dropped_off')->count(),
            'cancelled' => SharedRideBooking::whereIn('status', ['cancelled', 'rejected'])->count(),
        ];

        return view('admin.shared-rides.bookings', compact('bookings', 'stats', 'status'));
    }

    /**
     * Cancel a shared ride
     */
    public function cancel($id)
    {
        $ride = SharedRide::findOrFail($id);

        if (in_array($ride->status, ['completed', 'cancelled'])) {
            return redirect()->back()->with('error', 'Cannot cancel this ride');
        }

        // Cancel all related bookings
        $ride->bookings()->whereIn('status', ['pending', 'accepted', 'confirmed'])->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $ride->update(['status' => 'cancelled']);

        return redirect()->back()->with('success', 'Ride cancelled successfully');
    }

    /**
     * Cancel a booking
     */
    public function cancelBooking($id)
    {
        $booking = SharedRideBooking::findOrFail($id);

        if (in_array($booking->status, ['dropped_off', 'cancelled'])) {
            return redirect()->back()->with('error', 'Cannot cancel this booking');
        }

        $booking->cancel();

        return redirect()->back()->with('success', 'Booking cancelled successfully');
    }

    /**
     * Get stats for dashboard
     */
    public function stats()
    {
        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();

        return [
            'rides_today' => SharedRide::whereDate('created_at', $today)->count(),
            'rides_this_week' => SharedRide::where('created_at', '>=', $thisWeek)->count(),
            'bookings_today' => SharedRideBooking::whereDate('created_at', $today)->count(),
            'active_rides' => SharedRide::whereIn('status', ['open', 'full', 'in_progress'])->count(),
            'pending_bookings' => SharedRideBooking::where('status', 'pending')->count(),
            'total_earnings' => SharedRideBooking::where('status', 'dropped_off')
                ->where('payment_status', 'paid')
                ->sum('amount'),
        ];
    }
}
