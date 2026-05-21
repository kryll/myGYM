<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BodyMeasurement extends Model
{
    use HasFactory;

    const SOURCE_MANUAL = 'manual';
    const SOURCE_XIAOMI_SCALE = 'xiaomi_scale';
    const SOURCE_AMAZFIT = 'amazfit';
    const SOURCE_APPLE_HEALTH = 'apple_health';
    const SOURCE_GOOGLE_FIT = 'google_fit';

    protected $fillable = [
        'user_id',
        'measured_at',
        'weight_kg',
        'bmi',
        'body_fat_percent',
        'muscle_mass_kg',
        'water_percent',
        'bone_mass_kg',
        'visceral_fat',
        'metabolic_age',
        'protein_percent',
        'basal_metabolism',
        'subcutaneous_fat',
        'skeletal_muscle_rate',
        'body_score',
        'source',
        'device_id',
        'raw_data',
        'notes',
    ];

    protected $casts = [
        'measured_at' => 'datetime',
        'weight_kg' => 'float',
        'bmi' => 'float',
        'body_fat_percent' => 'float',
        'muscle_mass_kg' => 'float',
        'water_percent' => 'float',
        'bone_mass_kg' => 'float',
        'visceral_fat' => 'float',
        'metabolic_age' => 'integer',
        'protein_percent' => 'float',
        'basal_metabolism' => 'float',
        'subcutaneous_fat' => 'float',
        'skeletal_muscle_rate' => 'float',
        'body_score' => 'float',
        'raw_data' => 'array',
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
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeInDateRange($query, $from, $to)
    {
        return $query->whereBetween('measured_at', [$from, $to]);
    }

    public function scopeLatestFirst($query)
    {
        return $query->orderByDesc('measured_at');
    }

    public function scopeBySource($query, string $source)
    {
        return $query->where('source', $source);
    }

    /**
     * Accessors
     */
    public function getBmiCategoryAttribute(): string
    {
        if (!$this->bmi) {
            return 'unknown';
        }

        return match (true) {
            $this->bmi < 18.5 => 'bajo_peso',
            $this->bmi < 25.0 => 'peso_normal',
            $this->bmi < 30.0 => 'sobrepeso',
            $this->bmi < 35.0 => 'obesidad_grado_1',
            $this->bmi < 40.0 => 'obesidad_grado_2',
            default => 'obesidad_grado_3',
        };
    }

    public function getBodyFatCategoryAttribute(): ?string
    {
        if (!$this->body_fat_percent) {
            return null;
        }

        // General ranges (varies by sex and age)
        return match (true) {
            $this->body_fat_percent < 6 => 'esencial',
            $this->body_fat_percent < 14 => 'atletico',
            $this->body_fat_percent < 18 => 'fitness',
            $this->body_fat_percent < 25 => 'aceptable',
            default => 'obesidad',
        };
    }

    public function getLeanMassKgAttribute(): ?float
    {
        if (!$this->weight_kg || !$this->body_fat_percent) {
            return null;
        }

        return round($this->weight_kg * (1 - $this->body_fat_percent / 100), 2);
    }
}
