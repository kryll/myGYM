<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanWorkout extends Model
{
    use HasFactory;

    protected $fillable = [
        'plan_id',
        'week_number',
        'day_number',
        'name',
        'name_es',
        'description',
        'estimated_duration_minutes',
        'workout_type',
        'target_muscle_groups',
        'notes',
        'sort_order',
    ];

    protected $casts = [
        'week_number' => 'integer',
        'day_number' => 'integer',
        'estimated_duration_minutes' => 'integer',
        'target_muscle_groups' => 'array',
        'sort_order' => 'integer',
    ];

    /**
     * Relationships
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(TrainingPlan::class, 'plan_id');
    }

    public function exercises(): HasMany
    {
        return $this->hasMany(WorkoutExercise::class, 'workout_id')->orderBy('order');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(WorkoutSession::class, 'plan_workout_id');
    }

    /**
     * Scopes
     */
    public function scopeForWeek($query, int $week)
    {
        return $query->where('week_number', $week);
    }

    public function scopeForDay($query, int $day)
    {
        return $query->where('day_number', $day);
    }

    /**
     * Accessors
     */
    public function getLocalizedNameAttribute(): string
    {
        return $this->name_es ?? $this->name;
    }

    public function getExerciseCountAttribute(): int
    {
        return $this->exercises()->count();
    }
}
