<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    const TYPE_WORKOUT_REMINDER = 'workout_reminder';
    const TYPE_GOAL_ACHIEVED = 'goal_achieved';
    const TYPE_CHALLENGE_COMPLETED = 'challenge_completed';
    const TYPE_CHALLENGE_STARTED = 'challenge_started';
    const TYPE_NEW_PLAN_AVAILABLE = 'new_plan_available';
    const TYPE_BODY_MEASUREMENT_REMINDER = 'body_measurement_reminder';
    const TYPE_AI_COACH_MESSAGE = 'ai_coach_message';
    const TYPE_TRAINER_MESSAGE = 'trainer_message';
    const TYPE_STREAK_ACHIEVED = 'streak_achieved';
    const TYPE_SYSTEM = 'system';

    const CHANNEL_PUSH = 'push';
    const CHANNEL_IN_APP = 'in_app';
    const CHANNEL_EMAIL = 'email';
    const CHANNEL_SMS = 'sms';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'data',
        'channel',
        'scheduled_at',
        'sent_at',
        'read_at',
        'image_url',
        'action_url',
        'action_label',
        'priority',
        'is_silent',
    ];

    protected $casts = [
        'data' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'read_at' => 'datetime',
        'is_silent' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeSent($query)
    {
        return $query->whereNotNull('sent_at');
    }

    public function scopePending($query)
    {
        return $query->whereNull('sent_at')
            ->where(function ($q) {
                $q->whereNull('scheduled_at')
                  ->orWhere('scheduled_at', '<=', now());
            });
    }

    public function scopeByChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Accessors
     */
    public function getIsReadAttribute(): bool
    {
        return $this->read_at !== null;
    }

    public function getIsSentAttribute(): bool
    {
        return $this->sent_at !== null;
    }

    /**
     * Mark as read
     */
    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Mark as sent
     */
    public function markAsSent(): void
    {
        if (!$this->sent_at) {
            $this->update(['sent_at' => now()]);
        }
    }
}
