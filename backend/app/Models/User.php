<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_ADMIN = 'admin';
    const ROLE_TRAINER = 'trainer';
    const ROLE_USER = 'user';

    public static array $roles = [
        self::ROLE_SUPER_ADMIN,
        self::ROLE_ADMIN,
        self::ROLE_TRAINER,
        self::ROLE_USER,
    ];

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'password',
        'role',
        'fcm_token',
        'avatar_url',
        'phone',
        'is_active',
        'last_login_at',
        'email_verified_at',
        'trainer_id',
        'language',
        'timezone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'deleted_at',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function clients(): HasMany
    {
        return $this->hasMany(User::class, 'trainer_id');
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function bodyMeasurements(): HasMany
    {
        return $this->hasMany(BodyMeasurement::class)->orderByDesc('measured_at');
    }

    public function trainingPlans(): HasMany
    {
        return $this->hasMany(UserTrainingPlan::class);
    }

    public function activeTrainingPlan(): HasOne
    {
        return $this->hasOne(UserTrainingPlan::class)->where('is_active', true);
    }

    public function workoutSessions(): HasMany
    {
        return $this->hasMany(WorkoutSession::class)->orderByDesc('started_at');
    }

    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    public function challenges(): HasMany
    {
        return $this->hasMany(UserChallenge::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class)->orderByDesc('created_at');
    }

    public function aiConversations(): HasMany
    {
        return $this->hasMany(AIConversation::class)->orderByDesc('updated_at');
    }

    public function deviceConnections(): HasMany
    {
        return $this->hasMany(DeviceConnection::class);
    }

    public function createdTrainingPlans(): HasMany
    {
        return $this->hasMany(TrainingPlan::class, 'created_by');
    }

    /**
     * Role helpers
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isTrainer(): bool
    {
        return $this->role === self::ROLE_TRAINER;
    }

    public function isAdminOrAbove(): bool
    {
        return in_array($this->role, [self::ROLE_ADMIN, self::ROLE_SUPER_ADMIN]);
    }

    /**
     * Scopes
     */
    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Computed attributes
     */
    public function getLatestBodyMeasurementAttribute(): ?BodyMeasurement
    {
        return $this->bodyMeasurements()->first();
    }

    public function getUnreadNotificationsCountAttribute(): int
    {
        return $this->notifications()->whereNull('read_at')->count();
    }
}
