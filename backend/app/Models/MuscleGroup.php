<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MuscleGroup extends Model
{
    use HasFactory;

    const BODY_PART_UPPER = 'upper';
    const BODY_PART_LOWER = 'lower';
    const BODY_PART_CORE = 'core';
    const BODY_PART_FULL = 'full';

    protected $fillable = [
        'name',
        'name_es',
        'body_part',
        'image_url',
        'description',
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
        return $this->hasMany(Exercise::class, 'primary_muscle_group_id');
    }

    /**
     * Scopes
     */
    public function scopeByBodyPart($query, string $bodyPart)
    {
        return $query->where('body_part', $bodyPart);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
