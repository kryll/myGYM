<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserTrainingPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'started_at',
        'completed_at',
        'current_week',
        'current_day',
        'is_active',
        'completion_percentage',
        'total_sessions_completed',
        'notes',
        'rating',
        'feedback',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'current_week' => 'integer',
        'current_day' => 'integer',
        'is_active' => 'boolean',
        'completion_percentage' => 'float',
        'total_sessions_completed' => 'integer',
        'rating' => 'integer',
    ];

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(TrainingPlan::class, 'plan_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(WorkoutSession::class, 'user_training_plan_id');
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCompleted($query)
    {
        return $query->whereNotNull('completed_at');
    }

    /**
     * Computed attributes
     */
    public function getCurrentWorkoutAttribute(): ?PlanWorkout
    {
        if (!$this->plan) {
            return null;
        }

        return $this->plan->workouts()
            ->where('week_number', $this->current_week)
            ->where('day_number', $this->current_day)
            ->first();
    }

    public function getDaysActiveAttribute(): int
    {
        if (!$this->started_at) {
            return 0;
        }
        return $this->started_at->diffInDays(now());
    }

    public function getProgressPercentAttribute(): float
    {
        if (!$this->plan) {
            return 0;
        }

        $totalSessions = $this->plan->total_sessions;
        if ($totalSessions === 0) {
            return 0;
        }

        return min(100, round(($this->total_sessions_completed / $totalSessions) * 100, 1));
    }

    /**
     * Advance to the next workout in the plan
     */
    public function advanceToNextWorkout(): void
    {
        if (!$this->plan) {
            return;
        }

        $nextDay = $this->current_day + 1;
        $nextWeek = $this->current_week;

        if ($nextDay > $this->plan->sessions_per_week) {
            $nextDay = 1;
            $nextWeek++;
        }

        if ($nextWeek > $this->plan->duration_weeks) {
            $this->completed_at = now();
            $this->is_active = false;
            $this->completion_percentage = 100;
        } else {
            $this->current_day = $nextDay;
            $this->current_week = $nextWeek;
        }

        $this->total_sessions_completed++;
        $this->save();
    }
}
