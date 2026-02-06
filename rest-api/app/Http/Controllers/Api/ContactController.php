<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Models\SupportTicket;

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
            // Create support ticket from contact form
            $ticket = SupportTicket::create([
                'user_id' => null, // Guest submission
                'subject' => $request->subject,
                'category' => 'website_contact',
                'priority' => 'medium',
                'status' => 'open',
                'description' => "Name: {$request->name}\nEmail: {$request->email}\n\nMessage:\n{$request->message}",
            ]);

            // Optionally send email notification to support team
            // Mail::to(config('mail.support_email', 'support@shareide.com'))->send(new ContactFormMail($request->all()));

            return response()->json([
                'success' => true,
                'message' => 'Thank you for contacting us! We will get back to you soon.',
                'ticket_id' => $ticket->id ?? null
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit contact form. Please try again later.'
            ], 500);
        }
    }
}
