<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\SupportTicket;

class NewSupportTicketMail extends Mailable
{
    use Queueable, SerializesModels;

    public $ticket;
    public $isReply;

    /**
     * Create a new message instance.
     */
    public function __construct(SupportTicket $ticket, bool $isReply = false)
    {
        $this->ticket = $ticket;
        $this->isReply = $isReply;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->isReply
            ? "[Reply] Support Ticket #{$this->ticket->ticket_number}"
            : "[New] Support Ticket #{$this->ticket->ticket_number}";

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.support.new-ticket',
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
