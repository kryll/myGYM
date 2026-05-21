<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkoutSessionResource;
use App\Models\WorkoutSession;
use App\Models\SessionExercise;
use App\Events\WorkoutSessionUpdated;
use App\Services\WorkoutAnalyticsService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class WorkoutSessionController extends Controller
{
    public function __construct(
        private WorkoutAnalyticsService $analytics,
        private NotificationService $notifications
    ) {}

    public function index(Request $request): JsonResponse
    {
        $sessions = WorkoutSession::where('user_id', $request->user()->id)
            ->with(['exercises.exercise', 'planWorkout'])
            ->orderByDesc('started_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => WorkoutSessionResource::collection($sessions),
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'total' => $sessions->total(),
            ],
        ]);
    }

    public function start(Request $request): JsonResponse
    {
        $request->validate([
            'plan_workout_id' => 'nullable|exists:plan_workouts,id',
            'notes' => 'nullable|string',
        ]);

        // Check for active session
        $activeSession = WorkoutSession::where('user_id', $request->user()->id)
            ->whereNull('completed_at')
            ->first();

        if ($activeSession) {
            return response()->json([
                'success' => false,
                'message' => 'Ya tienes una sesión de entrenamiento activa',
                'data' => new WorkoutSessionResource($activeSession),
            ], 409);
        }

        $session = WorkoutSession::create([
            'user_id' => $request->user()->id,
            'plan_workout_id' => $request->plan_workout_id,
            'started_at' => now(),
            'status' => WorkoutSession::STATUS_IN_PROGRESS,
            'notes' => $request->notes,
        ]);

        event(new WorkoutSessionUpdated($session));

        return response()->json([
            'success' => true,
            'data' => new WorkoutSessionResource($session->load('planWorkout')),
            'message' => '¡Sesión de entrenamiento iniciada! ¡A por ello!',
        ], 201);
    }

    public function logExercise(Request $request, WorkoutSession $session): JsonResponse
    {
        if ($session->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        if ($session->completed_at) {
            return response()->json(['success' => false, 'message' => 'La sesión ya ha finalizado'], 400);
        }

        $request->validate([
            'exercise_id' => 'required|exists:exercises,id',
            'sets_completed' => 'nullable|array',
            'reps_completed' => 'nullable|array',
            'weight_used' => 'nullable|array',
            'duration_seconds' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $sessionExercise = SessionExercise::updateOrCreate(
            [
                'session_id' => $session->id,
                'exercise_id' => $request->exercise_id,
            ],
            [
                'sets_completed' => $request->sets_completed ?? [],
                'reps_completed' => $request->reps_completed ?? [],
                'weight_used' => $request->weight_used ?? [],
                'duration_seconds' => $request->duration_seconds,
                'notes' => $request->notes,
            ]
        );

        event(new WorkoutSessionUpdated($session));

        return response()->json([
            'success' => true,
            'data' => $sessionExercise->load('exercise'),
            'message' => 'Ejercicio registrado',
        ]);
    }

    public function complete(Request $request, WorkoutSession $session): JsonResponse
    {
        if ($session->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        if ($session->completed_at) {
            return response()->json(['success' => false, 'message' => 'La sesión ya ha finalizado'], 400);
        }

        $request->validate([
            'total_duration_minutes' => 'nullable|integer|min:1',
            'calories_burned' => 'nullable|integer|min:0',
            'heart_rate_avg' => 'nullable|integer|min:40|max:220',
            'notes' => 'nullable|string',
        ]);

        $durationMinutes = $request->total_duration_minutes
            ?? (int) Carbon::parse($session->started_at)->diffInMinutes(now());

        $session->update([
            'completed_at' => now(),
            'status' => WorkoutSession::STATUS_COMPLETED,
            'total_duration_minutes' => $durationMinutes,
            'calories_burned' => $request->calories_burned,
            'heart_rate_avg' => $request->heart_rate_avg,
            'notes' => $request->notes ?? $session->notes,
        ]);

        event(new WorkoutSessionUpdated($session));

        // Check for streak
        $streak = $this->analytics->getUserStats($session->user_id, 30)['current_streak_days'];
        if ($streak > 0 && $streak % 7 === 0) {
            $this->notifications->sendStreakAlert($request->user(), $streak);
        }

        return response()->json([
            'success' => true,
            'data' => new WorkoutSessionResource($session->load(['exercises.exercise', 'planWorkout'])),
            'message' => "¡Entrenamiento completado! {$durationMinutes} minutos de puro esfuerzo. ¡Bien hecho!",
        ]);
    }

    public function show(Request $request, WorkoutSession $session): JsonResponse
    {
        if ($session->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new WorkoutSessionResource($session->load(['exercises.exercise', 'planWorkout'])),
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $days = (int) $request->get('days', 30);
        $stats = $this->analytics->getUserStats($request->user()->id, $days);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    public function active(Request $request): JsonResponse
    {
        $session = WorkoutSession::where('user_id', $request->user()->id)
            ->whereNull('completed_at')
            ->with(['exercises.exercise', 'planWorkout'])
            ->first();

        return response()->json([
            'success' => true,
            'data' => $session ? new WorkoutSessionResource($session) : null,
        ]);
    }

    public function destroy(Request $request, WorkoutSession $session): JsonResponse
    {
        if ($session->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $session->exercises()->delete();
        $session->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión eliminada correctamente',
        ]);
    }
}
