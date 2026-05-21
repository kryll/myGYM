<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Challenge extends Model
{
    use HasFactory, SoftDeletes;

    const TYPE_WORKOUT_COUNT = 'workout_count';
    const TYPE_TOTAL_DURATION = 'total_duration';
    const TYPE_CALORIES_BURNED = 'calories_burned';
    const TYPE_WEIGHT_LOSS = 'weight_loss';
    const TYPE_STREAK = 'streak';
    const TYPE_DISTANCE = 'distance';
    const TYPE_STEPS = 'steps';
    const TYPE_CUSTOM = 'custom';

    const DIFFICULTY_BEGINNER = 'beginner';
    const DIFFICULTY_INTERMEDIATE = 'intermediate';
    const DIFFICULTY_ADVANCED = 'advanced';
    const DIFFICULTY_ELITE = 'elite';

    protected $fillable = [
        'title',
        'title_es',
        'description',
        'description_es',
        'type',
        'difficulty',
        'duration_days',
        'target_value',
        'target_unit',
        'reward_points',
        'cover_image_url',
        'badge_image_url',
        'start_date',
        'end_date',
        'is_active',
        'is_public',
        'tenant_id',
        'created_by',
        'max_participants',
        'tags',
        'rules',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'duration_days' => 'integer',
        'target_value' => 'float',
        'reward_points' => 'integer',
        'max_participants' => 'integer',
        'tags' => 'array',
        'rules' => 'array',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Relationships
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(UserChallenge::class);
    }

    public function completedParticipants(): HasMany
    {
        return $this->hasMany(UserChallenge::class)->where('is_completed', true);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrent($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')
                  ->orWhere('start_date', '<=', now()->toDateString());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', now()->toDateString());
            });
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>', now()->toDateString());
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where(function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId)
              ->orWhere('is_public', true);
        });
    }

    /**
     * Accessors
     */
    public function getLocalizedTitleAttribute(): string
    {
        return $this->title_es ?? $this->title;
    }

    public function getParticipantsCountAttribute(): int
    {
        return $this->participants()->count();
    }

    public function getCompletionRateAttribute(): float
    {
        $total = $this->participants_count;
        if ($total === 0) {
            return 0;
        }
        return round(($this->completedParticipants()->count() / $total) * 100, 1);
    }

    public function getIsEndedAttribute(): bool
    {
        return $this->end_date && $this->end_date->isPast();
    }

    public function getIsStartedAttribute(): bool
    {
        return !$this->start_date || $this->start_date->isPast();
    }

    public function getDaysRemainingAttribute(): ?int
    {
        if (!$this->end_date) {
            return null;
        }
        return max(0, now()->diffInDays($this->end_date, false));
    }
}
