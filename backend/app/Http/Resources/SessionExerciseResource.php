<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'session_id' => $this->session_id,
            'exercise_id' => $this->exercise_id,
            'exercise' => $this->whenLoaded('exercise', fn() => [
                'id' => $this->exercise->id,
                'name' => $this->exercise->name,
                'image_url' => $this->exercise->image_url,
            ]),
            'sets_completed' => $this->sets_completed ?? [],
            'weight_used' => $this->weight_used ?? [],
            'reps_completed' => $this->reps_completed ?? [],
            'duration_seconds' => $this->duration_seconds,
            'notes' => $this->notes,
        ];
    }
}
