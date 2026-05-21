<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'plan',
        'settings',
        'is_active',
        'owner_name',
        'owner_email',
        'phone',
        'address',
        'city',
        'country',
        'timezone',
        'logo_url',
        'primary_color',
        'max_users',
        'trial_ends_at',
        'subscribed_at',
        'subscription_expires_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
        'trial_ends_at' => 'datetime',
        'subscribed_at' => 'datetime',
        'subscription_expires_at' => 'datetime',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Available subscription plans
     */
    const PLAN_TRIAL = 'trial';
    const PLAN_BASIC = 'basic';
    const PLAN_PRO = 'pro';
    const PLAN_ENTERPRISE = 'enterprise';

    public static array $plans = [
        self::PLAN_TRIAL => ['name' => 'Trial', 'max_users' => 5, 'ai_requests_per_day' => 10],
        self::PLAN_BASIC => ['name' => 'Basic', 'max_users' => 50, 'ai_requests_per_day' => 50],
        self::PLAN_PRO => ['name' => 'Pro', 'max_users' => 500, 'ai_requests_per_day' => 500],
        self::PLAN_ENTERPRISE => ['name' => 'Enterprise', 'max_users' => -1, 'ai_requests_per_day' => -1],
    ];

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Relationships
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function trainingPlans(): HasMany
    {
        return $this->hasMany(TrainingPlan::class);
    }

    public function challenges(): HasMany
    {
        return $this->hasMany(Challenge::class);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Accessors & Mutators
     */
    public function getIsTrialExpiredAttribute(): bool
    {
        if ($this->plan !== self::PLAN_TRIAL) {
            return false;
        }

        return $this->trial_ends_at && $this->trial_ends_at->isPast();
    }

    public function getIsSubscriptionActiveAttribute(): bool
    {
        if ($this->plan === self::PLAN_TRIAL) {
            return !$this->is_trial_expired;
        }

        return $this->subscription_expires_at === null || $this->subscription_expires_at->isFuture();
    }

    public function getPlanLimitsAttribute(): array
    {
        return self::$plans[$this->plan] ?? self::$plans[self::PLAN_TRIAL];
    }

    public function getSettingAttribute(string $key, mixed $default = null): mixed
    {
        return data_get($this->settings, $key, $default);
    }

    public function setSetting(string $key, mixed $value): void
    {
        $settings = $this->settings ?? [];
        data_set($settings, $key, $value);
        $this->settings = $settings;
        $this->save();
    }
}
