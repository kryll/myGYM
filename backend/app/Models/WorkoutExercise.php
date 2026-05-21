<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutExercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'workout_id',
        'exercise_id',
        'sets',
        'reps',
        'reps_range_min',
        'reps_range_max',
        'duration_seconds',
        'rest_seconds',
        'weight_recommendation',
        'weight_unit',
        'tempo',
        'rpe',
        'order',
        'notes',
        'notes_es',
        'superset_group',
        'is_warmup',
        'is_cooldown',
    ];

    protected $casts = [
        'sets' => 'integer',
        'reps' => 'integer',
        'reps_range_min' => 'integer',
        'reps_range_max' => 'integer',
        'duration_seconds' => 'integer',
        'rest_seconds' => 'integer',
        'weight_recommendation' => 'float',
        'rpe' => 'float',
        'order' => 'integer',
        'superset_group' => 'integer',
        'is_warmup' => 'boolean',
        'is_cooldown' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function workout(): BelongsTo
    {
        return $this->belongsTo(PlanWorkout::class, 'workout_id');
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    /**
     * Accessors
     */
    public function getRepsDisplayAttribute(): string
    {
        if ($this->reps_range_min && $this->reps_range_max) {
            return "{$this->reps_range_min}-{$this->reps_range_max}";
        }
        if ($this->duration_seconds) {
            return "{$this->duration_seconds}s";
        }
        return (string) ($this->reps ?? 0);
    }

    public function getVolumeAttribute(): float
    {
        $reps = $this->reps ?? (($this->reps_range_min + $this->reps_range_max) / 2 ?? 0);
        return $this->sets * $reps * ($this->weight_recommendation ?? 1);
    }
}
