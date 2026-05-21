<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory;

    const FITNESS_LEVEL_BEGINNER = 'beginner';
    const FITNESS_LEVEL_INTERMEDIATE = 'intermediate';
    const FITNESS_LEVEL_ADVANCED = 'advanced';

    const GOAL_LOSE_WEIGHT = 'lose_weight';
    const GOAL_GAIN_MUSCLE = 'gain_muscle';
    const GOAL_IMPROVE_ENDURANCE = 'improve_endurance';
    const GOAL_IMPROVE_STRENGTH = 'improve_strength';
    const GOAL_GENERAL_FITNESS = 'general_fitness';
    const GOAL_SPORT_PERFORMANCE = 'sport_performance';
    const GOAL_REHABILITATION = 'rehabilitation';
    const GOAL_MAINTAIN_WEIGHT = 'maintain_weight';

    const SEX_MALE = 'male';
    const SEX_FEMALE = 'female';
    const SEX_OTHER = 'other';

    protected $fillable = [
        'user_id',
        'date_of_birth',
        'height_cm',
        'weight_kg',
        'sex',
        'fitness_level',
        'primary_goal',
        'secondary_goals',
        'available_equipment',
        'workout_days_per_week',
        'preferred_workout_duration',
        'medical_notes',
        'injuries',
        'activity_level',
        'occupation',
        'dietary_preferences',
        'onboarding_completed',
        'onboarding_completed_at',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'height_cm' => 'float',
        'weight_kg' => 'float',
        'secondary_goals' => 'array',
        'available_equipment' => 'array',
        'injuries' => 'array',
        'dietary_preferences' => 'array',
        'onboarding_completed' => 'boolean',
        'onboarding_completed_at' => 'datetime',
        'workout_days_per_week' => 'integer',
        'preferred_workout_duration' => 'integer',
    ];

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Computed attributes
     */
    public function getAgeAttribute(): ?int
    {
        if (!$this->date_of_birth) {
            return null;
        }

        return $this->date_of_birth->age;
    }

    public function getBmiAttribute(): ?float
    {
        if (!$this->height_cm || !$this->weight_kg) {
            return null;
        }

        $heightM = $this->height_cm / 100;
        return round($this->weight_kg / ($heightM * $heightM), 1);
    }

    public function getBmiCategoryAttribute(): ?string
    {
        $bmi = $this->bmi;

        if ($bmi === null) {
            return null;
        }

        return match (true) {
            $bmi < 18.5 => 'bajo_peso',
            $bmi < 25.0 => 'peso_normal',
            $bmi < 30.0 => 'sobrepeso',
            $bmi < 35.0 => 'obesidad_grado_1',
            $bmi < 40.0 => 'obesidad_grado_2',
            default => 'obesidad_grado_3',
        };
    }

    public function getBasalMetabolicRateAttribute(): ?float
    {
        if (!$this->weight_kg || !$this->height_cm || !$this->date_of_birth || !$this->sex) {
            return null;
        }

        $age = $this->age;

        // Mifflin-St Jeor equation
        if ($this->sex === self::SEX_MALE) {
            return round(10 * $this->weight_kg + 6.25 * $this->height_cm - 5 * $age + 5);
        } else {
            return round(10 * $this->weight_kg + 6.25 * $this->height_cm - 5 * $age - 161);
        }
    }

    public function getTdeeAttribute(): ?float
    {
        $bmr = $this->basal_metabolic_rate;

        if ($bmr === null) {
            return null;
        }

        $activityMultipliers = [
            'sedentary' => 1.2,
            'lightly_active' => 1.375,
            'moderately_active' => 1.55,
            'very_active' => 1.725,
            'extra_active' => 1.9,
        ];

        $multiplier = $activityMultipliers[$this->activity_level] ?? 1.375;

        return round($bmr * $multiplier);
    }

    public function getIdealWeightRangeAttribute(): ?array
    {
        if (!$this->height_cm) {
            return null;
        }

        $heightM = $this->height_cm / 100;

        return [
            'min' => round(18.5 * $heightM * $heightM, 1),
            'max' => round(24.9 * $heightM * $heightM, 1),
        ];
    }
}
