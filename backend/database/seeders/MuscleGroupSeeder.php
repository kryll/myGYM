<?php

namespace Database\Seeders;

use App\Models\MuscleGroup;
use Illuminate\Database\Seeder;

class MuscleGroupSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            ['name' => 'Chest', 'name_es' => 'Pecho', 'body_part' => 'upper', 'sort_order' => 1],
            ['name' => 'Back', 'name_es' => 'Espalda', 'body_part' => 'upper', 'sort_order' => 2],
            ['name' => 'Shoulders', 'name_es' => 'Hombros', 'body_part' => 'upper', 'sort_order' => 3],
            ['name' => 'Biceps', 'name_es' => 'Bíceps', 'body_part' => 'upper', 'sort_order' => 4],
            ['name' => 'Triceps', 'name_es' => 'Tríceps', 'body_part' => 'upper', 'sort_order' => 5],
            ['name' => 'Forearms', 'name_es' => 'Antebrazos', 'body_part' => 'upper', 'sort_order' => 6],
            ['name' => 'Abs', 'name_es' => 'Abdominales', 'body_part' => 'core', 'sort_order' => 7],
            ['name' => 'Obliques', 'name_es' => 'Oblicuos', 'body_part' => 'core', 'sort_order' => 8],
            ['name' => 'Lower Back', 'name_es' => 'Lumbar', 'body_part' => 'core', 'sort_order' => 9],
            ['name' => 'Quadriceps', 'name_es' => 'Cuádriceps', 'body_part' => 'lower', 'sort_order' => 10],
            ['name' => 'Hamstrings', 'name_es' => 'Isquiotibiales', 'body_part' => 'lower', 'sort_order' => 11],
            ['name' => 'Glutes', 'name_es' => 'Glúteos', 'body_part' => 'lower', 'sort_order' => 12],
            ['name' => 'Calves', 'name_es' => 'Gemelos', 'body_part' => 'lower', 'sort_order' => 13],
            ['name' => 'Hip Flexors', 'name_es' => 'Flexores de cadera', 'body_part' => 'lower', 'sort_order' => 14],
            ['name' => 'Full Body', 'name_es' => 'Cuerpo completo', 'body_part' => 'full', 'sort_order' => 15],
            ['name' => 'Cardio', 'name_es' => 'Cardio', 'body_part' => 'full', 'sort_order' => 16],
            ['name' => 'Trapezius', 'name_es' => 'Trapecio', 'body_part' => 'upper', 'sort_order' => 17],
            ['name' => 'Lats', 'name_es' => 'Dorsales', 'body_part' => 'upper', 'sort_order' => 18],
        ];

        foreach ($groups as $group) {
            MuscleGroup::updateOrCreate(
                ['name' => $group['name']],
                $group
            );
        }

        $this->command->info('Muscle groups seeded successfully.');
    }
}
