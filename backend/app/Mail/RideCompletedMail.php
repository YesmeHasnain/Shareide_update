<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RideCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $ride;
    public $user;

    public function __construct($ride, $user)
    {
        $this->ride = $ride;
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Shareide Ride Receipt - Rs. ' . ($this->ride->fare ?? $this->ride->estimated_price ?? 0),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.rides.completed',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
