<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkoutSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'plan_workout_id' => $this->plan_workout_id,
            'plan_workout' => $this->whenLoaded('planWorkout', fn() => [
                'id' => $this->planWorkout->id,
                'name' => $this->planWorkout->name,
                'day_number' => $this->planWorkout->day_number,
                'week_number' => $this->planWorkout->week_number,
            ]),
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'total_duration_minutes' => $this->total_duration_minutes,
            'calories_burned' => $this->calories_burned,
            'heart_rate_avg' => $this->heart_rate_avg,
            'notes' => $this->notes,
            'device_source' => $this->device_source,
            'is_completed' => !is_null($this->completed_at),
            'exercises' => SessionExerciseResource::collection($this->whenLoaded('exercises')),
        ];
    }
}
