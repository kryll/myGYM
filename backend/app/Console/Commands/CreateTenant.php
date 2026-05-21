<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateTenant extends Command
{
    protected $signature = 'tenant:create {name} {slug?} {--admin-email=} {--admin-password=}';
    protected $description = 'Crear un nuevo tenant (gimnasio/organización)';

    public function handle(): int
    {
        $name = $this->argument('name');
        $slug = $this->argument('slug') ?? Str::slug($name);

        if (Tenant::where('slug', $slug)->exists()) {
            $this->error("Ya existe un tenant con el slug: {$slug}");
            return 1;
        }

        $tenant = Tenant::create([
            'name' => $name,
            'slug' => $slug,
            'plan' => 'basic',
            'is_active' => true,
            'settings' => [
                'max_users' => 50,
                'features' => ['ai_coach', 'bluetooth', 'challenges'],
            ],
        ]);

        $this->info("✅ Tenant creado: {$name} (slug: {$slug})");

        $adminEmail = $this->option('admin-email') ?? $this->ask('Email del administrador');
        $adminPassword = $this->option('admin-password') ?? $this->secret('Contraseña del administrador');

        $admin = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Administrador',
            'email' => $adminEmail,
            'password' => Hash::make($adminPassword),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->info("✅ Administrador creado: {$adminEmail}");
        $this->info("🏋️ Tenant ID: {$tenant->id}");
        $this->info("🔑 Accede en: https://tudominio.com con las credenciales proporcionadas");

        return 0;
    }
}
