<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Goal extends Model
{
    use HasFactory;

    const TYPE_WEIGHT = 'weight';
    const TYPE_BODY_FAT = 'body_fat';
    const TYPE_MUSCLE_MASS = 'muscle_mass';
    const TYPE_WORKOUT_FREQUENCY = 'workout_frequency';
    const TYPE_STRENGTH = 'strength';
    const TYPE_ENDURANCE = 'endurance';
    const TYPE_FLEXIBILITY = 'flexibility';
    const TYPE_CUSTOM = 'custom';

    const UNIT_KG = 'kg';
    const UNIT_LBS = 'lbs';
    const UNIT_PERCENT = 'percent';
    const UNIT_SESSIONS = 'sessions';
    const UNIT_REPS = 'reps';
    const UNIT_MINUTES = 'minutes';
    const UNIT_KM = 'km';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'title_es',
        'description',
        'target_value',
        'current_value',
        'initial_value',
        'unit',
        'deadline',
        'is_completed',
        'completed_at',
        'is_active',
        'priority',
        'milestones',
        'reminder_frequency',
        'last_reminded_at',
    ];

    protected $casts = [
        'target_value' => 'float',
        'current_value' => 'float',
        'initial_value' => 'float',
        'deadline' => 'date',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'is_active' => 'boolean',
        'milestones' => 'array',
        'last_reminded_at' => 'datetime',
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
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('is_completed', false);
    }

    public function scopeCompleted($query)
    {
        return $query->where('is_completed', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeOverdue($query)
    {
        return $query->where('is_completed', false)
            ->whereNotNull('deadline')
            ->where('deadline', '<', now()->toDateString());
    }

    /**
     * Accessors
     */
    public function getProgressPercentAttribute(): float
    {
        if ($this->initial_value === null || $this->target_value === null) {
            return 0;
        }

        $total = abs($this->target_value - $this->initial_value);
        if ($total == 0) {
            return $this->is_completed ? 100 : 0;
        }

        $progress = abs($this->current_value - $this->initial_value);
        return min(100, round(($progress / $total) * 100, 1));
    }

    public function getIsOverdueAttribute(): bool
    {
        return !$this->is_completed && $this->deadline && $this->deadline->isPast();
    }

    public function getDaysRemainingAttribute(): ?int
    {
        if (!$this->deadline) {
            return null;
        }
        return now()->diffInDays($this->deadline, false);
    }

    public function getDirectionAttribute(): string
    {
        if ($this->initial_value === null || $this->target_value === null) {
            return 'increase';
        }
        return $this->target_value >= $this->initial_value ? 'increase' : 'decrease';
    }

    /**
     * Update current value and check completion
     */
    public function updateProgress(float $newValue): void
    {
        $this->current_value = $newValue;

        $isGoalReached = false;
        if ($this->direction === 'decrease') {
            $isGoalReached = $newValue <= $this->target_value;
        } else {
            $isGoalReached = $newValue >= $this->target_value;
        }

        if ($isGoalReached && !$this->is_completed) {
            $this->is_completed = true;
            $this->completed_at = now();
        }

        $this->save();
    }
}
