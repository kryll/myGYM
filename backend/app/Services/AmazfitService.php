<?php

namespace App\Services;

use App\Models\DeviceConnection;
use App\Models\WorkoutSession;
use App\Models\BodyMeasurement;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AmazfitService
{
    private const ZEPP_API_BASE = 'https://api-mifit-de2.huami.com';
    private const APP_NAME = 'com.huami.midong';
    private const APP_VERSION = '4.14.0';

    /**
     * Sync data from Amazfit device via Zepp Health API.
     * Note: The official Zepp API is not publicly documented.
     * This uses the reverse-engineered API used by the community.
     */
    public function syncData(DeviceConnection $connection): bool
    {
        try {
            $data = $this->fetchActivityData($connection);

            if (!$data) {
                return false;
            }

            $this->processActivityData($connection->user_id, $data);
            $this->processSleepData($connection, $data);
            $this->processWorkoutData($connection, $data);

            return true;
        } catch (\Exception $e) {
            Log::error('Amazfit sync failed', [
                'user_id' => $connection->user_id,
                'device' => $connection->device_name,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function authenticate(string $email, string $password): ?array
    {
        try {
            $response = Http::timeout(30)
                ->post(self::ZEPP_API_BASE . '/v1/user/login', [
                    'email' => $email,
                    'password' => md5($password),
                    'app_name' => self::APP_NAME,
                    'app_version' => self::APP_VERSION,
                    'lang' => 'es_ES',
                ]);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            Log::warning('Amazfit auth failed: ' . $e->getMessage());
        }

        return null;
    }

    public function processManualSync(int $userId, array $data): void
    {
        // Handle manual data entry from the app (when direct API isn't available)
        if (isset($data['workout'])) {
            $this->createWorkoutSession($userId, $data['workout']);
        }

        if (isset($data['heart_rate'])) {
            $this->processHeartRateData($userId, $data['heart_rate']);
        }

        if (isset($data['steps'])) {
            $this->processStepsData($userId, $data['steps']);
        }
    }

    private function fetchActivityData(DeviceConnection $connection): ?array
    {
        $token = $connection->access_token;
        if (!$token) {
            return null;
        }

        try {
            $response = Http::withToken($token)
                ->timeout(30)
                ->get(self::ZEPP_API_BASE . '/v2/summary/band', [
                    'from_date' => $connection->last_sync_at?->format('Y-m-d') ?? now()->subDays(7)->format('Y-m-d'),
                    'to_date' => now()->format('Y-m-d'),
                ]);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            Log::warning('Amazfit data fetch failed: ' . $e->getMessage());
        }

        return null;
    }

    private function processActivityData(int $userId, array $data): void
    {
        // Process steps, calories, heart rate from activity data
        // Store as daily summary in the database
    }

    private function processSleepData(DeviceConnection $connection, array $data): void
    {
        // Process sleep quality data from Amazfit
    }

    private function processWorkoutData(DeviceConnection $connection, array $data): void
    {
        if (!isset($data['workouts'])) {
            return;
        }

        foreach ($data['workouts'] as $workout) {
            $this->createWorkoutSession($connection->user_id, $workout);
        }
    }

    private function createWorkoutSession(int $userId, array $workoutData): void
    {
        $startTime = $workoutData['start_time'] ?? now()->subHour()->toISOString();
        $endTime = $workoutData['end_time'] ?? now()->toISOString();
        $duration = $workoutData['duration_seconds'] ?? 3600;

        WorkoutSession::firstOrCreate(
            [
                'user_id' => $userId,
                'started_at' => $startTime,
                'device_source' => 'amazfit',
            ],
            [
                'completed_at' => $endTime,
                'total_duration_minutes' => (int) ($duration / 60),
                'calories_burned' => $workoutData['calories'] ?? null,
                'heart_rate_avg' => $workoutData['heart_rate_avg'] ?? null,
                'notes' => 'Importado desde Amazfit ' . ($workoutData['sport_type'] ?? ''),
            ]
        );
    }

    private function processHeartRateData(int $userId, array $heartRateData): void
    {
        // Store heart rate data for health tracking
    }

    private function processStepsData(int $userId, array $stepsData): void
    {
        // Store steps/activity data
    }
}
