<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\DriverDocument;
use App\Models\User;
use App\Models\Wallet;
use App\Models\BannedCnic;
use App\Models\LiveSelfieVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DriverManagementController extends Controller
{
    /**
     * List all drivers with filters
     */
    public function index(Request $request)
    {
        $query = Driver::with(['user', 'documents']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by vehicle type
        if ($request->filled('vehicle_type')) {
            $query->where('vehicle_type', $request->vehicle_type);
        }

        // Filter by city
        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        // Search by name, phone, plate number
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', '%' . $search . '%')
                        ->orWhere('phone', 'like', '%' . $search . '%');
                })
                ->orWhere('plate_number', 'like', '%' . $search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $drivers = $query->paginate(15)->withQueryString();

        // Stats for sidebar
        $stats = [
            'total' => Driver::count(),
            'pending' => Driver::where('status', 'pending')->count(),
            'approved' => Driver::where('status', 'approved')->count(),
            'rejected' => Driver::where('status', 'rejected')->count(),
            'blocked' => Driver::where('status', 'blocked')->count(),
            'online' => Driver::where('status', 'approved')->where('is_online', true)->count(),
        ];

        return view('admin.drivers.index', compact('drivers', 'stats'));
    }

    /**
     * Pending drivers for approval
     */
    public function pending()
    {
        $drivers = Driver::with(['user', 'documents'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->paginate(15);

        return view('admin.drivers.pending', compact('drivers'));
    }

    /**
     * Show driver details
     */
    public function show($id)
    {
        $driver = Driver::with([
            'user',
            'documents',
            'wallet',
            'wallet.transactions' => function ($q) {
                $q->latest()->take(10);
            },
            'ratings' => function ($q) {
                $q->latest()->take(10);
            },
            'liveSelfieVerifications' => function ($q) {
                $q->latest()->take(8);
            }
        ])->findOrFail($id);

        // Driver ride stats
        $rideStats = [
            'total' => $driver->ridesAsDriver()->count(),
            'completed' => $driver->ridesAsDriver()->where('status', 'completed')->count(),
            'cancelled' => $driver->ridesAsDriver()->whereIn('status', ['cancelled_by_driver'])->count(),
            'total_earnings' => $driver->wallet ? $driver->wallet->total_earned : 0,
        ];

        // Recent rides
        $recentRides = $driver->ridesAsDriver()
            ->with('rider')
            ->latest()
            ->take(10)
            ->get();

        return view('admin.drivers.show', compact('driver', 'rideStats', 'recentRides'));
    }

    /**
     * Approve a driver
     */
    public function approve(Request $request, $id)
    {
        $driver = Driver::findOrFail($id);

        if ($driver->status !== 'pending') {
            return back()->with('error', 'Driver is not in pending status.');
        }

        DB::transaction(function () use ($driver) {
            // Update driver status
            $driver->update(['status' => 'approved']);

            // Update document verification status
            if ($driver->documents) {
                $driver->documents->update([
                    'verification_status' => 'verified',
                    'verified_at' => now(),
                ]);
            }

            // Create wallet for driver if not exists
            if (!$driver->wallet) {
                Wallet::create([
                    'driver_id' => $driver->id,
                    'balance' => 0,
                    'total_earned' => 0,
                    'total_withdrawn' => 0,
                    'pending_amount' => 0,
                ]);
            }

            // TODO: Send approval notification to driver (SMS/Push)
        });

        return back()->with('success', 'Driver approved successfully!');
    }

    /**
     * Reject a driver
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $driver = Driver::findOrFail($id);

        if ($driver->status !== 'pending') {
            return back()->with('error', 'Driver is not in pending status.');
        }

        $driver->update(['status' => 'rejected']);

        if ($driver->documents) {
            $driver->documents->update([
                'verification_status' => 'rejected',
                'rejection_reason' => $request->rejection_reason,
            ]);
        }

        // TODO: Send rejection notification to driver

        return back()->with('success', 'Driver rejected.');
    }

    /**
     * Block a driver
     */
    public function block(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
            'ban_cnic' => 'nullable|boolean',
        ]);

        $driver = Driver::findOrFail($id);

        DB::transaction(function () use ($driver, $request) {
            // Update driver status
            $driver->update([
                'status' => 'blocked',
                'is_online' => false,
                'ban_reason' => $request->reason,
                'banned_at' => now(),
            ]);

            // Also block user account
            $driver->user->update(['status' => 'blocked']);

            // Ban CNIC if requested and CNIC exists
            if ($request->ban_cnic && $driver->cnic) {
                BannedCnic::firstOrCreate(
                    ['cnic' => $driver->cnic],
                    [
                        'name' => $driver->cnic_name ?? $driver->user->name,
                        'reason' => $request->reason,
                        'banned_by' => auth()->id(),
                        'original_driver_id' => $driver->id,
                    ]
                );
            }
        });

        $message = 'Driver blocked successfully.';
        if ($request->ban_cnic && $driver->cnic) {
            $message .= ' CNIC has been banned - they cannot register again.';
        }

        return back()->with('success', $message);
    }

    /**
     * Unblock a driver
     */
    public function unblock($id)
    {
        $driver = Driver::findOrFail($id);
        $driver->update(['status' => 'approved']);
        $driver->user->update(['status' => 'active']);

        return back()->with('success', 'Driver unblocked successfully.');
    }

    /**
     * View driver documents
     */
    public function documents($id)
    {
        $driver = Driver::with(['user', 'documents'])->findOrFail($id);
        return view('admin.drivers.documents', compact('driver'));
    }

    /**
     * Export drivers list
     */
    public function export(Request $request)
    {
        $drivers = Driver::with(['user'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->get();

        $filename = 'drivers_export_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($drivers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Name', 'Phone', 'Vehicle Type', 'Plate Number', 'City', 'Status', 'Rating', 'Completed Rides', 'Joined Date']);

            foreach ($drivers as $driver) {
                fputcsv($file, [
                    $driver->id,
                    $driver->user->name ?? 'N/A',
                    $driver->user->phone ?? 'N/A',
                    $driver->vehicle_type,
                    $driver->plate_number,
                    $driver->city,
                    $driver->status,
                    $driver->rating_average,
                    $driver->completed_rides_count,
                    $driver->created_at->format('Y-m-d'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
