<?php

namespace App\Console\Commands;

use App\Models\DeviceConnection;
use App\Services\AmazfitService;
use Illuminate\Console\Command;

class SyncDeviceData extends Command
{
    protected $signature = 'devices:sync {--device=all : Tipo de dispositivo (amazfit/all)}';
    protected $description = 'Sincronizar datos de dispositivos conectados (Amazfit, etc.)';

    public function __construct(private AmazfitService $amazfitService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $deviceType = $this->option('device');

        $query = DeviceConnection::where('is_active', true)
            ->where('last_sync_at', '<', now()->subMinutes(30));

        if ($deviceType !== 'all') {
            $query->where('device_type', $deviceType);
        }

        $connections = $query->with('user')->get();

        $this->info("🔄 Sincronizando {$connections->count()} dispositivos...");

        $bar = $this->output->createProgressBar($connections->count());
        $bar->start();

        foreach ($connections as $connection) {
            try {
                if ($connection->device_type === 'amazfit') {
                    $this->amazfitService->syncData($connection);
                }
                $connection->update(['last_sync_at' => now()]);
            } catch (\Exception $e) {
                $this->newLine();
                $this->warn("⚠️ Error sincronizando {$connection->device_name}: {$e->getMessage()}");
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("✅ Sincronización completada");

        return 0;
    }
}
