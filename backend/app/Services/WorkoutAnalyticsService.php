<?php

namespace App\Services;

use App\Models\WorkoutSession;
use App\Models\BodyMeasurement;
use App\Models\Goal;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WorkoutAnalyticsService
{
    public function getUserStats(int $userId, int $days = 30): array
    {
        $since = Carbon::now()->subDays($days);

        $sessions = WorkoutSession::where('user_id', $userId)
            ->where('started_at', '>=', $since)
            ->whereNotNull('completed_at')
            ->get();

        $totalSessions = $sessions->count();
        $totalMinutes = $sessions->sum('total_duration_minutes');
        $totalCalories = $sessions->sum('calories_burned');
        $avgHeartRate = $sessions->whereNotNull('heart_rate_avg')->avg('heart_rate_avg');

        // Workout frequency by day of week
        $frequencyByDay = $sessions->groupBy(fn($s) => Carbon::parse($s->started_at)->dayOfWeek)
            ->map->count();

        // Weekly breakdown
        $weeklyData = $sessions->groupBy(fn($s) => Carbon::parse($s->started_at)->weekOfYear)
            ->map(fn($week) => [
                'sessions' => $week->count(),
                'minutes' => $week->sum('total_duration_minutes'),
                'calories' => $week->sum('calories_burned'),
            ]);

        // Streak calculation
        $streak = $this->calculateStreak($userId);

        // Most trained muscle groups
        $muscleGroups = $this->getMostTrainedMuscleGroups($userId, $since);

        return [
            'period_days' => $days,
            'total_sessions' => $totalSessions,
            'total_minutes' => $totalMinutes,
            'total_hours' => round($totalMinutes / 60, 1),
            'total_calories' => $totalCalories,
            'avg_session_minutes' => $totalSessions > 0 ? round($totalMinutes / $totalSessions) : 0,
            'avg_calories_per_session' => $totalSessions > 0 ? round($totalCalories / $totalSessions) : 0,
            'avg_heart_rate' => $avgHeartRate ? round($avgHeartRate) : null,
            'current_streak_days' => $streak,
            'sessions_per_week' => round($totalSessions / ($days / 7), 1),
            'frequency_by_day' => $frequencyByDay,
            'weekly_breakdown' => $weeklyData,
            'most_trained_muscles' => $muscleGroups,
        ];
    }

    public function getBodyProgress(int $userId, int $days = 90): array
    {
        $measurements = BodyMeasurement::where('user_id', $userId)
            ->where('measured_at', '>=', Carbon::now()->subDays($days))
            ->orderBy('measured_at')
            ->get();

        if ($measurements->isEmpty()) {
            return ['message' => 'No hay mediciones registradas'];
        }

        $first = $measurements->first();
        $last = $measurements->last();

        return [
            'measurements' => $measurements->map(fn($m) => [
                'date' => $m->measured_at,
                'weight' => $m->weight_kg,
                'bmi' => $m->bmi,
                'body_fat' => $m->body_fat_percent,
                'muscle_mass' => $m->muscle_mass_kg,
            ]),
            'changes' => [
                'weight' => round(($last->weight_kg ?? 0) - ($first->weight_kg ?? 0), 2),
                'bmi' => round(($last->bmi ?? 0) - ($first->bmi ?? 0), 2),
                'body_fat' => round(($last->body_fat_percent ?? 0) - ($first->body_fat_percent ?? 0), 2),
                'muscle_mass' => round(($last->muscle_mass_kg ?? 0) - ($first->muscle_mass_kg ?? 0), 2),
            ],
            'total_measurements' => $measurements->count(),
        ];
    }

    public function getGoalProgress(int $userId): array
    {
        $goals = Goal::where('user_id', $userId)
            ->where('is_completed', false)
            ->get();

        return $goals->map(fn($goal) => [
            'id' => $goal->id,
            'title' => $goal->title,
            'type' => $goal->type,
            'target_value' => $goal->target_value,
            'current_value' => $goal->current_value,
            'unit' => $goal->unit,
            'deadline' => $goal->deadline,
            'progress_percent' => $goal->target_value > 0
                ? min(100, round(($goal->current_value / $goal->target_value) * 100, 1))
                : 0,
            'days_remaining' => $goal->deadline
                ? max(0, Carbon::now()->diffInDays($goal->deadline, false))
                : null,
        ])->toArray();
    }

    private function calculateStreak(int $userId): int
    {
        $sessions = WorkoutSession::where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->orderByDesc('started_at')
            ->get()
            ->groupBy(fn($s) => Carbon::parse($s->started_at)->format('Y-m-d'));

        $streak = 0;
        $currentDate = Carbon::today();

        foreach ($sessions as $date => $daySessions) {
            $sessionDate = Carbon::parse($date);
            if ($sessionDate->diffInDays($currentDate) > $streak + 1) {
                break;
            }
            $streak++;
            $currentDate = $sessionDate;
        }

        return $streak;
    }

    private function getMostTrainedMuscleGroups(int $userId, Carbon $since): array
    {
        return DB::table('session_exercises as se')
            ->join('workout_sessions as ws', 'se.session_id', '=', 'ws.id')
            ->join('exercises as e', 'se.exercise_id', '=', 'e.id')
            ->where('ws.user_id', $userId)
            ->where('ws.started_at', '>=', $since)
            ->whereNotNull('ws.completed_at')
            ->select('e.muscle_groups', DB::raw('COUNT(*) as count'))
            ->groupBy('e.muscle_groups')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->toArray();
    }
}
