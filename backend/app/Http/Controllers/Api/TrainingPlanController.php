<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrainingPlan;
use App\Models\UserTrainingPlan;
use App\Models\PlanWorkout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingPlanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TrainingPlan::with(['creator'])
            ->where(function ($q) use ($request) {
                $q->where('is_public', true)
                  ->orWhere('tenant_id', $request->user()->tenant_id)
                  ->orWhere('created_by', $request->user()->id);
            });

        if ($request->difficulty) {
            $query->where('difficulty', $request->difficulty);
        }

        if ($request->location_type) {
            $query->whereIn('location_type', [$request->location_type, 'both']);
        }

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%");
        }

        $plans = $query->orderBy('name')->paginate(12);

        $userPlanIds = UserTrainingPlan::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->pluck('plan_id')
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => $plans->map(fn($plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'difficulty' => $plan->difficulty,
                'location_type' => $plan->location_type,
                'duration_weeks' => $plan->duration_weeks,
                'sessions_per_week' => $plan->sessions_per_week,
                'is_ai_generated' => $plan->is_ai_generated,
                'is_subscribed' => in_array($plan->id, $userPlanIds),
                'creator' => $plan->creator ? ['name' => $plan->creator->name] : null,
            ]),
            'meta' => [
                'current_page' => $plans->currentPage(),
                'last_page' => $plans->lastPage(),
                'total' => $plans->total(),
            ],
        ]);
    }

    public function show(Request $request, TrainingPlan $plan): JsonResponse
    {
        $plan->load(['workouts.exercises.exercise', 'creator']);

        $userPlan = UserTrainingPlan::where('user_id', $request->user()->id)
            ->where('plan_id', $plan->id)
            ->where('is_active', true)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'difficulty' => $plan->difficulty,
                'location_type' => $plan->location_type,
                'duration_weeks' => $plan->duration_weeks,
                'sessions_per_week' => $plan->sessions_per_week,
                'is_ai_generated' => $plan->is_ai_generated,
                'workouts' => $plan->workouts->groupBy('week_number')->map(fn($weekWorkouts) =>
                    $weekWorkouts->sortBy('day_number')->map(fn($workout) => [
                        'id' => $workout->id,
                        'name' => $workout->name,
                        'week_number' => $workout->week_number,
                        'day_number' => $workout->day_number,
                        'estimated_duration_minutes' => $workout->estimated_duration_minutes,
                        'notes' => $workout->notes,
                        'exercises' => $workout->exercises->map(fn($we) => [
                            'id' => $we->id,
                            'exercise_id' => $we->exercise_id,
                            'name' => $we->exercise?->name,
                            'sets' => $we->sets,
                            'reps' => $we->reps,
                            'duration_seconds' => $we->duration_seconds,
                            'rest_seconds' => $we->rest_seconds,
                            'weight_recommendation' => $we->weight_recommendation,
                            'order' => $we->order,
                            'notes' => $we->notes,
                        ]),
                    ])
                ),
                'user_progress' => $userPlan ? [
                    'started_at' => $userPlan->started_at,
                    'current_week' => $userPlan->current_week,
                    'current_day' => $userPlan->current_day,
                    'is_active' => $userPlan->is_active,
                ] : null,
            ],
        ]);
    }

    public function subscribe(Request $request, TrainingPlan $plan): JsonResponse
    {
        $existing = UserTrainingPlan::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->first();

        if ($existing) {
            $existing->update(['is_active' => false]);
        }

        $userPlan = UserTrainingPlan::create([
            'user_id' => $request->user()->id,
            'plan_id' => $plan->id,
            'started_at' => now(),
            'current_week' => 1,
            'current_day' => 1,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $userPlan,
            'message' => "¡Empezamos! Te has suscrito al plan: {$plan->name}",
        ], 201);
    }

    public function unsubscribe(Request $request, TrainingPlan $plan): JsonResponse
    {
        UserTrainingPlan::where('user_id', $request->user()->id)
            ->where('plan_id', $plan->id)
            ->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Te has dado de baja del plan de entrenamiento',
        ]);
    }

    public function myPlans(Request $request): JsonResponse
    {
        $userPlans = UserTrainingPlan::where('user_id', $request->user()->id)
            ->with('plan')
            ->orderByDesc('started_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $userPlans->map(fn($up) => [
                'id' => $up->id,
                'plan_id' => $up->plan_id,
                'plan_name' => $up->plan?->name,
                'plan_difficulty' => $up->plan?->difficulty,
                'started_at' => $up->started_at,
                'completed_at' => $up->completed_at,
                'current_week' => $up->current_week,
                'current_day' => $up->current_day,
                'is_active' => $up->is_active,
                'total_weeks' => $up->plan?->duration_weeks,
                'progress_percent' => $up->plan
                    ? min(100, round(($up->current_week / $up->plan->duration_weeks) * 100))
                    : 0,
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'location_type' => 'required|in:home,gym,both',
            'duration_weeks' => 'required|integer|min:1|max:52',
            'sessions_per_week' => 'required|integer|min:1|max:7',
            'is_public' => 'boolean',
            'workouts' => 'required|array',
        ]);

        $plan = TrainingPlan::create([
            'name' => $request->name,
            'description' => $request->description,
            'difficulty' => $request->difficulty,
            'location_type' => $request->location_type,
            'duration_weeks' => $request->duration_weeks,
            'sessions_per_week' => $request->sessions_per_week,
            'is_public' => $request->is_public ?? false,
            'is_ai_generated' => $request->is_ai_generated ?? false,
            'created_by' => $request->user()->id,
            'tenant_id' => $request->user()->tenant_id,
        ]);

        foreach ($request->workouts as $workoutData) {
            $workout = PlanWorkout::create([
                'plan_id' => $plan->id,
                'week_number' => $workoutData['week'] ?? 1,
                'day_number' => $workoutData['day'] ?? 1,
                'name' => $workoutData['name'],
                'estimated_duration_minutes' => $workoutData['estimated_duration_minutes'] ?? 60,
                'notes' => $workoutData['notes'] ?? null,
            ]);

            foreach ($workoutData['exercises'] ?? [] as $index => $exerciseData) {
                $exercise = \App\Models\Exercise::where('name', 'LIKE', "%{$exerciseData['name']}%")
                    ->first();

                if ($exercise) {
                    \App\Models\WorkoutExercise::create([
                        'workout_id' => $workout->id,
                        'exercise_id' => $exercise->id,
                        'sets' => $exerciseData['sets'] ?? 3,
                        'reps' => $exerciseData['reps'] ?? 10,
                        'rest_seconds' => $exerciseData['rest_seconds'] ?? 60,
                        'notes' => $exerciseData['notes'] ?? null,
                        'order' => $index + 1,
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $plan->load('workouts.exercises'),
            'message' => '¡Plan de entrenamiento creado correctamente!',
        ], 201);
    }
}
