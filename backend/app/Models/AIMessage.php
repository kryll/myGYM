<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AIMessage extends Model
{
    use HasFactory;

    const ROLE_USER = 'user';
    const ROLE_ASSISTANT = 'assistant';
    const ROLE_SYSTEM = 'system';

    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'tokens_used',
        'model',
        'input_tokens',
        'output_tokens',
        'processing_time_ms',
        'is_streaming',
        'metadata',
    ];

    protected $casts = [
        'tokens_used' => 'integer',
        'input_tokens' => 'integer',
        'output_tokens' => 'integer',
        'processing_time_ms' => 'integer',
        'is_streaming' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Relationships
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(AIConversation::class, 'conversation_id');
    }

    /**
     * Scopes
     */
    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function scopeUserMessages($query)
    {
        return $query->where('role', self::ROLE_USER);
    }

    public function scopeAssistantMessages($query)
    {
        return $query->where('role', self::ROLE_ASSISTANT);
    }

    /**
     * Accessors
     */
    public function getIsUserAttribute(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    public function getIsAssistantAttribute(): bool
    {
        return $this->role === self::ROLE_ASSISTANT;
    }

    public function getWordCountAttribute(): int
    {
        return str_word_count($this->content ?? '');
    }
}
