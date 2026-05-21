<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Sincronización de dispositivos cada 30 minutos
        $schedule->command('devices:sync')->everyThirtyMinutes();

        // Limpiar tokens expirados diariamente
        $schedule->command('sanctum:prune-expired --hours=24')->daily();

        // Enviar notificaciones programadas cada minuto
        $schedule->command('notifications:send-scheduled')->everyMinute();

        // Verificar retos completados cada hora
        $schedule->command('challenges:check-completion')->hourly();

        // Enviar recordatorio de entrenamiento a las 8am
        $schedule->command('notifications:workout-reminder')->dailyAt('08:00');

        // Limpiar logs antiguos semanalmente
        $schedule->command('log:clear')->weekly();

        // Generar estadísticas semanales cada domingo a las 20:00
        $schedule->command('stats:generate-weekly')->weeklyOn(0, '20:00');
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
