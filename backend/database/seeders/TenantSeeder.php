<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        // Create default/demo tenant
        $tenant = Tenant::updateOrCreate(
            ['slug' => 'demo'],
            [
                'name' => 'MyGYM Demo',
                'slug' => 'demo',
                'plan' => 'pro',
                'is_active' => true,
                'owner_name' => 'Admin MyGYM',
                'owner_email' => 'admin@mygym.app',
                'phone' => '+34 600 000 000',
                'address' => 'Calle Principal 1',
                'city' => 'Madrid',
                'country' => 'España',
                'timezone' => 'Europe/Madrid',
                'max_users' => 500,
                'subscribed_at' => now(),
                'subscription_expires_at' => now()->addYear(),
                'settings' => [
                    'features' => [
                        'ai_coaching' => true,
                        'device_sync' => true,
                        'challenges' => true,
                        'custom_plans' => true,
                    ],
                    'branding' => [
                        'app_name' => 'MyGYM',
                        'support_email' => 'soporte@mygym.app',
                    ],
                ],
            ]
        );

        $this->command->info("Tenant '{$tenant->name}' created with ID: {$tenant->id}");

        // Create super admin user
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@mygym.app'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Super Admin',
                'email' => 'superadmin@mygym.app',
                'password' => Hash::make('password'),
                'role' => User::ROLE_SUPER_ADMIN,
                'is_active' => true,
                'email_verified_at' => now(),
                'language' => 'es',
                'timezone' => 'Europe/Madrid',
            ]
        );

        $this->command->info("Super Admin user created: {$superAdmin->email}");

        // Create admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@mygym.app'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Administrador MyGYM',
                'email' => 'admin@mygym.app',
                'password' => Hash::make('password'),
                'role' => User::ROLE_ADMIN,
                'is_active' => true,
                'email_verified_at' => now(),
                'language' => 'es',
                'timezone' => 'Europe/Madrid',
            ]
        );

        $this->command->info("Admin user created: {$admin->email}");

        // Create demo trainer
        $trainer = User::updateOrCreate(
            ['email' => 'trainer@mygym.app'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Carlos García',
                'email' => 'trainer@mygym.app',
                'password' => Hash::make('password'),
                'role' => User::ROLE_TRAINER,
                'is_active' => true,
                'email_verified_at' => now(),
                'language' => 'es',
                'timezone' => 'Europe/Madrid',
            ]
        );

        $this->command->info("Trainer user created: {$trainer->email}");

        // Create demo regular user
        $user = User::updateOrCreate(
            ['email' => 'usuario@mygym.app'],
            [
                'tenant_id' => $tenant->id,
                'trainer_id' => $trainer->id,
                'name' => 'María López',
                'email' => 'usuario@mygym.app',
                'password' => Hash::make('password'),
                'role' => User::ROLE_USER,
                'is_active' => true,
                'email_verified_at' => now(),
                'language' => 'es',
                'timezone' => 'Europe/Madrid',
            ]
        );

        // Create profile for demo user
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'date_of_birth' => '1992-06-15',
                'height_cm' => 165.0,
                'weight_kg' => 68.0,
                'sex' => 'female',
                'fitness_level' => 'intermediate',
                'primary_goal' => 'lose_weight',
                'secondary_goals' => ['improve_endurance', 'gain_muscle'],
                'available_equipment' => ['bodyweight', 'resistance_bands', 'dumbbells'],
                'workout_days_per_week' => 4,
                'preferred_workout_duration' => 50,
                'activity_level' => 'moderately_active',
                'onboarding_completed' => true,
                'onboarding_completed_at' => now(),
            ]
        );

        $this->command->info("Regular user created: {$user->email}");

        // Create a second tenant for testing multi-tenancy
        $tenant2 = Tenant::updateOrCreate(
            ['slug' => 'fitclub-madrid'],
            [
                'name' => 'FitClub Madrid',
                'slug' => 'fitclub-madrid',
                'plan' => 'basic',
                'is_active' => true,
                'owner_name' => 'Pedro Martínez',
                'owner_email' => 'pedro@fitclub.es',
                'phone' => '+34 910 123 456',
                'city' => 'Madrid',
                'country' => 'España',
                'timezone' => 'Europe/Madrid',
                'max_users' => 50,
                'trial_ends_at' => now()->addDays(14),
                'settings' => [
                    'features' => [
                        'ai_coaching' => true,
                        'device_sync' => false,
                        'challenges' => true,
                        'custom_plans' => false,
                    ],
                ],
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@fitclub.es'],
            [
                'tenant_id' => $tenant2->id,
                'name' => 'Pedro Martínez',
                'email' => 'admin@fitclub.es',
                'password' => Hash::make('password'),
                'role' => User::ROLE_ADMIN,
                'is_active' => true,
                'email_verified_at' => now(),
                'language' => 'es',
            ]
        );

        $this->command->info("Second tenant '{$tenant2->name}' created.");
        $this->command->newLine();
        $this->command->info('=== Demo Credentials ===');
        $this->command->info('Super Admin: superadmin@mygym.app / password');
        $this->command->info('Admin:       admin@mygym.app / password');
        $this->command->info('Trainer:     trainer@mygym.app / password');
        $this->command->info('User:        usuario@mygym.app / password');
    }
}
