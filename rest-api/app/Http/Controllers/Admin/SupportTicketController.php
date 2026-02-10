<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\TicketReplyMail;

class SupportTicketController extends Controller
{
    public function index(Request $request)
    {
        $query = SupportTicket::with(['user', 'assignedTo']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('guest_name', 'like', "%{$search}%")
                  ->orWhere('guest_email', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        $tickets = $query->orderByRaw("CASE status WHEN 'open' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'resolved' THEN 3 WHEN 'closed' THEN 4 ELSE 5 END")
                        ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 ELSE 5 END")
                        ->orderBy('created_at', 'desc')
                        ->paginate(20);

        $stats = [
            'open' => SupportTicket::where('status', 'open')->count(),
            'in_progress' => SupportTicket::where('status', 'in_progress')->count(),
            'resolved' => SupportTicket::where('status', 'resolved')->count(),
            'urgent' => SupportTicket::where('priority', 'urgent')->whereIn('status', ['open', 'in_progress'])->count(),
        ];

        return view('admin.support.index', compact('tickets', 'stats'));
    }

    public function show($id)
    {
        $ticket = SupportTicket::with(['user', 'assignedAdmin', 'messages.user', 'rideRequest'])->findOrFail($id);

        return view('admin.support.show', compact('ticket'));
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'is_internal' => 'nullable|boolean',
        ]);

        $ticket = SupportTicket::findOrFail($id);

        $message = TicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => auth()->id(),
            'sender_type' => 'admin',
            'message' => $request->message,
            'is_internal' => $request->boolean('is_internal'),
        ]);

        // Update ticket status to waiting_response if it was open/in_progress
        if (in_array($ticket->status, ['open', 'in_progress'])) {
            $ticket->update([
                'status' => 'waiting_response',
                'last_reply_at' => now(),
            ]);
        }

        // Assign to current admin if not assigned
        if (!$ticket->assigned_to) {
            $ticket->update(['assigned_to' => auth()->id()]);
        }

        // Send email to guest if not internal message
        if (!$request->boolean('is_internal')) {
            $recipientEmail = $ticket->guest_email ?? $ticket->user?->email;

            if ($recipientEmail) {
                try {
                    Mail::to($recipientEmail)->send(new TicketReplyMail($ticket, $message));
                } catch (\Exception $e) {
                    \Log::error('Failed to send ticket reply email: ' . $e->getMessage());
                }
            }
        }

        AuditLog::log('ticket_reply', "Reply added to ticket #{$ticket->ticket_number}", $ticket);

        return back()->with('success', 'Reply sent successfully.' . (!$request->boolean('is_internal') && ($ticket->guest_email || $ticket->user?->email) ? ' Email notification sent.' : ''));
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed',
            'resolution_note' => 'nullable|string|max:1000',
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $oldStatus = $ticket->status;

        $updateData = ['status' => $request->status];

        if ($request->status === 'resolved' || $request->status === 'closed') {
            $updateData['resolved_at'] = now();
            $updateData['resolved_by'] = auth()->id();
            if ($request->filled('resolution_note')) {
                $updateData['resolution_note'] = $request->resolution_note;
            }
        }

        $ticket->update($updateData);

        AuditLog::log('ticket_status_changed', "Ticket #{$ticket->ticket_number} status changed from {$oldStatus} to {$request->status}", $ticket);

        return back()->with('success', 'Ticket status updated.');
    }

    public function assign(Request $request, $id)
    {
        $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->update(['assigned_to' => $request->assigned_to]);

        AuditLog::log('ticket_assigned', "Ticket #{$ticket->ticket_number} assigned", $ticket);

        return back()->with('success', 'Ticket assigned successfully.');
    }

    public function updatePriority(Request $request, $id)
    {
        $request->validate([
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $oldPriority = $ticket->priority;
        $ticket->update(['priority' => $request->priority]);

        AuditLog::log('ticket_priority_changed', "Ticket #{$ticket->ticket_number} priority changed from {$oldPriority} to {$request->priority}", $ticket);

        return back()->with('success', 'Priority updated.');
    }
}
