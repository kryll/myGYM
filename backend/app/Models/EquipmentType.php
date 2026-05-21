<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EquipmentType extends Model
{
    use HasFactory;

    const LOCATION_HOME = 'home';
    const LOCATION_GYM = 'gym';
    const LOCATION_BOTH = 'both';

    protected $fillable = [
        'name',
        'name_es',
        'location',
        'description',
        'image_url',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * Relationships
     */
    public function exercises(): HasMany
    {
        return $this->hasMany(Exercise::class, 'equipment_id');
    }

    /**
     * Scopes
     */
    public function scopeForLocation($query, string $location)
    {
        return $query->where(function ($q) use ($location) {
            $q->where('location', $location)
              ->orWhere('location', self::LOCATION_BOTH);
        });
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
