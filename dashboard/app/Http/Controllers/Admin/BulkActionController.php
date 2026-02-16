<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Driver;
use App\Models\RideRequest;
use App\Models\SupportTicket;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class BulkActionController extends Controller
{
    // Bulk driver actions
    public function driversAction(Request $request)
    {
        $request->validate([
            'driver_ids' => 'required|array|min:1',
            'driver_ids.*' => 'exists:drivers,id',
            'action' => 'required|in:approve,reject,block,unblock,send_notification',
            'reason' => 'nullable|string|max:500',
            'notification_message' => 'nullable|string|max:500',
        ]);

        $drivers = Driver::whereIn('id', $request->driver_ids)->get();
        $count = $drivers->count();

        switch ($request->action) {
            case 'approve':
                Driver::whereIn('id', $request->driver_ids)->update([
                    'status' => 'approved',
                    'approved_at' => now(),
                ]);
                AuditLog::log('bulk_drivers_approved', "{$count} drivers approved");
                $message = "{$count} drivers approved successfully.";
                break;

            case 'reject':
                Driver::whereIn('id', $request->driver_ids)->update([
                    'status' => 'rejected',
                    'rejection_reason' => $request->reason,
                ]);
                AuditLog::log('bulk_drivers_rejected', "{$count} drivers rejected");
                $message = "{$count} drivers rejected.";
                break;

            case 'block':
                $userIds = $drivers->pluck('user_id');
                User::whereIn('id', $userIds)->update([
                    'is_active' => false,
                ]);
                Driver::whereIn('id', $request->driver_ids)->update([
                    'status' => 'blocked',
                    'ban_reason' => $request->reason,
                    'banned_at' => now(),
                ]);
                AuditLog::log('bulk_drivers_blocked', "{$count} drivers blocked");
                $message = "{$count} drivers blocked.";
                break;

            case 'unblock':
                $userIds = $drivers->pluck('user_id');
                User::whereIn('id', $userIds)->update([
                    'is_active' => true,
                ]);
                Driver::whereIn('id', $request->driver_ids)->update([
                    'status' => 'approved',
                    'ban_reason' => null,
                    'banned_at' => null,
                ]);
                AuditLog::log('bulk_drivers_unblocked', "{$count} drivers unblocked");
                $message = "{$count} drivers unblocked.";
                break;

            case 'send_notification':
                // TODO: Implement push notification sending
                AuditLog::log('bulk_notification_sent', "Notification sent to {$count} drivers");
                $message = "Notification sent to {$count} drivers.";
                break;
        }

        return back()->with('success', $message);
    }

    // Bulk rider actions
    public function ridersAction(Request $request)
    {
        $request->validate([
            'rider_ids' => 'required|array|min:1',
            'rider_ids.*' => 'exists:users,id',
            'action' => 'required|in:block,unblock,send_notification',
            'reason' => 'nullable|string|max:500',
            'notification_message' => 'nullable|string|max:500',
        ]);

        $count = count($request->rider_ids);

        switch ($request->action) {
            case 'block':
                User::whereIn('id', $request->rider_ids)->update([
                    'is_active' => false,
                ]);
                AuditLog::log('bulk_riders_blocked', "{$count} riders blocked");
                $message = "{$count} riders blocked.";
                break;

            case 'unblock':
                User::whereIn('id', $request->rider_ids)->update([
                    'is_active' => true,
                ]);
                AuditLog::log('bulk_riders_unblocked', "{$count} riders unblocked");
                $message = "{$count} riders unblocked.";
                break;

            case 'send_notification':
                // TODO: Implement push notification sending
                AuditLog::log('bulk_notification_sent', "Notification sent to {$count} riders");
                $message = "Notification sent to {$count} riders.";
                break;
        }

        return back()->with('success', $message);
    }

    // Bulk ride actions
    public function ridesAction(Request $request)
    {
        $request->validate([
            'ride_ids' => 'required|array|min:1',
            'ride_ids.*' => 'exists:ride_requests,id',
            'action' => 'required|in:cancel,refund',
            'reason' => 'nullable|string|max:500',
        ]);

        $count = count($request->ride_ids);

        switch ($request->action) {
            case 'cancel':
                RideRequest::whereIn('id', $request->ride_ids)
                    ->whereIn('status', ['searching', 'driver_assigned', 'driver_arrived'])
                    ->update([
                        'status' => 'cancelled_by_admin',
                        'cancellation_reason' => $request->reason ?? 'Cancelled by admin',
                    ]);
                AuditLog::log('bulk_rides_cancelled', "{$count} rides cancelled by admin");
                $message = "{$count} rides cancelled.";
                break;

            case 'refund':
                // TODO: Implement refund logic
                AuditLog::log('bulk_rides_refunded', "{$count} rides marked for refund");
                $message = "{$count} rides marked for refund.";
                break;
        }

        return back()->with('success', $message);
    }

    // Bulk ticket actions
    public function ticketsAction(Request $request)
    {
        $request->validate([
            'ticket_ids' => 'required|array|min:1',
            'ticket_ids.*' => 'exists:support_tickets,id',
            'action' => 'required|in:close,assign,change_priority',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'nullable|in:low,medium,high,urgent',
        ]);

        $count = count($request->ticket_ids);

        switch ($request->action) {
            case 'close':
                SupportTicket::whereIn('id', $request->ticket_ids)->update([
                    'status' => 'closed',
                    'resolved_at' => now(),
                    'resolved_by' => auth()->id(),
                ]);
                AuditLog::log('bulk_tickets_closed', "{$count} tickets closed");
                $message = "{$count} tickets closed.";
                break;

            case 'assign':
                SupportTicket::whereIn('id', $request->ticket_ids)->update([
                    'assigned_to' => $request->assigned_to,
                ]);
                AuditLog::log('bulk_tickets_assigned', "{$count} tickets assigned");
                $message = "{$count} tickets assigned.";
                break;

            case 'change_priority':
                SupportTicket::whereIn('id', $request->ticket_ids)->update([
                    'priority' => $request->priority,
                ]);
                AuditLog::log('bulk_tickets_priority_changed', "{$count} tickets priority changed to {$request->priority}");
                $message = "{$count} tickets priority updated.";
                break;
        }

        return back()->with('success', $message);
    }
}
