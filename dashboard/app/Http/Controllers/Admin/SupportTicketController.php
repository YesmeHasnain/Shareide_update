<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
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

        if ($request->filled('source')) {
            $source = $request->source;
            if ($source === 'website') {
                $query->whereIn('source', ['contact_form', 'chatbot']);
            } elseif ($source === 'app_shareide') {
                $query->whereIn('source', ['app_shareide', 'chatbot_app_shareide']);
            } elseif ($source === 'app_fleet') {
                $query->whereIn('source', ['app_fleet', 'chatbot_app_fleet']);
            } else {
                $query->where('source', $source);
            }
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

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Reply sent successfully.',
                'message_id' => $message->id,
            ]);
        }

        return back()->with('success', 'Reply sent successfully.' . (!$request->boolean('is_internal') && ($ticket->guest_email || $ticket->user?->email) ? ' Email notification sent.' : ''));
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,waiting_response,resolved,closed',
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

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Ticket status updated.']);
        }

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

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Ticket assigned successfully.']);
        }

        return back()->with('success', 'Ticket assigned successfully.');
    }

    public function guestActivity($id)
    {
        $isOnline = Cache::get("ticket_online_{$id}", false);
        $ticket = SupportTicket::find($id);
        $messageCount = $ticket ? $ticket->messages()->where('is_internal', false)->count() : 0;

        return response()->json([
            'is_online' => (bool) $isOnline,
            'message_count' => $messageCount,
            'status' => $ticket->status ?? 'unknown',
        ]);
    }

    /**
     * Admin typing indicator - sets cache, returns guest typing status
     */
    public function typing($id)
    {
        $ticket = SupportTicket::find($id);
        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
        }

        Cache::put("ticket_typing_admin_{$id}", true, now()->addSeconds(3));

        return response()->json([
            'success' => true,
            'guest_typing' => (bool) Cache::get("ticket_typing_guest_{$id}", false),
        ]);
    }

    /**
     * Get new messages since a given message ID (incremental polling for admin)
     */
    public function getMessages(Request $request, $id)
    {
        $ticket = SupportTicket::find($id);
        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
        }

        $afterId = (int) $request->query('after', 0);

        $query = $ticket->messages()->with('user')->orderBy('created_at', 'asc');

        if ($afterId > 0) {
            $query->where('id', '>', $afterId);
        }

        $messages = $query->get()->map(function ($msg) use ($id) {
            return [
                'id' => $msg->id,
                'sender_type' => $msg->sender_type,
                'sender_name' => $msg->sender_type === 'admin' ? ($msg->user->name ?? 'Admin') : null,
                'message' => $msg->message,
                'attachment' => $msg->attachment ? route('admin.support.file', [$id, $msg->id]) : null,
                'attachment_name' => $msg->attachment ? basename($msg->attachment) : null,
                'is_internal' => (bool) $msg->is_internal,
                'created_at' => $msg->created_at->format('M d \a\t h:i A'),
            ];
        });

        return response()->json([
            'success' => true,
            'messages' => $messages,
            'guest_typing' => (bool) Cache::get("ticket_typing_guest_{$id}", false),
            'guest_online' => (bool) Cache::get("ticket_online_{$id}", false),
            'ticket_status' => $ticket->status,
        ]);
    }

    /**
     * Admin uploads a file/image attachment
     */
    public function uploadAttachment(Request $request, $id)
    {
        $ticket = SupportTicket::findOrFail($id);

        $request->validate([
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,txt,zip',
            'message' => 'nullable|string|max:2000',
        ]);

        $file = $request->file('file');
        $path = $file->store('ticket-attachments/' . $ticket->id, 'public');

        $message = TicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => auth()->id(),
            'sender_type' => 'admin',
            'message' => $request->input('message', ''),
            'attachment' => $path,
            'is_internal' => false,
        ]);

        if (!$ticket->assigned_to) {
            $ticket->update(['assigned_to' => auth()->id()]);
        }

        $ticket->update(['last_reply_at' => now()]);

        Cache::forget("ticket_typing_admin_{$id}");

        AuditLog::log('ticket_attachment', "Attachment sent on ticket #{$ticket->ticket_number}", $ticket);

        return response()->json([
            'success' => true,
            'message' => 'File sent successfully.',
            'message_id' => $message->id,
            'attachment_url' => route('admin.support.file', [$ticket->id, $message->id]),
        ]);
    }

    /**
     * Serve attachment file securely (admin auth required)
     */
    public function getAttachment($id, $messageId)
    {
        $ticket = SupportTicket::findOrFail($id);

        $message = TicketMessage::where('id', $messageId)
            ->where('support_ticket_id', $ticket->id)
            ->whereNotNull('attachment')
            ->firstOrFail();

        if (!Storage::disk('public')->exists($message->attachment)) {
            abort(404);
        }

        $path = Storage::disk('public')->path($message->attachment);
        $mime = Storage::disk('public')->mimeType($message->attachment);
        $filename = basename($message->attachment);

        return response()->file($path, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }

    public function destroy($id)
    {
        $ticket = SupportTicket::findOrFail($id);
        $ticketNumber = $ticket->ticket_number;

        // Delete attachments
        foreach ($ticket->messages as $message) {
            if ($message->attachment && Storage::disk('public')->exists($message->attachment)) {
                Storage::disk('public')->delete($message->attachment);
            }
        }

        // Delete all messages
        $ticket->messages()->delete();

        // Delete the ticket
        $ticket->delete();

        AuditLog::log('ticket_deleted', "Ticket #{$ticketNumber} deleted permanently");

        return redirect()->route('admin.support.index')->with('success', "Ticket #{$ticketNumber} deleted successfully.");
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

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Priority updated.']);
        }

        return back()->with('success', 'Priority updated.');
    }
}
