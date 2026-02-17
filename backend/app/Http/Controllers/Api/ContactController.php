<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use App\Mail\NewSupportTicketMail;
use App\Mail\TicketReplyMail;

class ContactController extends Controller
{
    /**
     * Handle website contact form submission
     */
    public function submit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:200',
            'message' => 'required|string|max:5000',
            'category' => 'nullable|string|in:website_contact,ride_issue,payment,driver_behavior,app_bug,account,other',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
            'source' => 'nullable|string|in:contact_form,chatbot,chatbot_app_shareide,chatbot_app_fleet,app_shareide,app_fleet',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Generate unique reply token
            $replyToken = Str::random(64);

            // Create support ticket from contact form
            $ticket = SupportTicket::create([
                'user_id' => null,
                'guest_name' => $request->name,
                'guest_email' => $request->email,
                'guest_phone' => $request->phone,
                'reply_token' => $replyToken,
                'subject' => $request->subject,
                'category' => $request->input('category', 'website_contact'),
                'priority' => $request->input('priority', 'medium'),
                'status' => 'open',
                'description' => $request->message,
                'source' => $request->input('source', 'contact_form'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Create first message
            TicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => null,
                'sender_type' => 'guest',
                'message' => $request->message,
                'is_internal' => false,
            ]);

            // Send email notification to admin
            try {
                Mail::to(config('mail.admin_email', 'admin@shareide.com'))
                    ->send(new NewSupportTicketMail($ticket));
            } catch (\Exception $e) {
                // Log email error but don't fail the request
                \Log::error('Failed to send admin notification: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Thank you for contacting us! We will get back to you soon. Check your email for ticket details.',
                'ticket_number' => $ticket->ticket_number,
                'reply_url' => $ticket->reply_url,
            ]);

        } catch (\Exception $e) {
            \Log::error('Contact form error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit contact form. Please try again later.'
            ], 500);
        }
    }

    /**
     * View ticket by reply token (for guests)
     */
    public function viewTicket($token)
    {
        $ticket = SupportTicket::where('reply_token', $token)
            ->with(['messages' => function($q) {
                $q->where('is_internal', false)->with('user')->orderBy('created_at', 'asc');
            }, 'assignedAdmin'])
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        $hasAdminReply = $ticket->messages->where('sender_type', 'admin')->count() > 0;
        $agentName = $ticket->assignedAdmin?->name ?? null;
        $agentPhoto = $ticket->assignedAdmin?->profile_photo
            ? asset('storage/' . $ticket->assignedAdmin->profile_photo)
            : null;

        return response()->json([
            'success' => true,
            'ticket' => [
                'ticket_number' => $ticket->ticket_number,
                'subject' => $ticket->subject,
                'status' => $ticket->status,
                'created_at' => $ticket->created_at->format('M d, Y h:i A'),
                'has_admin_reply' => $hasAdminReply,
                'assigned_to_name' => $agentName,
                'agent' => $agentName ? [
                    'name' => $agentName,
                    'initial' => strtoupper(substr($agentName, 0, 1)),
                    'profile_picture' => $agentPhoto,
                ] : null,
                'messages' => $ticket->messages->map(function($msg) use ($token) {
                    return [
                        'id' => $msg->id,
                        'sender' => $msg->sender_type === 'admin' ? ($msg->user?->name ?? 'Support Team') : 'You',
                        'sender_initial' => $msg->sender_type === 'admin' ? strtoupper(substr($msg->user?->name ?? 'S', 0, 1)) : null,
                        'message' => $msg->message,
                        'attachment' => $this->secureAttachmentUrl($token, $msg->id, $msg->attachment),
                        'attachment_name' => $msg->attachment ? basename($msg->attachment) : null,
                        'created_at' => $msg->created_at->format('h:i A'),
                        'is_admin' => $msg->sender_type === 'admin',
                    ];
                }),
            ],
        ]);
    }

    /**
     * Guest reply to ticket
     */
    public function replyToTicket(Request $request, $token)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Message is required',
                'errors' => $validator->errors()
            ], 422);
        }

        $ticket = SupportTicket::where('reply_token', $token)->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        if (in_array($ticket->status, ['closed', 'resolved'])) {
            return response()->json([
                'success' => false,
                'message' => 'This ticket is closed. Please create a new ticket.'
            ], 400);
        }

        // Create reply message - use 'user' sender_type if ticket has user_id (app user)
        $senderType = $ticket->user_id ? 'user' : 'guest';
        $message = TicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $ticket->user_id,
            'sender_type' => $senderType,
            'message' => $request->message,
            'is_internal' => false,
        ]);

        // Clear guest typing indicator on send
        Cache::forget("ticket_typing_guest_{$ticket->id}");

        // Update ticket status and last reply
        $ticket->update([
            'status' => 'open',
            'last_reply_at' => now(),
        ]);

        // Notify admin of new reply
        try {
            Mail::to(config('mail.admin_email', 'admin@shareide.com'))
                ->send(new NewSupportTicketMail($ticket, true));
        } catch (\Exception $e) {
            \Log::error('Failed to send reply notification: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Reply sent successfully!',
            'message_id' => $message->id,
        ]);
    }

    /**
     * Guest uploads a file/image attachment
     */
    public function uploadAttachment(Request $request, $token)
    {
        $ticket = SupportTicket::where('reply_token', $token)->first();

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
        }

        if (in_array($ticket->status, ['closed', 'resolved'])) {
            return response()->json(['success' => false, 'message' => 'This ticket is closed.'], 400);
        }

        $request->validate([
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,txt,zip',
            'message' => 'nullable|string|max:2000',
        ]);

        $file = $request->file('file');
        $path = $file->store('ticket-attachments/' . $ticket->id, 'public');

        $senderType = $ticket->user_id ? 'user' : 'guest';
        $message = TicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $ticket->user_id,
            'sender_type' => $senderType,
            'message' => $request->input('message', ''),
            'attachment' => $path,
            'is_internal' => false,
        ]);

        Cache::forget("ticket_typing_guest_{$ticket->id}");

        $ticket->update([
            'status' => 'open',
            'last_reply_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'File sent successfully!',
            'message_id' => $message->id,
            'attachment_url' => $this->secureAttachmentUrl($token, $message->id, $path),
        ]);
    }

    /**
     * Guest typing indicator - POST sets cache, returns admin typing status
     */
    public function typing($token)
    {
        $ticket = SupportTicket::where('reply_token', $token)->first();

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
        }

        Cache::put("ticket_typing_guest_{$ticket->id}", true, now()->addSeconds(3));

        return response()->json([
            'success' => true,
            'admin_typing' => (bool) Cache::get("ticket_typing_admin_{$ticket->id}", false),
        ]);
    }

    /**
     * Get new messages since a given message ID (incremental polling)
     */
    public function getNewMessages(Request $request, $token)
    {
        $ticket = SupportTicket::where('reply_token', $token)
            ->with('assignedAdmin')
            ->first();

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
        }

        $afterId = (int) $request->query('after', 0);

        $query = $ticket->messages()
            ->where('is_internal', false)
            ->with('user')
            ->orderBy('created_at', 'asc');

        if ($afterId > 0) {
            $query->where('id', '>', $afterId);
        }

        $messages = $query->get()->map(function ($msg) use ($token) {
            return [
                'id' => $msg->id,
                'sender' => $msg->sender_type === 'admin' ? ($msg->user?->name ?? 'Support Team') : 'You',
                'sender_initial' => $msg->sender_type === 'admin' ? strtoupper(substr($msg->user?->name ?? 'S', 0, 1)) : null,
                'message' => $msg->message,
                'attachment' => $this->secureAttachmentUrl($token, $msg->id, $msg->attachment),
                'attachment_name' => $msg->attachment ? basename($msg->attachment) : null,
                'created_at' => $msg->created_at->format('h:i A'),
                'is_admin' => $msg->sender_type === 'admin',
            ];
        });

        $agentName = $ticket->assignedAdmin?->name ?? null;
        $agentPhoto = $ticket->assignedAdmin?->profile_photo
            ? asset('storage/' . $ticket->assignedAdmin->profile_photo)
            : null;

        return response()->json([
            'success' => true,
            'messages' => $messages,
            'admin_typing' => (bool) Cache::get("ticket_typing_admin_{$ticket->id}", false),
            'ticket_status' => $ticket->status,
            'agent' => $agentName ? [
                'name' => $agentName,
                'initial' => strtoupper(substr($agentName, 0, 1)),
                'profile_picture' => $agentPhoto,
            ] : null,
        ]);
    }

    /**
     * Update guest activity (ping endpoint for online status)
     */
    public function updateActivity($token)
    {
        $ticket = SupportTicket::where('reply_token', $token)->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        Cache::put("ticket_online_{$ticket->id}", true, now()->addMinutes(2));

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Mark guest as offline (called on tab close via sendBeacon)
     */
    public function goOffline($token)
    {
        $ticket = SupportTicket::where('reply_token', $token)->first();

        if (!$ticket) {
            return response()->json(['success' => false], 404);
        }

        Cache::forget("ticket_online_{$ticket->id}");
        Cache::forget("ticket_typing_guest_{$ticket->id}");

        return response()->json(['success' => true]);
    }

    /**
     * Serve attachment file securely (validates ticket token)
     */
    public function getAttachment($token, $messageId)
    {
        $ticket = SupportTicket::where('reply_token', $token)->first();

        if (!$ticket) {
            abort(404);
        }

        $message = TicketMessage::where('id', $messageId)
            ->where('support_ticket_id', $ticket->id)
            ->whereNotNull('attachment')
            ->first();

        if (!$message) {
            abort(404);
        }

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

    /**
     * Generate secure attachment URL (token-protected)
     */
    private function secureAttachmentUrl($token, $messageId, $attachment)
    {
        if (!$attachment) return null;
        return url("/api/support/ticket/{$token}/file/{$messageId}");
    }

    /**
     * Create support ticket from authenticated app user (rider/driver)
     */
    public function createAppTicket(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:200',
            'message' => 'required|string|max:5000',
            'category' => 'nullable|string|in:ride_issue,payment,driver_behavior,app_bug,account,other',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
            'source' => 'nullable|string|in:app_shareide,chatbot_app_shareide,app_fleet,chatbot_app_fleet',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            $replyToken = Str::random(64);

            $ticket = SupportTicket::create([
                'user_id' => $user->id,
                'guest_name' => null,
                'guest_email' => null,
                'guest_phone' => null,
                'reply_token' => $replyToken,
                'subject' => $request->subject,
                'category' => $request->input('category', 'other'),
                'priority' => $request->input('priority', 'medium'),
                'status' => 'open',
                'description' => $request->message,
                'source' => $request->input('source', 'app_shareide'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            TicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'sender_type' => 'user',
                'message' => $request->message,
                'is_internal' => false,
            ]);

            // Send email notification to admin
            try {
                Mail::to(config('mail.admin_email', 'admin@shareide.com'))
                    ->send(new NewSupportTicketMail($ticket));
            } catch (\Exception $e) {
                \Log::error('Failed to send admin notification: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Support ticket created successfully.',
                'ticket_number' => $ticket->ticket_number,
                'reply_token' => $replyToken,
            ]);

        } catch (\Exception $e) {
            \Log::error('App ticket creation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create support ticket. Please try again later.'
            ], 500);
        }
    }
}
