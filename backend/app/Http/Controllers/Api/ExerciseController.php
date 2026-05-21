<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExerciseResource;
use App\Models\Exercise;
use App\Services\ClaudeService;
use App\Services\WeightRecommendationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExerciseController extends Controller
{
    public function __construct(
        private WeightRecommendationService $weightService,
        private ClaudeService $claude
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Exercise::with('equipment')
            ->where('is_active', true);

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%")
                ->orWhere('description', 'LIKE', "%{$request->search}%");
        }

        if ($request->difficulty) {
            $query->where('difficulty', $request->difficulty);
        }

        if ($request->location_type) {
            $query->where(function ($q) use ($request) {
                $q->where('location_type', $request->location_type)
                  ->orWhere('location_type', 'both');
            });
        }

        if ($request->muscle_group) {
            $query->whereJsonContains('muscle_groups', $request->muscle_group);
        }

        if ($request->equipment_id) {
            $query->where('equipment_id', $request->equipment_id);
        }

        $exercises = $query->orderBy('name')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => ExerciseResource::collection($exercises),
            'meta' => [
                'current_page' => $exercises->currentPage(),
                'last_page' => $exercises->lastPage(),
                'total' => $exercises->total(),
            ],
        ]);
    }

    public function show(Request $request, Exercise $exercise): JsonResponse
    {
        $exercise->load('equipment');

        $weightRecommendation = null;
        $user = $request->user();
        if ($user && $user->profile) {
            $reps = $request->get('reps', 10);
            $weightRecommendation = $this->weightService->recommend($user->profile, $exercise, (int) $reps);

            $progression = $this->weightService->getProgressionSuggestion($user->id, $exercise->id);
            if ($progression) {
                $weightRecommendation['progression'] = $progression;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'exercise' => new ExerciseResource($exercise),
                'weight_recommendation' => $weightRecommendation,
            ],
        ]);
    }

    public function getTip(Request $request, Exercise $exercise): JsonResponse
    {
        $user = $request->user()->load('profile');

        try {
            $tip = $this->claude->getExerciseTip($exercise->name, $user->profile);

            return response()->json([
                'success' => true,
                'data' => ['tip' => $tip],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo obtener el consejo. Intenta de nuevo.',
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'muscle_groups' => 'required|array',
            'equipment_id' => 'nullable|exists:equipment_types,id',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'location_type' => 'required|in:home,gym,both',
            'instructions' => 'nullable|array',
            'calories_per_minute' => 'nullable|numeric|min:0',
            'video_url' => 'nullable|url',
        ]);

        $exercise = Exercise::create($request->all() + ['is_active' => true]);

        return response()->json([
            'success' => true,
            'data' => new ExerciseResource($exercise),
            'message' => 'Ejercicio creado correctamente',
        ], 201);
    }

    public function update(Request $request, Exercise $exercise): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'muscle_groups' => 'sometimes|array',
            'difficulty' => 'sometimes|in:beginner,intermediate,advanced',
            'location_type' => 'sometimes|in:home,gym,both',
        ]);

        $exercise->update($request->all());

        return response()->json([
            'success' => true,
            'data' => new ExerciseResource($exercise->fresh()),
        ]);
    }

    public function destroy(Exercise $exercise): JsonResponse
    {
        $exercise->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Ejercicio desactivado correctamente',
        ]);
    }
}
