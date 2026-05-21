<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingPlan extends Model
{
    use HasFactory, SoftDeletes;

    const DIFFICULTY_BEGINNER = 'beginner';
    const DIFFICULTY_INTERMEDIATE = 'intermediate';
    const DIFFICULTY_ADVANCED = 'advanced';

    const LOCATION_HOME = 'home';
    const LOCATION_GYM = 'gym';
    const LOCATION_BOTH = 'both';

    protected $fillable = [
        'name',
        'name_es',
        'description',
        'description_es',
        'difficulty',
        'location_type',
        'duration_weeks',
        'sessions_per_week',
        'estimated_session_duration',
        'created_by',
        'tenant_id',
        'is_ai_generated',
        'is_public',
        'is_active',
        'cover_image_url',
        'tags',
        'target_goals',
        'required_equipment',
        'ai_generation_params',
        'sort_order',
    ];

    protected $casts = [
        'is_ai_generated' => 'boolean',
        'is_public' => 'boolean',
        'is_active' => 'boolean',
        'tags' => 'array',
        'target_goals' => 'array',
        'required_equipment' => 'array',
        'ai_generation_params' => 'array',
        'duration_weeks' => 'integer',
        'sessions_per_week' => 'integer',
        'estimated_session_duration' => 'integer',
        'sort_order' => 'integer',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Relationships
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function workouts(): HasMany
    {
        return $this->hasMany(PlanWorkout::class, 'plan_id')->orderBy('week_number')->orderBy('day_number');
    }

    public function userTrainingPlans(): HasMany
    {
        return $this->hasMany(UserTrainingPlan::class, 'plan_id');
    }

    public function activeSubscriptions(): HasMany
    {
        return $this->hasMany(UserTrainingPlan::class, 'plan_id')->where('is_active', true);
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

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where(function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId)
              ->orWhere('is_public', true);
        });
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'LIKE', "%{$term}%")
              ->orWhere('name_es', 'LIKE', "%{$term}%")
              ->orWhere('description', 'LIKE', "%{$term}%");
        });
    }

    /**
     * Accessors
     */
    public function getLocalizedNameAttribute(): string
    {
        return $this->name_es ?? $this->name;
    }

    public function getTotalSessionsAttribute(): int
    {
        return $this->duration_weeks * $this->sessions_per_week;
    }

    public function getSubscribersCountAttribute(): int
    {
        return $this->activeSubscriptions()->count();
    }
}
