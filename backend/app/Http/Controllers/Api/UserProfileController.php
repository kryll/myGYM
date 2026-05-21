<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserProfileResource;
use App\Models\UserProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = UserProfile::firstOrCreate(
            ['user_id' => $request->user()->id],
            []
        );

        return response()->json([
            'success' => true,
            'data' => new UserProfileResource($profile),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'date_of_birth' => 'nullable|date|before:today',
            'height_cm' => 'nullable|numeric|min:100|max:250',
            'weight_kg' => 'nullable|numeric|min:20|max:300',
            'sex' => 'nullable|in:male,female,other',
            'fitness_level' => 'nullable|in:beginner,intermediate,advanced',
            'primary_goal' => 'nullable|string|max:255',
            'available_equipment' => 'nullable|array',
            'medical_notes' => 'nullable|string|max:1000',
        ]);

        $profile = UserProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $request->only([
                'date_of_birth', 'height_cm', 'weight_kg',
                'sex', 'fitness_level', 'primary_goal',
                'available_equipment', 'medical_notes',
            ])
        );

        return response()->json([
            'success' => true,
            'data' => new UserProfileResource($profile->fresh()),
            'message' => 'Perfil actualizado correctamente',
        ]);
    }

    public function bodyAnalysis(Request $request): JsonResponse
    {
        $profile = UserProfile::where('user_id', $request->user()->id)->first();

        if (!$profile || !$profile->height_cm || !$profile->weight_kg) {
            return response()->json([
                'success' => false,
                'message' => 'Completa tu altura y peso en el perfil primero',
            ], 400);
        }

        $age = $profile->date_of_birth
            ? \Carbon\Carbon::parse($profile->date_of_birth)->age
            : null;

        $bmi = round($profile->weight_kg / (($profile->height_cm / 100) ** 2), 1);

        $bmr = $this->calculateBMR($profile);
        $tdee = $this->calculateTDEE($bmr, $profile->fitness_level ?? 'beginner');

        $idealWeight = $this->calculateIdealWeight($profile->height_cm, $profile->sex);

        return response()->json([
            'success' => true,
            'data' => [
                'bmi' => $bmi,
                'bmi_category' => $this->getBMICategory($bmi),
                'bmr' => round($bmr),
                'tdee' => round($tdee),
                'ideal_weight_range' => $idealWeight,
                'age' => $age,
                'calorie_recommendations' => [
                    'maintenance' => round($tdee),
                    'weight_loss' => round($tdee - 500),
                    'muscle_gain' => round($tdee + 300),
                ],
                'macros_suggestion' => $this->calculateMacros($tdee, $profile->primary_goal),
            ],
        ]);
    }

    private function calculateBMR(UserProfile $profile): float
    {
        $weight = $profile->weight_kg ?? 70;
        $height = $profile->height_cm ?? 170;
        $age = $profile->date_of_birth
            ? \Carbon\Carbon::parse($profile->date_of_birth)->age
            : 30;
        $sex = $profile->sex ?? 'male';

        if ($sex === 'male') {
            return 88.362 + (13.397 * $weight) + (4.799 * $height) - (5.677 * $age);
        } else {
            return 447.593 + (9.247 * $weight) + (3.098 * $height) - (4.330 * $age);
        }
    }

    private function calculateTDEE(float $bmr, string $fitnessLevel): float
    {
        $multipliers = [
            'beginner' => 1.375,
            'intermediate' => 1.55,
            'advanced' => 1.725,
        ];

        return $bmr * ($multipliers[$fitnessLevel] ?? 1.375);
    }

    private function calculateIdealWeight(float $heightCm, ?string $sex): array
    {
        $heightM = $heightCm / 100;
        $minBMI = 18.5;
        $maxBMI = 24.9;

        return [
            'min_kg' => round($minBMI * ($heightM ** 2), 1),
            'max_kg' => round($maxBMI * ($heightM ** 2), 1),
        ];
    }

    private function calculateMacros(float $tdee, ?string $goal): array
    {
        $calories = match ($goal) {
            'weight_loss' => $tdee - 500,
            'muscle_gain' => $tdee + 300,
            default => $tdee,
        };

        $proteinRatio = match ($goal) {
            'muscle_gain' => 0.30,
            'weight_loss' => 0.35,
            default => 0.25,
        };

        $proteinG = round(($calories * $proteinRatio) / 4);
        $fatG = round(($calories * 0.25) / 9);
        $carbsG = round(($calories - ($proteinG * 4) - ($fatG * 9)) / 4);

        return [
            'calories' => round($calories),
            'protein_g' => $proteinG,
            'carbs_g' => $carbsG,
            'fat_g' => $fatG,
        ];
    }

    private function getBMICategory(float $bmi): string
    {
        if ($bmi < 18.5) return 'Bajo peso';
        if ($bmi < 25.0) return 'Peso normal';
        if ($bmi < 30.0) return 'Sobrepeso';
        if ($bmi < 35.0) return 'Obesidad I';
        return 'Obesidad II-III';
    }
}
