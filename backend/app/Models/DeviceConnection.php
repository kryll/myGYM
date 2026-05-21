<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceConnection extends Model
{
    use HasFactory;

    const DEVICE_XIAOMI_SCALE = 'xiaomi_scale';
    const DEVICE_AMAZFIT = 'amazfit';
    const DEVICE_APPLE_WATCH = 'apple_watch';
    const DEVICE_GARMIN = 'garmin';
    const DEVICE_POLAR = 'polar';
    const DEVICE_FITBIT = 'fitbit';

    protected $fillable = [
        'user_id',
        'device_type',
        'device_name',
        'device_mac',
        'device_model',
        'firmware_version',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'last_sync_at',
        'is_active',
        'settings',
        'capabilities',
        'sync_frequency_minutes',
        'auto_sync',
    ];

    protected $casts = [
        'token_expires_at' => 'datetime',
        'last_sync_at' => 'datetime',
        'is_active' => 'boolean',
        'settings' => 'array',
        'capabilities' => 'array',
        'sync_frequency_minutes' => 'integer',
        'auto_sync' => 'boolean',
    ];

    protected $hidden = [
        'access_token',
        'refresh_token',
    ];

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('device_type', $type);
    }

    public function scopeNeedsSync($query)
    {
        return $query->where('is_active', true)
            ->where('auto_sync', true)
            ->where(function ($q) {
                $q->whereNull('last_sync_at')
                  ->orWhereRaw('last_sync_at < DATE_SUB(NOW(), INTERVAL sync_frequency_minutes MINUTE)');
            });
    }

    /**
     * Accessors
     */
    public function getIsTokenExpiredAttribute(): bool
    {
        return $this->token_expires_at && $this->token_expires_at->isPast();
    }

    public function getNeedsSyncAttribute(): bool
    {
        if (!$this->is_active || !$this->auto_sync) {
            return false;
        }

        if (!$this->last_sync_at) {
            return true;
        }

        $minutesSinceSync = $this->last_sync_at->diffInMinutes(now());
        return $minutesSinceSync >= ($this->sync_frequency_minutes ?? 60);
    }

    public function getDeviceDisplayNameAttribute(): string
    {
        $names = [
            self::DEVICE_XIAOMI_SCALE => 'Xiaomi Mi Scale',
            self::DEVICE_AMAZFIT => 'Amazfit',
            self::DEVICE_APPLE_WATCH => 'Apple Watch',
            self::DEVICE_GARMIN => 'Garmin',
            self::DEVICE_POLAR => 'Polar',
            self::DEVICE_FITBIT => 'Fitbit',
        ];

        return $names[$this->device_type] ?? $this->device_type;
    }

    /**
     * Update the last sync timestamp
     */
    public function recordSync(): void
    {
        $this->update(['last_sync_at' => now()]);
    }

    /**
     * Update access tokens
     */
    public function updateTokens(string $accessToken, string $refreshToken = null, $expiresAt = null): void
    {
        $this->update([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken ?? $this->refresh_token,
            'token_expires_at' => $expiresAt,
        ]);
    }
}
