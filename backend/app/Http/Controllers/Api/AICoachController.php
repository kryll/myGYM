<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AIConversation;
use App\Models\UserProfile;
use App\Models\WorkoutSession;
use App\Services\ClaudeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AICoachController extends Controller
{
    public function __construct(private ClaudeService $claude)
    {}

    public function conversations(Request $request): JsonResponse
    {
        $conversations = AIConversation::where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $conversations,
        ]);
    }

    public function createConversation(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'context' => 'nullable|array',
        ]);

        $user = $request->user()->load('profile');
        $context = $request->context ?? [];

        if ($user->profile) {
            $context['user_profile'] = [
                'fitness_level' => $user->profile->fitness_level,
                'primary_goal' => $user->profile->primary_goal,
                'age' => $user->profile->date_of_birth
                    ? \Carbon\Carbon::parse($user->profile->date_of_birth)->age
                    : null,
                'sex' => $user->profile->sex,
                'height_cm' => $user->profile->height_cm,
                'weight_kg' => $user->profile->weight_kg,
                'available_equipment' => $user->profile->available_equipment,
            ];
        }

        $conversation = AIConversation::create([
            'user_id' => $user->id,
            'title' => $request->title ?? 'Consulta con el entrenador',
            'context' => $context,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $conversation->load('messages'),
        ], 201);
    }

    public function chat(Request $request, AIConversation $conversation): JsonResponse
    {
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $request->validate(['message' => 'required|string|max:2000']);

        try {
            $response = $this->claude->chat($conversation, $request->message);

            return response()->json([
                'success' => true,
                'data' => [
                    'message' => $response,
                    'conversation_id' => $conversation->id,
                ],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 429);
        }
    }

    public function chatStream(Request $request, AIConversation $conversation): Response
    {
        if ($conversation->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate(['message' => 'required|string|max:2000']);

        return response()->stream(function () use ($request, $conversation) {
            try {
                $this->claude->chatStreaming($conversation, $request->message, function ($chunk) {
                    echo "data: " . json_encode(['text' => $chunk]) . "\n\n";
                    ob_flush();
                    flush();
                });
                echo "data: [DONE]\n\n";
                ob_flush();
                flush();
            } catch (\Exception $e) {
                echo "data: " . json_encode(['error' => $e->getMessage()]) . "\n\n";
                ob_flush();
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    public function generatePlan(Request $request): JsonResponse
    {
        $request->validate([
            'location' => 'required|in:home,gym,both',
            'days_per_week' => 'required|integer|min:1|max:7',
            'session_duration' => 'required|integer|min:15|max:180',
            'goal' => 'required|string|max:255',
            'fitness_level' => 'required|in:beginner,intermediate,advanced',
        ]);

        $user = $request->user()->load('profile');
        $profile = $user->profile;

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Completa tu perfil antes de generar un plan',
            ], 400);
        }

        try {
            $plan = $this->claude->generateTrainingPlan($profile, $request->all());

            return response()->json([
                'success' => true,
                'data' => $plan,
                'message' => '¡Plan de entrenamiento generado! Puedes guardarlo en tus planes.',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function analyzeProgress(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile');

        if (!$user->profile) {
            return response()->json(['success' => false, 'message' => 'Perfil incompleto'], 400);
        }

        $measurements = \App\Models\BodyMeasurement::where('user_id', $user->id)
            ->orderByDesc('measured_at')
            ->take(10)
            ->get()
            ->toArray();

        try {
            $analysis = $this->claude->analyzeBodyProgress($user->profile, $measurements);

            return response()->json([
                'success' => true,
                'data' => ['analysis' => $analysis],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getExerciseTip(Request $request): JsonResponse
    {
        $request->validate(['exercise_name' => 'required|string|max:255']);

        $user = $request->user()->load('profile');

        try {
            $tip = $this->claude->getExerciseTip($request->exercise_name, $user->profile);

            return response()->json([
                'success' => true,
                'data' => ['tip' => $tip],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function summarizeSession(Request $request, WorkoutSession $session): JsonResponse
    {
        if ($session->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $session->load('exercises.exercise');

        $sessionData = [
            'date' => $session->started_at,
            'duration_minutes' => $session->total_duration_minutes,
            'calories_burned' => $session->calories_burned,
            'heart_rate_avg' => $session->heart_rate_avg,
            'exercises' => $session->exercises->map(fn($e) => [
                'name' => $e->exercise->name ?? 'Ejercicio',
                'sets' => count($e->sets_completed ?? []),
                'reps' => $e->reps_completed ?? [],
                'weight' => $e->weight_used ?? [],
            ]),
        ];

        try {
            $summary = $this->claude->summarizeWorkout($sessionData);

            return response()->json([
                'success' => true,
                'data' => ['summary' => $summary],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
