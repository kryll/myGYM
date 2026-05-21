<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'muscle_groups' => $this->muscle_groups,
            'equipment' => $this->whenLoaded('equipment', fn() => [
                'id' => $this->equipment->id,
                'name' => $this->equipment->name,
                'location' => $this->equipment->location,
            ]),
            'difficulty' => $this->difficulty,
            'location_type' => $this->location_type,
            'video_url' => $this->video_url,
            'image_url' => $this->image_url,
            'instructions' => $this->instructions,
            'calories_per_minute' => $this->calories_per_minute,
            'created_at' => $this->created_at,
        ];
    }
}
