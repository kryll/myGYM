<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AIConversation extends Model
{
    use HasFactory;

    const TYPE_GENERAL = 'general';
    const TYPE_PLAN_GENERATION = 'plan_generation';
    const TYPE_BODY_ANALYSIS = 'body_analysis';
    const TYPE_WORKOUT_REVIEW = 'workout_review';
    const TYPE_NUTRITION = 'nutrition';

    protected $fillable = [
        'user_id',
        'title',
        'type',
        'context',
        'is_active',
        'last_message_at',
        'total_tokens_used',
        'message_count',
    ];

    protected $casts = [
        'context' => 'array',
        'is_active' => 'boolean',
        'last_message_at' => 'datetime',
        'total_tokens_used' => 'integer',
        'message_count' => 'integer',
    ];

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(AIMessage::class, 'conversation_id')->orderBy('created_at');
    }

    public function latestMessages(): HasMany
    {
        return $this->hasMany(AIMessage::class, 'conversation_id')->orderByDesc('created_at')->limit(20);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Accessors
     */
    public function getLastMessageAttribute(): ?AIMessage
    {
        return $this->messages()->orderByDesc('created_at')->first();
    }

    /**
     * Get context for the Claude API call (last N messages)
     */
    public function getApiMessages(int $limit = 20): array
    {
        return $this->messages()
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->reverse()
            ->map(function (AIMessage $message) {
                return [
                    'role' => $message->role,
                    'content' => $message->content,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Add a message and update conversation stats
     */
    public function addMessage(string $role, string $content, int $tokensUsed = 0, string $model = ''): AIMessage
    {
        $message = $this->messages()->create([
            'role' => $role,
            'content' => $content,
            'tokens_used' => $tokensUsed,
            'model' => $model ?: config('claude.model'),
        ]);

        $this->update([
            'last_message_at' => now(),
            'total_tokens_used' => ($this->total_tokens_used ?? 0) + $tokensUsed,
            'message_count' => ($this->message_count ?? 0) + 1,
        ]);

        return $message;
    }
}
