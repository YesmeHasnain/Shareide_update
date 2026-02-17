<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_number',
        'user_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'reply_token',
        'user_type',
        'ride_request_id',
        'subject',
        'description',
        'category',
        'priority',
        'status',
        'assigned_to',
        'resolved_at',
        'resolved_by',
        'resolution_note',
        'last_reply_at',
        'source',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'last_reply_at' => 'datetime',
    ];

    // Get display name (user name or guest name)
    public function getDisplayNameAttribute()
    {
        if ($this->user) {
            return $this->user->name;
        }
        return $this->guest_name ?? 'Guest';
    }

    // Get contact email
    public function getContactEmailAttribute()
    {
        if ($this->user) {
            return $this->user->email;
        }
        return $this->guest_email;
    }

    // Check if ticket is from guest
    public function getIsGuestAttribute()
    {
        return is_null($this->user_id);
    }

    // Generate reply URL for guest
    public function getReplyUrlAttribute()
    {
        if ($this->reply_token) {
            return url("/support/ticket/{$this->reply_token}");
        }
        return null;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            $ticket->ticket_number = 'TKT-' . strtoupper(uniqid());
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rideRequest()
    {
        return $this->belongsTo(RideRequest::class);
    }

    public function assignedAdmin()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Alias for assignedAdmin (used by controller)
    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages()
    {
        return $this->hasMany(TicketMessage::class);
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['open', 'in_progress', 'waiting_response']);
    }

    public function scopeUrgent($query)
    {
        return $query->where('priority', 'urgent');
    }

    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    // Get priority badge color
    public function getPriorityColorAttribute()
    {
        return match($this->priority) {
            'urgent' => 'red',
            'high' => 'orange',
            'medium' => 'yellow',
            'low' => 'green',
            default => 'gray'
        };
    }

    // Get status badge color
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'open' => 'blue',
            'in_progress' => 'yellow',
            'waiting_response' => 'purple',
            'resolved' => 'green',
            'closed' => 'gray',
            default => 'gray'
        };
    }

    // Source helper: human-readable label
    public function getSourceLabelAttribute()
    {
        return match($this->source) {
            'contact_form' => 'Website',
            'chatbot' => 'Website (Bot)',
            'app_shareide' => 'ShareIde App',
            'chatbot_app_shareide' => 'ShareIde (Bot)',
            'app_fleet' => 'Fleet App',
            'chatbot_app_fleet' => 'Fleet (Bot)',
            default => 'Website'
        };
    }

    // Source helper: badge color
    public function getSourceColorAttribute()
    {
        return match($this->source) {
            'contact_form' => 'blue',
            'chatbot' => 'indigo',
            'app_shareide' => 'green',
            'chatbot_app_shareide' => 'emerald',
            'app_fleet' => 'orange',
            'chatbot_app_fleet' => 'amber',
            default => 'blue'
        };
    }

    // Source helper: icon class
    public function getSourceIconAttribute()
    {
        return match($this->source) {
            'contact_form' => 'ti-world',
            'chatbot' => 'ti-robot',
            'app_shareide' => 'ti-device-mobile',
            'chatbot_app_shareide' => 'ti-robot',
            'app_fleet' => 'ti-truck',
            'chatbot_app_fleet' => 'ti-robot',
            default => 'ti-world'
        };
    }
}
