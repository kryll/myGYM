<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutSession extends Model
{
    use HasFactory;

    const SOURCE_APP = 'app';
    const SOURCE_AMAZFIT = 'amazfit';
    const SOURCE_APPLE_WATCH = 'apple_watch';
    const SOURCE_GARMIN = 'garmin';
    const SOURCE_MANUAL = 'manual';

    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_PAUSED = 'paused';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'plan_workout_id',
        'user_training_plan_id',
        'started_at',
        'completed_at',
        'paused_at',
        'total_duration_minutes',
        'active_duration_minutes',
        'calories_burned',
        'status',
        'notes',
        'heart_rate_avg',
        'heart_rate_max',
        'heart_rate_min',
        'steps_count',
        'distance_meters',
        'device_source',
        'device_data',
        'overall_feeling',
        'difficulty_rating',
        'location_type',
        'weather_condition',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'paused_at' => 'datetime',
        'total_duration_minutes' => 'float',
        'active_duration_minutes' => 'float',
        'calories_burned' => 'float',
        'heart_rate_avg' => 'integer',
        'heart_rate_max' => 'integer',
        'heart_rate_min' => 'integer',
        'steps_count' => 'integer',
        'distance_meters' => 'float',
        'device_data' => 'array',
        'overall_feeling' => 'integer',
        'difficulty_rating' => 'integer',
    ];

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function planWorkout(): BelongsTo
    {
        return $this->belongsTo(PlanWorkout::class, 'plan_workout_id');
    }

    public function userTrainingPlan(): BelongsTo
    {
        return $this->belongsTo(UserTrainingPlan::class, 'user_training_plan_id');
    }

    public function exercises(): HasMany
    {
        return $this->hasMany(SessionExercise::class, 'session_id')->orderBy('id');
    }

    /**
     * Scopes
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeInDateRange($query, $from, $to)
    {
        return $query->whereBetween('started_at', [$from, $to]);
    }

    /**
     * Accessors
     */
    public function getIsCompletedAttribute(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function getIsInProgressAttribute(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    public function getDurationFormatAttribute(): string
    {
        $minutes = $this->total_duration_minutes ?? 0;
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;

        if ($hours > 0) {
            return sprintf('%dh %02dmin', $hours, $mins);
        }
        return sprintf('%dmin', $mins);
    }

    public function getTotalVolumeAttribute(): float
    {
        return $this->exercises->sum(function ($exercise) {
            return collect($exercise->sets_completed ?? [])->sum(function ($set) {
                return ($set['reps'] ?? 0) * ($set['weight'] ?? 1);
            });
        });
    }

    /**
     * Mark session as complete and calculate metrics
     */
    public function complete(array $data = []): void
    {
        $completedAt = now();
        $durationMinutes = $this->started_at->diffInMinutes($completedAt);

        $this->update(array_merge([
            'completed_at' => $completedAt,
            'status' => self::STATUS_COMPLETED,
            'total_duration_minutes' => $durationMinutes,
        ], $data));
    }
}
