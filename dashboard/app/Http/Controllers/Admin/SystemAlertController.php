<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemAlert;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class SystemAlertController extends Controller
{
    public function index(Request $request)
    {
        $query = SystemAlert::query();

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('type')) {
            $query->where('alert_type', $request->type);
        }

        if ($request->boolean('unresolved_only')) {
            $query->where('is_resolved', false);
        }

        $alerts = $query->orderBy('created_at', 'desc')->paginate(30);

        $stats = [
            'critical' => SystemAlert::where('severity', 'critical')->where('is_resolved', false)->count(),
            'warning' => SystemAlert::where('severity', 'warning')->where('is_resolved', false)->count(),
            'info' => SystemAlert::where('severity', 'info')->where('is_resolved', false)->count(),
            'total_unresolved' => SystemAlert::where('is_resolved', false)->count(),
        ];

        $alertTypes = SystemAlert::distinct()->pluck('alert_type');

        return view('admin.alerts.index', compact('alerts', 'stats', 'alertTypes'));
    }

    public function show($id)
    {
        $alert = SystemAlert::with(['readByUser', 'resolvedByUser'])->findOrFail($id);

        // Mark as read
        if (!$alert->is_read) {
            $alert->update([
                'is_read' => true,
                'read_by' => auth()->id(),
                'read_at' => now(),
            ]);
        }

        return view('admin.alerts.show', compact('alert'));
    }

    public function resolve(Request $request, $id)
    {
        $request->validate([
            'resolution_note' => 'nullable|string|max:1000',
        ]);

        $alert = SystemAlert::findOrFail($id);

        $alert->update([
            'is_resolved' => true,
            'resolved_by' => auth()->id(),
            'resolved_at' => now(),
            'resolution_note' => $request->resolution_note,
        ]);

        AuditLog::log('alert_resolved', "System alert resolved: {$alert->title}", $alert);

        return back()->with('success', 'Alert marked as resolved.');
    }

    public function bulkResolve(Request $request)
    {
        $request->validate([
            'alert_ids' => 'required|array',
            'alert_ids.*' => 'exists:system_alerts,id',
        ]);

        SystemAlert::whereIn('id', $request->alert_ids)->update([
            'is_resolved' => true,
            'resolved_by' => auth()->id(),
            'resolved_at' => now(),
        ]);

        AuditLog::log('alerts_bulk_resolved', count($request->alert_ids) . " system alerts bulk resolved");

        return back()->with('success', count($request->alert_ids) . ' alerts resolved.');
    }

    public function getUnreadCount()
    {
        return response()->json([
            'count' => SystemAlert::where('is_resolved', false)->count(),
            'critical' => SystemAlert::where('severity', 'critical')->where('is_resolved', false)->count(),
        ]);
    }
}
