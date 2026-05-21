<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionExercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'exercise_id',
        'workout_exercise_id',
        'sets_completed',
        'weight_used',
        'reps_completed',
        'duration_seconds',
        'rest_taken_seconds',
        'heart_rate_during',
        'perceived_exertion',
        'notes',
        'is_completed',
        'skipped_reason',
        'personal_record',
    ];

    protected $casts = [
        'sets_completed' => 'array',
        'weight_used' => 'array',
        'reps_completed' => 'array',
        'heart_rate_during' => 'array',
        'duration_seconds' => 'integer',
        'rest_taken_seconds' => 'integer',
        'perceived_exertion' => 'integer',
        'is_completed' => 'boolean',
        'personal_record' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(WorkoutSession::class, 'session_id');
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    public function workoutExercise(): BelongsTo
    {
        return $this->belongsTo(WorkoutExercise::class, 'workout_exercise_id');
    }

    /**
     * Computed metrics
     */
    public function getTotalRepsAttribute(): int
    {
        if (is_array($this->reps_completed)) {
            return array_sum($this->reps_completed);
        }
        return 0;
    }

    public function getTotalSetsAttribute(): int
    {
        return is_array($this->sets_completed) ? count($this->sets_completed) : 0;
    }

    public function getMaxWeightAttribute(): float
    {
        if (is_array($this->weight_used) && !empty($this->weight_used)) {
            return max($this->weight_used);
        }
        return 0;
    }

    public function getAvgWeightAttribute(): float
    {
        if (is_array($this->weight_used) && !empty($this->weight_used)) {
            return array_sum($this->weight_used) / count($this->weight_used);
        }
        return 0;
    }

    public function getTotalVolumeAttribute(): float
    {
        if (!is_array($this->sets_completed)) {
            return 0;
        }

        $volume = 0;
        foreach ($this->sets_completed as $index => $set) {
            $reps = $this->reps_completed[$index] ?? ($set['reps'] ?? 0);
            $weight = $this->weight_used[$index] ?? ($set['weight'] ?? 1);
            $volume += $reps * $weight;
        }

        return round($volume, 2);
    }

    /**
     * Record a completed set
     */
    public function recordSet(int $reps, float $weight = 0, array $extras = []): void
    {
        $setsCompleted = $this->sets_completed ?? [];
        $repsCompleted = $this->reps_completed ?? [];
        $weightUsed = $this->weight_used ?? [];

        $setsCompleted[] = array_merge(['reps' => $reps, 'weight' => $weight], $extras);
        $repsCompleted[] = $reps;
        $weightUsed[] = $weight;

        $this->update([
            'sets_completed' => $setsCompleted,
            'reps_completed' => $repsCompleted,
            'weight_used' => $weightUsed,
        ]);
    }
}
