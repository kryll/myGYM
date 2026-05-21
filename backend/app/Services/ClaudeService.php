<?php

namespace App\Services;

use App\Models\AIConversation;
use App\Models\AIMessage;
use App\Models\UserProfile;
use App\Models\WorkoutSession;
use App\Models\BodyMeasurement;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class ClaudeService
{
    private string $apiKey;
    private string $model;
    private string $apiUrl;
    private string $apiVersion = '2023-06-01';

    public function __construct()
    {
        $this->apiKey = config('claude.api_key');
        $this->model = config('claude.model', 'claude-sonnet-4-6');
        $this->apiUrl = 'https://api.anthropic.com/v1/messages';
    }

    public function chat(AIConversation $conversation, string $userMessage): string
    {
        $this->checkRateLimit($conversation->user_id);

        // Store user message
        AIMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $userMessage,
        ]);

        // Build messages history
        $messages = $conversation->messages()
            ->orderBy('created_at')
            ->get()
            ->map(fn($m) => [
                'role' => $m->role,
                'content' => $m->content,
            ])
            ->toArray();

        $systemPrompt = $this->buildSystemPrompt($conversation);

        $response = $this->sendRequest($messages, $systemPrompt, config('claude.token_limits.chat', 2048));

        // Store assistant response
        AIMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $response['content'],
            'tokens_used' => $response['usage']['output_tokens'] ?? 0,
            'model' => $this->model,
        ]);

        return $response['content'];
    }

    public function chatStreaming(AIConversation $conversation, string $userMessage, callable $onChunk): string
    {
        $this->checkRateLimit($conversation->user_id);

        AIMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $userMessage,
        ]);

        $messages = $conversation->messages()
            ->orderBy('created_at')
            ->get()
            ->map(fn($m) => ['role' => $m->role, 'content' => $m->content])
            ->toArray();

        $systemPrompt = $this->buildSystemPrompt($conversation);
        $fullResponse = '';

        $this->streamRequest($messages, $systemPrompt, config('claude.token_limits.chat', 2048), function ($chunk) use (&$fullResponse, $onChunk) {
            $fullResponse .= $chunk;
            $onChunk($chunk);
        });

        AIMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $fullResponse,
            'model' => $this->model,
        ]);

        return $fullResponse;
    }

    public function generateTrainingPlan(UserProfile $profile, array $preferences = []): array
    {
        $userContext = $this->buildUserContext($profile);

        $prompt = config('claude.system_prompts.plan_generator');

        $userMessage = "Genera un plan de entrenamiento personalizado para el siguiente usuario:\n\n" .
            $userContext . "\n\n" .
            "Preferencias adicionales:\n" .
            "- Tipo de entrenamiento: " . ($preferences['location'] ?? 'mixto (casa y gym)') . "\n" .
            "- Días por semana: " . ($preferences['days_per_week'] ?? '4') . "\n" .
            "- Duración por sesión: " . ($preferences['session_duration'] ?? '60') . " minutos\n" .
            "- Objetivo principal: " . ($preferences['goal'] ?? $profile->primary_goal ?? 'fitness general') . "\n" .
            "- Equipamiento disponible: " . implode(', ', $profile->available_equipment ?? ['peso corporal']) . "\n\n" .
            "Responde ÚNICAMENTE con un JSON válido con esta estructura:\n" .
            '{"name":"Nombre del plan","description":"Descripción","difficulty":"beginner|intermediate|advanced","duration_weeks":8,"sessions_per_week":4,"workouts":[{"week":1,"day":1,"name":"Nombre sesión","exercises":[{"name":"Ejercicio","sets":3,"reps":10,"rest_seconds":60,"notes":"Indicaciones técnicas"}]}]}';

        $messages = [['role' => 'user', 'content' => $userMessage]];

        $response = $this->sendRequest($messages, $prompt, config('claude.token_limits.plan_generation', 4096));

        try {
            return json_decode($response['content'], true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            Log::error('Failed to parse AI training plan JSON', ['response' => $response['content']]);
            throw new \RuntimeException('Error generando el plan de entrenamiento. Por favor, intenta de nuevo.');
        }
    }

    public function analyzeBodyProgress(UserProfile $profile, array $measurements): string
    {
        $userContext = $this->buildUserContext($profile);
        $measurementContext = $this->buildMeasurementContext($measurements);

        $prompt = config('claude.system_prompts.body_analyzer');

        $userMessage = "Analiza el progreso corporal del siguiente usuario:\n\n" .
            $userContext . "\n\n" .
            "Historial de mediciones:\n" . $measurementContext;

        $messages = [['role' => 'user', 'content' => $userMessage]];

        $response = $this->sendRequest($messages, $prompt, config('claude.token_limits.body_analysis', 1024));

        return $response['content'];
    }

    public function getExerciseTip(string $exerciseName, ?UserProfile $profile = null): string
    {
        $prompt = config('claude.system_prompts.coach');

        $context = $profile ? "\nPerfil del usuario: " . $this->buildUserContext($profile) : '';

        $userMessage = "Dame consejos técnicos detallados para el ejercicio: {$exerciseName}.{$context}\n\n" .
            "Incluye: técnica correcta, músculos trabajados, errores comunes, variantes y progresiones.";

        $messages = [['role' => 'user', 'content' => $userMessage]];

        $response = $this->sendRequest($messages, $prompt, 1024);

        return $response['content'];
    }

    public function summarizeWorkout(array $sessionData): string
    {
        $prompt = config('claude.system_prompts.coach');

        $userMessage = "Resume y analiza esta sesión de entrenamiento:\n\n" .
            json_encode($sessionData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n" .
            "Proporciona: resumen del rendimiento, puntos fuertes, áreas de mejora y recomendaciones para la próxima sesión.";

        $messages = [['role' => 'user', 'content' => $userMessage]];

        $response = $this->sendRequest($messages, $prompt, config('claude.token_limits.workout_summary', 512));

        return $response['content'];
    }

    private function sendRequest(array $messages, string $systemPrompt, int $maxTokens): array
    {
        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => $this->apiVersion,
            'content-type' => 'application/json',
        ])
        ->timeout(config('claude.timeout', 120))
        ->post($this->apiUrl, [
            'model' => $this->model,
            'max_tokens' => $maxTokens,
            'system' => $systemPrompt,
            'messages' => $messages,
        ]);

        if (!$response->successful()) {
            Log::error('Claude API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \RuntimeException('Error conectando con el asistente IA. Por favor, intenta de nuevo.');
        }

        $data = $response->json();

        return [
            'content' => $data['content'][0]['text'] ?? '',
            'usage' => $data['usage'] ?? [],
        ];
    }

    private function streamRequest(array $messages, string $systemPrompt, int $maxTokens, callable $onChunk): void
    {
        $client = new \GuzzleHttp\Client();

        $response = $client->post($this->apiUrl, [
            'headers' => [
                'x-api-key' => $this->apiKey,
                'anthropic-version' => $this->apiVersion,
                'content-type' => 'application/json',
                'accept' => 'text/event-stream',
            ],
            'json' => [
                'model' => $this->model,
                'max_tokens' => $maxTokens,
                'stream' => true,
                'system' => $systemPrompt,
                'messages' => $messages,
            ],
            'stream' => true,
            'timeout' => config('claude.timeout', 120),
        ]);

        $body = $response->getBody();

        while (!$body->eof()) {
            $line = $this->readLine($body);

            if (str_starts_with($line, 'data: ')) {
                $data = substr($line, 6);
                if ($data === '[DONE]') break;

                $event = json_decode($data, true);
                if ($event && isset($event['type'])) {
                    if ($event['type'] === 'content_block_delta' &&
                        isset($event['delta']['type']) &&
                        $event['delta']['type'] === 'text_delta') {
                        $onChunk($event['delta']['text']);
                    }
                }
            }
        }
    }

    private function readLine($body): string
    {
        $line = '';
        while (!$body->eof()) {
            $char = $body->read(1);
            if ($char === "\n") break;
            $line .= $char;
        }
        return rtrim($line, "\r");
    }

    private function buildSystemPrompt(AIConversation $conversation): string
    {
        $basePrompt = config('claude.system_prompts.coach');

        $context = $conversation->context ?? [];
        if (!empty($context)) {
            $basePrompt .= "\n\nContexto del usuario:\n" . json_encode($context, JSON_UNESCAPED_UNICODE);
        }

        return $basePrompt;
    }

    private function buildUserContext(UserProfile $profile): string
    {
        $age = $profile->date_of_birth
            ? \Carbon\Carbon::parse($profile->date_of_birth)->age . ' años'
            : 'No especificada';

        $bmi = ($profile->height_cm && $profile->weight_kg)
            ? round($profile->weight_kg / (($profile->height_cm / 100) ** 2), 1)
            : null;

        return implode("\n", array_filter([
            "- Edad: {$age}",
            $profile->sex ? "- Sexo: " . ($profile->sex === 'male' ? 'Masculino' : 'Femenino') : null,
            $profile->height_cm ? "- Altura: {$profile->height_cm} cm" : null,
            $profile->weight_kg ? "- Peso: {$profile->weight_kg} kg" : null,
            $bmi ? "- IMC: {$bmi}" : null,
            $profile->fitness_level ? "- Nivel de fitness: {$profile->fitness_level}" : null,
            $profile->primary_goal ? "- Objetivo principal: {$profile->primary_goal}" : null,
            $profile->medical_notes ? "- Notas médicas: {$profile->medical_notes}" : null,
            !empty($profile->available_equipment)
                ? "- Equipamiento disponible: " . implode(', ', $profile->available_equipment)
                : null,
        ]));
    }

    private function buildMeasurementContext(array $measurements): string
    {
        return collect($measurements)->map(fn($m) => implode(' | ', array_filter([
            "Fecha: {$m['measured_at']}",
            isset($m['weight_kg']) ? "Peso: {$m['weight_kg']} kg" : null,
            isset($m['body_fat_percent']) ? "Grasa corporal: {$m['body_fat_percent']}%" : null,
            isset($m['muscle_mass_kg']) ? "Masa muscular: {$m['muscle_mass_kg']} kg" : null,
            isset($m['bmi']) ? "IMC: {$m['bmi']}" : null,
        ])))->implode("\n");
    }

    private function checkRateLimit(int $userId): void
    {
        $key = "claude_rate_limit_{$userId}";
        $limit = config('claude.rate_limit.per_minute', 10);

        if (RateLimiter::tooManyAttempts($key, $limit)) {
            $seconds = RateLimiter::availableIn($key);
            throw new \RuntimeException("Demasiadas solicitudes. Por favor, espera {$seconds} segundos.");
        }

        RateLimiter::hit($key, 60);
    }
}
