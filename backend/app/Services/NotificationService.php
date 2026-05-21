<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function send(int $userId, string $type, string $title, string $body, array $data = []): Notification
    {
        $notification = Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'sent_at' => now(),
        ]);

        // Broadcast in-app notification
        broadcast(new \App\Events\NotificationSent($notification));

        return $notification;
    }

    public function schedule(int $userId, string $type, string $title, string $body, \DateTimeInterface $scheduledAt, array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'scheduled_at' => $scheduledAt,
        ]);
    }

    public function sendWorkoutReminder(User $user): void
    {
        $profile = $user->profile;
        $messages = [
            '💪 ¡Es hora de entrenar! Tu cuerpo lo agradecerá.',
            '🏋️ ¡No olvides tu entrenamiento de hoy! La constancia es la clave.',
            '🔥 ¡Vamos! Cada sesión te acerca más a tus objetivos.',
            '⚡ ¡Tu entrenador virtual te está esperando! ¿Listo para el reto?',
            '🎯 Recuerda: el único mal entrenamiento es el que no hiciste.',
        ];

        $this->send(
            $user->id,
            'workout_reminder',
            '¡Hora de entrenar!',
            $messages[array_rand($messages)],
            ['action' => 'open_workout']
        );
    }

    public function sendGoalAchieved(User $user, string $goalTitle): void
    {
        $this->send(
            $user->id,
            'goal_achieved',
            '🏆 ¡Objetivo conseguido!',
            "¡Increíble! Has alcanzado tu objetivo: {$goalTitle}. ¡Sigue así!",
            ['action' => 'view_goals']
        );
    }

    public function sendStreakAlert(User $user, int $streak): void
    {
        $this->send(
            $user->id,
            'streak_alert',
            "🔥 ¡{$streak} días de racha!",
            "¡Estás en racha! {$streak} días entrenando sin parar. ¡No lo pierdas!",
            ['streak_days' => $streak]
        );
    }

    public function sendWeeklyReport(User $user, array $stats): void
    {
        $this->send(
            $user->id,
            'weekly_report',
            '📊 Tu resumen semanal',
            "Esta semana: {$stats['sessions']} entrenamientos, {$stats['calories']} kcal quemadas, {$stats['minutes']} minutos activo",
            ['stats' => $stats]
        );
    }

    public function sendChallengeCompleted(User $user, string $challengeTitle): void
    {
        $this->send(
            $user->id,
            'challenge_completed',
            '🎉 ¡Reto completado!',
            "¡Felicidades! Has completado el reto: {$challengeTitle}",
            ['action' => 'view_challenges']
        );
    }
}
