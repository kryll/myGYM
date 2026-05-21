<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $age = $this->date_of_birth
            ? \Carbon\Carbon::parse($this->date_of_birth)->age
            : null;

        $bmi = ($this->height_cm && $this->weight_kg)
            ? round($this->weight_kg / (($this->height_cm / 100) ** 2), 1)
            : null;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'date_of_birth' => $this->date_of_birth,
            'age' => $age,
            'height_cm' => $this->height_cm,
            'weight_kg' => $this->weight_kg,
            'sex' => $this->sex,
            'fitness_level' => $this->fitness_level,
            'primary_goal' => $this->primary_goal,
            'available_equipment' => $this->available_equipment ?? [],
            'medical_notes' => $this->medical_notes,
            'bmi' => $bmi,
            'bmi_category' => $this->getBMICategory($bmi),
            'updated_at' => $this->updated_at,
        ];
    }

    private function getBMICategory(?float $bmi): ?string
    {
        if (!$bmi) return null;
        if ($bmi < 18.5) return 'bajo_peso';
        if ($bmi < 25.0) return 'normal';
        if ($bmi < 30.0) return 'sobrepeso';
        return 'obesidad';
    }
}
