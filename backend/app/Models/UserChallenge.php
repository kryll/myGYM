<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserChallenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'challenge_id',
        'joined_at',
        'completed_at',
        'current_value',
        'is_completed',
        'progress_data',
        'rank',
        'points_earned',
        'notes',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'completed_at' => 'datetime',
        'current_value' => 'float',
        'is_completed' => 'boolean',
        'progress_data' => 'array',
        'rank' => 'integer',
        'points_earned' => 'integer',
    ];

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }

    /**
     * Scopes
     */
    public function scopeCompleted($query)
    {
        return $query->where('is_completed', true);
    }

    public function scopeInProgress($query)
    {
        return $query->where('is_completed', false);
    }

    /**
     * Accessors
     */
    public function getProgressPercentAttribute(): float
    {
        if (!$this->challenge || $this->challenge->target_value <= 0) {
            return 0;
        }

        return min(100, round(($this->current_value / $this->challenge->target_value) * 100, 1));
    }

    public function getRemainingValueAttribute(): float
    {
        if (!$this->challenge) {
            return 0;
        }

        return max(0, $this->challenge->target_value - $this->current_value);
    }

    /**
     * Update progress and check completion
     */
    public function updateProgress(float $newValue): void
    {
        $this->current_value = $newValue;

        if ($this->challenge && $newValue >= $this->challenge->target_value && !$this->is_completed) {
            $this->is_completed = true;
            $this->completed_at = now();
            $this->points_earned = $this->challenge->reward_points;
        }

        $this->save();
    }
}
