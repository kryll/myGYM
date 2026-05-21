<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function __construct(private NotificationService $notifications)
    {}

    public function index(Request $request): JsonResponse
    {
        $goals = Goal::where('user_id', $request->user()->id)
            ->orderBy('is_completed')
            ->orderBy('deadline')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $goals->map(fn($goal) => [
                'id' => $goal->id,
                'title' => $goal->title,
                'description' => $goal->description,
                'type' => $goal->type,
                'target_value' => $goal->target_value,
                'current_value' => $goal->current_value,
                'unit' => $goal->unit,
                'deadline' => $goal->deadline,
                'is_completed' => $goal->is_completed,
                'completed_at' => $goal->completed_at,
                'progress_percent' => $goal->target_value > 0
                    ? min(100, round(($goal->current_value / $goal->target_value) * 100, 1))
                    : 0,
                'days_remaining' => $goal->deadline
                    ? max(0, \Carbon\Carbon::now()->diffInDays($goal->deadline, false))
                    : null,
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:weight_loss,muscle_gain,endurance,strength,flexibility,habit,other',
            'target_value' => 'required|numeric|min:0',
            'current_value' => 'nullable|numeric|min:0',
            'unit' => 'required|string|max:50',
            'deadline' => 'nullable|date|after:today',
        ]);

        $goal = Goal::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'target_value' => $request->target_value,
            'current_value' => $request->current_value ?? 0,
            'unit' => $request->unit,
            'deadline' => $request->deadline,
            'is_completed' => false,
        ]);

        return response()->json([
            'success' => true,
            'data' => $goal,
            'message' => '¡Objetivo creado! Cada gran logro empieza con un primer paso.',
        ], 201);
    }

    public function update(Request $request, Goal $goal): JsonResponse
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $request->validate([
            'current_value' => 'sometimes|numeric|min:0',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
        ]);

        $goal->update($request->only(['title', 'description', 'current_value', 'deadline']));

        if ($request->current_value >= $goal->target_value && !$goal->is_completed) {
            $goal->update([
                'is_completed' => true,
                'completed_at' => now(),
            ]);
            $this->notifications->sendGoalAchieved($request->user(), $goal->title);
        }

        return response()->json([
            'success' => true,
            'data' => $goal->fresh(),
            'message' => 'Objetivo actualizado',
        ]);
    }

    public function destroy(Request $request, Goal $goal): JsonResponse
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $goal->delete();

        return response()->json(['success' => true, 'message' => 'Objetivo eliminado']);
    }
}
