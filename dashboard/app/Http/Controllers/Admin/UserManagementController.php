<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\RiderProfile;
use App\Models\RiderWallet;
use App\Models\RideRequest;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    /**
     * List all riders/users
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'rider')
            ->with(['riderProfile', 'riderWallet']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $users = $query->paginate(20)->withQueryString();

        $stats = [
            'total' => User::where('role', 'rider')->count(),
            'active' => User::where('role', 'rider')->where('status', 'active')->count(),
            'blocked' => User::where('role', 'rider')->where('status', 'blocked')->count(),
        ];

        return view('admin.users.index', compact('users', 'stats'));
    }

    /**
     * Show user details
     */
    public function show($id)
    {
        $user = User::where('role', 'rider')
            ->with(['riderProfile', 'riderWallet', 'savedPlaces', 'emergencyContacts'])
            ->findOrFail($id);

        // Ride stats
        $rideStats = [
            'total' => RideRequest::where('rider_id', $user->id)->count(),
            'completed' => RideRequest::where('rider_id', $user->id)->where('status', 'completed')->count(),
            'cancelled' => RideRequest::where('rider_id', $user->id)->whereIn('status', ['cancelled_by_rider'])->count(),
            'total_spent' => $user->riderWallet ? $user->riderWallet->total_spent : 0,
        ];

        // Recent rides
        $recentRides = RideRequest::where('rider_id', $user->id)
            ->with(['driver.user'])
            ->latest()
            ->take(10)
            ->get();

        // Wallet transactions
        $transactions = [];
        if ($user->riderWallet) {
            $transactions = $user->riderWallet->transactions()->latest()->take(10)->get();
        }

        return view('admin.users.show', compact('user', 'rideStats', 'recentRides', 'transactions'));
    }

    /**
     * Block a user
     */
    public function block(Request $request, $id)
    {
        $user = User::where('role', 'rider')->findOrFail($id);
        $user->update(['status' => 'blocked']);

        return back()->with('success', 'User blocked successfully.');
    }

    /**
     * Unblock a user
     */
    public function unblock($id)
    {
        $user = User::where('role', 'rider')->findOrFail($id);
        $user->update(['status' => 'active']);

        return back()->with('success', 'User unblocked successfully.');
    }

    /**
     * Delete user (soft delete or permanent)
     */
    public function destroy($id)
    {
        $user = User::where('role', 'rider')->findOrFail($id);

        // Check if user has active rides
        $activeRides = RideRequest::where('rider_id', $user->id)
            ->whereIn('status', ['searching', 'driver_assigned', 'driver_arrived', 'in_progress'])
            ->exists();

        if ($activeRides) {
            return back()->with('error', 'Cannot delete user with active rides.');
        }

        // Delete related data
        $user->riderProfile()->delete();
        $user->savedPlaces()->delete();
        $user->emergencyContacts()->delete();
        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }

    /**
     * Export users
     */
    public function export(Request $request)
    {
        $users = User::where('role', 'rider')
            ->with(['riderProfile', 'riderWallet'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->get();

        $filename = 'users_export_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($users) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Name', 'Phone', 'Email', 'Status', 'Wallet Balance', 'Total Rides', 'Joined Date']);

            foreach ($users as $user) {
                fputcsv($file, [
                    $user->id,
                    $user->name ?? 'N/A',
                    $user->phone,
                    $user->email ?? 'N/A',
                    $user->status,
                    $user->riderWallet->balance ?? 0,
                    $user->ridesAsRider()->count(),
                    $user->created_at->format('Y-m-d'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
