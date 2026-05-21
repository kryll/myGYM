<?php

namespace Database\Seeders;

use App\Models\EquipmentType;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    public function run(): void
    {
        $equipment = [
            [
                'name' => 'Bodyweight',
                'name_es' => 'Peso corporal',
                'location' => 'both',
                'description' => 'No equipment required, uses body weight as resistance',
                'sort_order' => 1,
            ],
            [
                'name' => 'Dumbbells',
                'name_es' => 'Mancuernas',
                'location' => 'both',
                'description' => 'Free weights available in various sizes',
                'sort_order' => 2,
            ],
            [
                'name' => 'Barbell',
                'name_es' => 'Barra olímpica',
                'location' => 'gym',
                'description' => 'Olympic barbell for heavy compound lifts',
                'sort_order' => 3,
            ],
            [
                'name' => 'Resistance Bands',
                'name_es' => 'Bandas elásticas',
                'location' => 'both',
                'description' => 'Elastic resistance bands for strength and mobility training',
                'sort_order' => 4,
            ],
            [
                'name' => 'Pull-up Bar',
                'name_es' => 'Barra de dominadas',
                'location' => 'both',
                'description' => 'Bar for pull-ups and hanging exercises',
                'sort_order' => 5,
            ],
            [
                'name' => 'Bench',
                'name_es' => 'Banco de pesas',
                'location' => 'gym',
                'description' => 'Adjustable weight bench for pressing exercises',
                'sort_order' => 6,
            ],
            [
                'name' => 'Cable Machine',
                'name_es' => 'Polea / Cables',
                'location' => 'gym',
                'description' => 'Cable pulley system for full range of motion exercises',
                'sort_order' => 7,
            ],
            [
                'name' => 'Leg Press Machine',
                'name_es' => 'Máquina de prensa',
                'location' => 'gym',
                'description' => 'Machine for leg press exercises',
                'sort_order' => 8,
            ],
            [
                'name' => 'Smith Machine',
                'name_es' => 'Máquina Smith',
                'location' => 'gym',
                'description' => 'Guided barbell machine for safe heavy lifting',
                'sort_order' => 9,
            ],
            [
                'name' => 'Kettlebell',
                'name_es' => 'Pesa rusa',
                'location' => 'both',
                'description' => 'Cast iron weight for dynamic movements',
                'sort_order' => 10,
            ],
            [
                'name' => 'TRX / Suspension Trainer',
                'name_es' => 'TRX / Suspensión',
                'location' => 'both',
                'description' => 'Suspension training system using bodyweight',
                'sort_order' => 11,
            ],
            [
                'name' => 'Treadmill',
                'name_es' => 'Cinta de correr',
                'location' => 'gym',
                'description' => 'Motorized running machine for cardio training',
                'sort_order' => 12,
            ],
            [
                'name' => 'Stationary Bike',
                'name_es' => 'Bicicleta estática',
                'location' => 'gym',
                'description' => 'Indoor cycling machine for cardio training',
                'sort_order' => 13,
            ],
            [
                'name' => 'Rowing Machine',
                'name_es' => 'Máquina de remo',
                'location' => 'gym',
                'description' => 'Cardio machine that simulates rowing',
                'sort_order' => 14,
            ],
            [
                'name' => 'Battle Ropes',
                'name_es' => 'Cuerdas de batalla',
                'location' => 'gym',
                'description' => 'Heavy ropes for high-intensity interval training',
                'sort_order' => 15,
            ],
            [
                'name' => 'Medicine Ball',
                'name_es' => 'Balón medicinal',
                'location' => 'both',
                'description' => 'Weighted ball for functional training',
                'sort_order' => 16,
            ],
            [
                'name' => 'Foam Roller',
                'name_es' => 'Rodillo de espuma',
                'location' => 'both',
                'description' => 'Self-myofascial release tool for recovery',
                'sort_order' => 17,
            ],
            [
                'name' => 'Yoga Mat',
                'name_es' => 'Esterilla',
                'location' => 'both',
                'description' => 'Non-slip mat for floor exercises and stretching',
                'sort_order' => 18,
            ],
            [
                'name' => 'Parallel Bars',
                'name_es' => 'Barras paralelas',
                'location' => 'gym',
                'description' => 'Parallel bars for dips and gymnastic movements',
                'sort_order' => 19,
            ],
            [
                'name' => 'Box / Plyo Box',
                'name_es' => 'Cajón pliométrico',
                'location' => 'gym',
                'description' => 'Sturdy box for box jumps and step-ups',
                'sort_order' => 20,
            ],
        ];

        foreach ($equipment as $item) {
            EquipmentType::updateOrCreate(
                ['name' => $item['name']],
                $item
            );
        }

        $this->command->info('Equipment types seeded successfully.');
    }
}
