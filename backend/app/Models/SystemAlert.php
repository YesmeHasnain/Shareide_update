<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SystemAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'alert_type',
        'title',
        'message',
        'severity',
        'model_type',
        'model_id',
        'data',
        'is_read',
        'read_by',
        'read_at',
        'is_resolved',
        'resolved_by',
        'resolved_at',
        'resolution_note',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'is_resolved' => 'boolean',
        'read_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function readByUser()
    {
        return $this->belongsTo(User::class, 'read_by');
    }

    public function resolvedByUser()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    // Create a new alert
    public static function createAlert($type, $title, $message, $severity = 'info', $model = null, $data = null)
    {
        return self::create([
            'alert_type' => $type,
            'title' => $title,
            'message' => $message,
            'severity' => $severity,
            'model_type' => $model ? get_class($model) : null,
            'model_id' => $model ? $model->id : null,
            'data' => $data,
        ]);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeUnresolved($query)
    {
        return $query->where('is_resolved', false);
    }

    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('alert_type', $type);
    }

    // Get severity color
    public function getSeverityColorAttribute()
    {
        return match($this->severity) {
            'critical' => 'red',
            'warning' => 'yellow',
            'info' => 'blue',
            default => 'gray'
        };
    }
}
