<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\UserChallenge;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    public function __construct(private NotificationService $notifications)
    {}

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $userChallengeIds = UserChallenge::where('user_id', $userId)
            ->pluck('challenge_id', 'challenge_id')
            ->toArray();

        $userChallengeData = UserChallenge::where('user_id', $userId)
            ->get()
            ->keyBy('challenge_id');

        $challenges = Challenge::where('is_active', true)
            ->where(function ($q) use ($request) {
                $q->whereNull('start_date')
                  ->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', now());
            })
            ->where(function ($q) use ($request) {
                $q->whereNull('tenant_id')
                  ->orWhere('tenant_id', $request->user()->tenant_id);
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $challenges->map(fn($challenge) => [
                'id' => $challenge->id,
                'title' => $challenge->title,
                'description' => $challenge->description,
                'type' => $challenge->type,
                'difficulty' => $challenge->difficulty,
                'duration_days' => $challenge->duration_days,
                'target_value' => $challenge->target_value,
                'target_unit' => $challenge->target_unit,
                'reward_points' => $challenge->reward_points,
                'start_date' => $challenge->start_date,
                'end_date' => $challenge->end_date,
                'is_joined' => isset($userChallengeIds[$challenge->id]),
                'is_completed' => $userChallengeData[$challenge->id]?->is_completed ?? false,
                'current_value' => $userChallengeData[$challenge->id]?->current_value ?? 0,
                'progress_percent' => $challenge->target_value > 0
                    ? min(100, round((($userChallengeData[$challenge->id]?->current_value ?? 0) / $challenge->target_value) * 100))
                    : 0,
            ]),
        ]);
    }

    public function join(Request $request, Challenge $challenge): JsonResponse
    {
        $existing = UserChallenge::where('user_id', $request->user()->id)
            ->where('challenge_id', $challenge->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Ya estás participando en este reto',
            ], 409);
        }

        $userChallenge = UserChallenge::create([
            'user_id' => $request->user()->id,
            'challenge_id' => $challenge->id,
            'joined_at' => now(),
            'current_value' => 0,
            'is_completed' => false,
        ]);

        return response()->json([
            'success' => true,
            'data' => $userChallenge,
            'message' => "¡Te has unido al reto: {$challenge->title}! ¡A por ello!",
        ], 201);
    }

    public function updateProgress(Request $request, Challenge $challenge): JsonResponse
    {
        $userChallenge = UserChallenge::where('user_id', $request->user()->id)
            ->where('challenge_id', $challenge->id)
            ->firstOrFail();

        $request->validate([
            'value' => 'required|numeric|min:0',
        ]);

        $userChallenge->update([
            'current_value' => $request->value,
        ]);

        if ($request->value >= $challenge->target_value && !$userChallenge->is_completed) {
            $userChallenge->update([
                'is_completed' => true,
                'completed_at' => now(),
            ]);
            $this->notifications->sendChallengeCompleted($request->user(), $challenge->title);
        }

        return response()->json([
            'success' => true,
            'data' => $userChallenge->fresh(),
            'message' => '¡Progreso actualizado!',
        ]);
    }

    public function myChallenges(Request $request): JsonResponse
    {
        $userChallenges = UserChallenge::where('user_id', $request->user()->id)
            ->with('challenge')
            ->orderByDesc('joined_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $userChallenges->map(fn($uc) => [
                'id' => $uc->id,
                'challenge' => $uc->challenge,
                'joined_at' => $uc->joined_at,
                'completed_at' => $uc->completed_at,
                'current_value' => $uc->current_value,
                'is_completed' => $uc->is_completed,
                'progress_percent' => $uc->challenge && $uc->challenge->target_value > 0
                    ? min(100, round(($uc->current_value / $uc->challenge->target_value) * 100))
                    : 0,
            ]),
        ]);
    }
}
