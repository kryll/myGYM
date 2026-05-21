<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exercise extends Model
{
    use HasFactory, SoftDeletes;

    const DIFFICULTY_BEGINNER = 'beginner';
    const DIFFICULTY_INTERMEDIATE = 'intermediate';
    const DIFFICULTY_ADVANCED = 'advanced';

    const LOCATION_HOME = 'home';
    const LOCATION_GYM = 'gym';
    const LOCATION_BOTH = 'both';

    const TYPE_STRENGTH = 'strength';
    const TYPE_CARDIO = 'cardio';
    const TYPE_FLEXIBILITY = 'flexibility';
    const TYPE_BALANCE = 'balance';
    const TYPE_HIIT = 'hiit';
    const TYPE_PLYOMETRIC = 'plyometric';
    const TYPE_FUNCTIONAL = 'functional';

    protected $fillable = [
        'name',
        'name_es',
        'description',
        'description_es',
        'primary_muscle_group_id',
        'muscle_groups',
        'secondary_muscle_groups',
        'equipment_id',
        'difficulty',
        'location_type',
        'exercise_type',
        'video_url',
        'image_url',
        'thumbnail_url',
        'instructions',
        'tips',
        'variations',
        'calories_per_minute',
        'met_value',
        'is_compound',
        'is_public',
        'is_active',
        'created_by_tenant_id',
        'tags',
    ];

    protected $casts = [
        'muscle_groups' => 'array',
        'secondary_muscle_groups' => 'array',
        'instructions' => 'array',
        'tips' => 'array',
        'variations' => 'array',
        'tags' => 'array',
        'calories_per_minute' => 'float',
        'met_value' => 'float',
        'is_compound' => 'boolean',
        'is_public' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Relationships
     */
    public function primaryMuscleGroup(): BelongsTo
    {
        return $this->belongsTo(MuscleGroup::class, 'primary_muscle_group_id');
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(EquipmentType::class, 'equipment_id');
    }

    public function createdByTenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'created_by_tenant_id');
    }

    public function workoutExercises(): HasMany
    {
        return $this->hasMany(WorkoutExercise::class);
    }

    public function sessionExercises(): HasMany
    {
        return $this->hasMany(SessionExercise::class);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByDifficulty($query, string $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    public function scopeByLocation($query, string $location)
    {
        return $query->where(function ($q) use ($location) {
            $q->where('location_type', $location)
              ->orWhere('location_type', self::LOCATION_BOTH);
        });
    }

    public function scopeByMuscleGroup($query, int $muscleGroupId)
    {
        return $query->where('primary_muscle_group_id', $muscleGroupId)
                     ->orWhereJsonContains('muscle_groups', $muscleGroupId);
    }

    public function scopeByEquipment($query, int $equipmentId)
    {
        return $query->where('equipment_id', $equipmentId);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('exercise_type', $type);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'LIKE', "%{$term}%")
              ->orWhere('name_es', 'LIKE', "%{$term}%")
              ->orWhere('description_es', 'LIKE', "%{$term}%")
              ->orWhereJsonContains('tags', strtolower($term));
        });
    }

    /**
     * Accessors
     */
    public function getLocalizedNameAttribute(): string
    {
        return $this->name_es ?? $this->name;
    }

    public function getLocalizedDescriptionAttribute(): ?string
    {
        return $this->description_es ?? $this->description;
    }

    public function calculateCaloriesBurned(int $durationMinutes, float $weightKg): float
    {
        if ($this->met_value) {
            return round(($this->met_value * 3.5 * $weightKg / 200) * $durationMinutes, 1);
        }

        return round(($this->calories_per_minute ?? 5) * $durationMinutes, 1);
    }
}
