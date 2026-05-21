<?php

namespace App\Services;

use App\Models\UserProfile;
use App\Models\Exercise;
use App\Models\WorkoutSession;

class WeightRecommendationService
{
    private const STRENGTH_LEVELS = [
        'beginner'     => ['factor' => 0.3, 'rpe' => 7],
        'intermediate' => ['factor' => 0.5, 'rpe' => 8],
        'advanced'     => ['factor' => 0.7, 'rpe' => 9],
    ];

    private const EXERCISE_MULTIPLIERS = [
        'squat'          => ['men' => 1.0,  'women' => 0.65],
        'deadlift'       => ['men' => 1.2,  'women' => 0.75],
        'bench_press'    => ['men' => 0.75, 'women' => 0.45],
        'overhead_press' => ['men' => 0.55, 'women' => 0.35],
        'barbell_row'    => ['men' => 0.65, 'women' => 0.40],
        'default'        => ['men' => 0.5,  'women' => 0.35],
    ];

    public function recommend(UserProfile $profile, Exercise $exercise, int $reps = 10): array
    {
        $bodyWeight = $profile->weight_kg ?? 70;
        $fitnessLevel = $profile->fitness_level ?? 'beginner';
        $sex = $profile->sex ?? 'male';
        $age = $profile->date_of_birth
            ? \Carbon\Carbon::parse($profile->date_of_birth)->age
            : 30;

        $exerciseKey = $this->getExerciseKey($exercise->name);
        $multiplier = self::EXERCISE_MULTIPLIERS[$exerciseKey][$sex === 'female' ? 'women' : 'men'];
        $levelFactor = self::STRENGTH_LEVELS[$fitnessLevel]['factor'];

        $baseWeight = $bodyWeight * $multiplier * $levelFactor;

        // Age adjustment (reduce by 1% per year over 40)
        if ($age > 40) {
            $baseWeight *= (1 - (($age - 40) * 0.01));
        }

        // Reps adjustment (heavier for low reps, lighter for high reps)
        $repsAdjustment = 1 - (($reps - 8) * 0.025);
        $recommendedWeight = max(0, round($baseWeight * $repsAdjustment / 2.5) * 2.5);

        return [
            'recommended_kg' => $recommendedWeight,
            'min_kg' => max(0, $recommendedWeight - 5),
            'max_kg' => $recommendedWeight + 10,
            'warmup_sets' => $this->generateWarmupSets($recommendedWeight),
            'notes' => $this->generateNotes($fitnessLevel, $reps),
            'progression' => [
                'next_session' => $recommendedWeight + 2.5,
                'next_week' => $recommendedWeight + 5,
            ],
        ];
    }

    public function getProgressionSuggestion(int $userId, int $exerciseId): ?array
    {
        $sessions = WorkoutSession::where('user_id', $userId)
            ->whereHas('exercises', fn($q) => $q->where('exercise_id', $exerciseId))
            ->with(['exercises' => fn($q) => $q->where('exercise_id', $exerciseId)])
            ->latest()
            ->take(3)
            ->get();

        if ($sessions->isEmpty()) {
            return null;
        }

        $weights = $sessions->flatMap(fn($s) => $s->exercises->flatMap(fn($e) => $e->weight_used ?? []))
            ->filter()
            ->values();

        if ($weights->isEmpty()) {
            return null;
        }

        $lastWeight = $weights->last();
        $avgWeight = $weights->average();

        return [
            'last_weight' => $lastWeight,
            'average_weight' => round($avgWeight, 1),
            'suggested_next' => $lastWeight + 2.5,
            'trend' => $weights->count() > 1 ? ($lastWeight > $weights->first() ? 'increasing' : 'stable') : 'new',
        ];
    }

    private function getExerciseKey(string $exerciseName): string
    {
        $name = strtolower($exerciseName);
        $mappings = [
            'squat' => ['sentadilla', 'squat', 'cuclillas'],
            'deadlift' => ['peso muerto', 'deadlift'],
            'bench_press' => ['press banca', 'bench press', 'pecho'],
            'overhead_press' => ['press militar', 'overhead', 'hombros'],
            'barbell_row' => ['remo con barra', 'barbell row', 'remo'],
        ];

        foreach ($mappings as $key => $terms) {
            foreach ($terms as $term) {
                if (str_contains($name, $term)) {
                    return $key;
                }
            }
        }

        return 'default';
    }

    private function generateWarmupSets(float $workWeight): array
    {
        if ($workWeight < 20) {
            return [];
        }

        return [
            ['weight' => round($workWeight * 0.4 / 2.5) * 2.5, 'reps' => 10, 'label' => 'Calentamiento 1'],
            ['weight' => round($workWeight * 0.6 / 2.5) * 2.5, 'reps' => 6,  'label' => 'Calentamiento 2'],
            ['weight' => round($workWeight * 0.8 / 2.5) * 2.5, 'reps' => 3,  'label' => 'Activación'],
        ];
    }

    private function generateNotes(string $fitnessLevel, int $reps): string
    {
        $notes = [
            'beginner' => 'Enfócate en la técnica correcta antes de añadir peso. La forma es más importante que la carga.',
            'intermediate' => 'Aplica progresión gradual. Aumenta el peso cuando puedas completar todas las repeticiones con buena forma.',
            'advanced' => 'Usa técnicas avanzadas como periodización ondulatoria. Considera incluir semanas de descarga.',
        ];

        return $notes[$fitnessLevel] ?? $notes['beginner'];
    }
}
