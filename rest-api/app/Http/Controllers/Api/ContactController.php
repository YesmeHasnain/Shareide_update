<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
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
            'message' => 'required|string|max:2000',
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
                'category' => 'website_contact',
                'priority' => 'medium',
                'status' => 'open',
                'description' => $request->message,
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
                $q->where('is_internal', false)->orderBy('created_at', 'asc');
            }])
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'ticket' => [
                'ticket_number' => $ticket->ticket_number,
                'subject' => $ticket->subject,
                'status' => $ticket->status,
                'created_at' => $ticket->created_at->format('M d, Y h:i A'),
                'messages' => $ticket->messages->map(function($msg) {
                    return [
                        'sender' => $msg->sender_type === 'admin' ? 'Support Team' : 'You',
                        'message' => $msg->message,
                        'created_at' => $msg->created_at->format('M d, Y h:i A'),
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

        // Create reply message
        TicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => null,
            'sender_type' => 'guest',
            'message' => $request->message,
            'is_internal' => false,
        ]);

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
            'message' => 'Reply sent successfully!'
        ]);
    }
}
