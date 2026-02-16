<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SosAlert;
use App\Models\EmergencyContact;
use Illuminate\Http\Request;

class SOSManagementController extends Controller
{
    /**
     * List all SOS alerts
     */
    public function index(Request $request)
    {
        $query = SosAlert::with(['user', 'rideRequest.driver.user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $alerts = $query->latest()->paginate(20)->withQueryString();

        $stats = [
            'total' => SosAlert::count(),
            'active' => SosAlert::where('status', 'active')->count(),
            'resolved' => SosAlert::where('status', 'resolved')->count(),
            'today' => SosAlert::whereDate('created_at', today())->count(),
        ];

        return view('admin.sos.index', compact('alerts', 'stats'));
    }

    /**
     * Active SOS alerts (priority view)
     */
    public function active()
    {
        $alerts = SosAlert::with(['user', 'rideRequest.driver.user', 'rideRequest.rider'])
            ->where('status', 'active')
            ->latest()
            ->get();

        return view('admin.sos.active', compact('alerts'));
    }

    /**
     * Show SOS alert details
     */
    public function show($id)
    {
        $alert = SosAlert::with([
            'user',
            'rideRequest.rider',
            'rideRequest.driver.user',
            'rideRequest.driver.vehicle',
        ])->findOrFail($id);

        // Get user's emergency contacts
        $emergencyContacts = EmergencyContact::where('user_id', $alert->user_id)->get();

        return view('admin.sos.show', compact('alert', 'emergencyContacts'));
    }

    /**
     * Resolve an SOS alert
     */
    public function resolve(Request $request, $id)
    {
        $request->validate([
            'resolution_note' => 'required|string|max:1000',
        ]);

        $alert = SosAlert::findOrFail($id);

        $alert->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolution_note' => $request->resolution_note,
        ]);

        return back()->with('success', 'SOS alert resolved successfully.');
    }

    /**
     * Mark alert as false alarm
     */
    public function falseAlarm(Request $request, $id)
    {
        $alert = SosAlert::findOrFail($id);

        $alert->update([
            'status' => 'false_alarm',
            'resolved_at' => now(),
            'resolution_note' => 'Marked as false alarm: ' . ($request->note ?? 'No note provided'),
        ]);

        return back()->with('success', 'Alert marked as false alarm.');
    }

    /**
     * Notify police about an alert
     */
    public function notifyPolice($id)
    {
        $alert = SosAlert::with(['user', 'rideRequest'])->findOrFail($id);

        // TODO: Implement actual police notification (API, SMS, etc.)

        $alert->update(['police_notified' => true]);

        return back()->with('success', 'Police notification sent.');
    }

    /**
     * Send notification to emergency contacts
     */
    public function notifyContacts($id)
    {
        $alert = SosAlert::with('user')->findOrFail($id);
        $contacts = EmergencyContact::where('user_id', $alert->user_id)->get();

        // TODO: Implement actual notification (SMS, WhatsApp, etc.)

        $alert->update(['contacts_notified' => true]);

        return back()->with('success', 'Emergency contacts notified. (' . $contacts->count() . ' contacts)');
    }

    /**
     * Export SOS report
     */
    public function export(Request $request)
    {
        $query = SosAlert::with(['user', 'rideRequest']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $alerts = $query->get();

        $filename = 'sos_alerts_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($alerts) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'User', 'Phone', 'Type', 'Location', 'Ride ID', 'Status', 'Created At', 'Resolved At']);

            foreach ($alerts as $alert) {
                fputcsv($file, [
                    $alert->id,
                    $alert->user->name ?? 'N/A',
                    $alert->user->phone ?? 'N/A',
                    $alert->type,
                    $alert->location_address ?? "{$alert->latitude}, {$alert->longitude}",
                    $alert->ride_request_id,
                    $alert->status,
                    $alert->created_at->format('Y-m-d H:i'),
                    $alert->resolved_at ? $alert->resolved_at->format('Y-m-d H:i') : 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
