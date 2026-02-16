<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RideRequest;
use App\Models\ScheduledRide;
use Illuminate\Http\Request;
use Carbon\Carbon;

class RideManagementController extends Controller
{
    /**
     * List all rides
     */
    public function index(Request $request)
    {
        $query = RideRequest::with(['rider', 'driver']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter by payment status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', $search)
                    ->orWhere('pickup_address', 'like', '%' . $search . '%')
                    ->orWhere('drop_address', 'like', '%' . $search . '%')
                    ->orWhereHas('rider', function ($rq) use ($search) {
                        $rq->where('name', 'like', '%' . $search . '%')
                            ->orWhere('phone', 'like', '%' . $search . '%');
                    });
            });
        }

        $query->latest();
        $rides = $query->paginate(20)->withQueryString();

        // Stats
        $stats = [
            'total' => RideRequest::count(),
            'searching' => RideRequest::where('status', 'searching')->count(),
            'in_progress' => RideRequest::where('status', 'in_progress')->count(),
            'completed' => RideRequest::where('status', 'completed')->count(),
            'cancelled' => RideRequest::whereIn('status', ['cancelled_by_rider', 'cancelled_by_driver'])->count(),
        ];

        return view('admin.rides.index', compact('rides', 'stats'));
    }

    /**
     * Show ride details
     */
    public function show($id)
    {
        $ride = RideRequest::with([
            'rider.riderProfile',
            'driver',
            'driverDetails',
            'payment',
            'chat.messages',
            'rating',
        ])->findOrFail($id);

        return view('admin.rides.show', compact('ride'));
    }

    /**
     * Active rides (live monitoring)
     */
    public function active()
    {
        $rides = RideRequest::with(['rider', 'driver'])
            ->whereIn('status', ['searching', 'driver_assigned', 'driver_arrived', 'in_progress'])
            ->latest()
            ->paginate(20);

        return view('admin.rides.active', compact('rides'));
    }

    /**
     * Cancel a ride (admin intervention)
     */
    public function cancel(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $ride = RideRequest::findOrFail($id);

        if (in_array($ride->status, ['completed', 'cancelled_by_rider', 'cancelled_by_driver'])) {
            return back()->with('error', 'Cannot cancel this ride.');
        }

        $ride->update([
            'status' => 'cancelled_by_driver', // or create a new status 'cancelled_by_admin'
            'cancelled_at' => now(),
            'cancellation_reason' => 'Admin: ' . $request->reason,
            'cancelled_by' => 'admin',
        ]);

        return back()->with('success', 'Ride cancelled successfully.');
    }

    /**
     * Scheduled rides list
     */
    public function scheduled(Request $request)
    {
        $query = ScheduledRide::with(['user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $scheduledRides = $query->latest()->paginate(20)->withQueryString();

        $stats = [
            'total' => ScheduledRide::count(),
            'pending' => ScheduledRide::where('status', 'pending')->count(),
            'booked' => ScheduledRide::where('status', 'booked')->count(),
            'completed' => ScheduledRide::where('status', 'completed')->count(),
            'cancelled' => ScheduledRide::where('status', 'cancelled')->count(),
            'failed' => ScheduledRide::where('status', 'failed')->count(),
        ];

        return view('admin.rides.scheduled', compact('scheduledRides', 'stats'));
    }

    /**
     * Export rides
     */
    public function export(Request $request)
    {
        $query = RideRequest::with(['rider', 'driver']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $rides = $query->get();

        $filename = 'rides_export_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($rides) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Rider', 'Driver', 'Pickup', 'Dropoff', 'Status', 'Fare', 'Payment Status', 'Date']);

            foreach ($rides as $ride) {
                fputcsv($file, [
                    $ride->id,
                    $ride->rider->name ?? 'N/A',
                    $ride->driver->name ?? 'N/A',
                    $ride->pickup_address,
                    $ride->drop_address,
                    $ride->status,
                    $ride->actual_price ?? $ride->estimated_price,
                    $ride->payment_status,
                    $ride->created_at->format('Y-m-d H:i'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
