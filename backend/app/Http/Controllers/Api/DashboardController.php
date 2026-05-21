<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BodyMeasurement;
use App\Models\Challenge;
use App\Models\Goal;
use App\Models\Notification;
use App\Models\UserTrainingPlan;
use App\Models\WorkoutSession;
use App\Services\WorkoutAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function __construct(private WorkoutAnalyticsService $analytics)
    {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load(['profile', 'tenant']);
        $userId = $user->id;

        // Stats last 30 days
        $stats = $this->analytics->getUserStats($userId, 30);

        // Active training plan
        $activePlan = UserTrainingPlan::where('user_id', $userId)
            ->where('is_active', true)
            ->with('plan')
            ->first();

        // Next workout
        $nextWorkout = null;
        if ($activePlan) {
            $nextWorkout = $activePlan->plan?->workouts()
                ->where('week_number', $activePlan->current_week)
                ->where('day_number', $activePlan->current_day)
                ->with('exercises.exercise')
                ->first();
        }

        // Latest measurement
        $latestMeasurement = BodyMeasurement::where('user_id', $userId)
            ->latest('measured_at')
            ->first();

        // Active challenges count
        $activeChallenges = \App\Models\UserChallenge::where('user_id', $userId)
            ->where('is_completed', false)
            ->count();

        // Goals progress
        $goals = $this->analytics->getGoalProgress($userId);

        // Recent sessions (last 5)
        $recentSessions = WorkoutSession::where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->orderByDesc('started_at')
            ->take(5)
            ->get(['id', 'started_at', 'total_duration_minutes', 'calories_burned']);

        // Unread notifications count
        $unreadNotifications = Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();

        // Body progress this month
        $lastWeight = BodyMeasurement::where('user_id', $userId)
            ->where('measured_at', '>=', Carbon::now()->subDays(30))
            ->orderBy('measured_at')
            ->first();
        $currentWeight = $latestMeasurement;
        $weightChange = ($lastWeight && $currentWeight && $lastWeight->id !== $currentWeight->id)
            ? round($currentWeight->weight_kg - $lastWeight->weight_kg, 2)
            : null;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'name' => $user->name,
                    'fitness_level' => $user->profile?->fitness_level,
                    'avatar' => $user->avatar,
                ],
                'stats' => [
                    'sessions_this_month' => $stats['total_sessions'],
                    'hours_trained' => $stats['total_hours'],
                    'calories_burned' => $stats['total_calories'],
                    'current_streak' => $stats['current_streak_days'],
                    'sessions_per_week' => $stats['sessions_per_week'],
                ],
                'active_plan' => $activePlan ? [
                    'id' => $activePlan->plan_id,
                    'name' => $activePlan->plan?->name,
                    'current_week' => $activePlan->current_week,
                    'total_weeks' => $activePlan->plan?->duration_weeks,
                    'progress_percent' => $activePlan->plan
                        ? min(100, round(($activePlan->current_week / $activePlan->plan->duration_weeks) * 100))
                        : 0,
                ] : null,
                'next_workout' => $nextWorkout ? [
                    'id' => $nextWorkout->id,
                    'name' => $nextWorkout->name,
                    'exercise_count' => $nextWorkout->exercises->count(),
                    'estimated_duration' => $nextWorkout->estimated_duration_minutes,
                ] : null,
                'body_stats' => [
                    'current_weight' => $latestMeasurement?->weight_kg,
                    'current_bmi' => $latestMeasurement?->bmi,
                    'body_fat' => $latestMeasurement?->body_fat_percent,
                    'weight_change_30d' => $weightChange,
                    'last_measured' => $latestMeasurement?->measured_at,
                ],
                'active_challenges' => $activeChallenges,
                'goals' => array_slice($goals, 0, 3),
                'recent_sessions' => $recentSessions,
                'unread_notifications' => $unreadNotifications,
            ],
        ]);
    }
}
