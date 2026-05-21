<?php

namespace Database\Seeders;

use App\Models\Exercise;
use App\Models\PlanWorkout;
use App\Models\TrainingPlan;
use App\Models\WorkoutExercise;
use Illuminate\Database\Seeder;

class TrainingPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Beginner Home Workout',
                'name_es' => 'Iniciación en Casa',
                'description' => 'Perfect 4-week plan for beginners training at home with no equipment',
                'description_es' => 'Plan perfecto de 4 semanas para principiantes que entrenan en casa sin equipamiento. Desarrolla la base de fuerza y resistencia.',
                'difficulty' => 'beginner',
                'location_type' => 'home',
                'duration_weeks' => 4,
                'sessions_per_week' => 3,
                'estimated_session_duration' => 40,
                'is_public' => true,
                'is_active' => true,
                'sort_order' => 1,
                'tags' => ['principiante', 'casa', 'sin equipamiento', 'full body'],
                'target_goals' => ['general_fitness', 'lose_weight'],
                'workouts' => [
                    [
                        'week' => 1, 'day' => 1,
                        'name' => 'Full Body A',
                        'name_es' => 'Cuerpo Completo A',
                        'estimated_duration' => 40,
                        'exercises' => [
                            ['name' => 'Jumping Jack', 'sets' => 3, 'duration_seconds' => 30, 'rest_seconds' => 30, 'order' => 1, 'is_warmup' => true],
                            ['name' => 'Bodyweight Squat', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 60, 'order' => 2],
                            ['name' => 'Incline Push-up', 'sets' => 3, 'reps' => 10, 'rest_seconds' => 60, 'order' => 3],
                            ['name' => 'Glute Bridge', 'sets' => 3, 'reps' => 15, 'rest_seconds' => 60, 'order' => 4],
                            ['name' => 'Crunch', 'sets' => 3, 'reps' => 15, 'rest_seconds' => 45, 'order' => 5],
                            ['name' => 'Plank', 'sets' => 3, 'duration_seconds' => 20, 'rest_seconds' => 45, 'order' => 6],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 2,
                        'name' => 'Lower Body Focus',
                        'name_es' => 'Tren Inferior',
                        'estimated_duration' => 35,
                        'exercises' => [
                            ['name' => 'Jumping Jack', 'sets' => 2, 'duration_seconds' => 30, 'rest_seconds' => 30, 'order' => 1, 'is_warmup' => true],
                            ['name' => 'Bodyweight Squat', 'sets' => 4, 'reps' => 15, 'rest_seconds' => 60, 'order' => 2],
                            ['name' => 'Lunge', 'sets' => 3, 'reps' => 10, 'rest_seconds' => 60, 'order' => 3, 'notes_es' => '10 repeticiones por pierna'],
                            ['name' => 'Glute Bridge', 'sets' => 4, 'reps' => 20, 'rest_seconds' => 45, 'order' => 4],
                            ['name' => 'Calf Raise', 'sets' => 3, 'reps' => 20, 'rest_seconds' => 45, 'order' => 5],
                            ['name' => 'Wall Sit', 'sets' => 3, 'duration_seconds' => 30, 'rest_seconds' => 60, 'order' => 6],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 3,
                        'name' => 'Upper Body & Core',
                        'name_es' => 'Tren Superior y Core',
                        'estimated_duration' => 40,
                        'exercises' => [
                            ['name' => 'Jumping Jack', 'sets' => 2, 'duration_seconds' => 30, 'rest_seconds' => 30, 'order' => 1, 'is_warmup' => true],
                            ['name' => 'Incline Push-up', 'sets' => 4, 'reps' => 12, 'rest_seconds' => 60, 'order' => 2],
                            ['name' => 'Dips (Bench)', 'sets' => 3, 'reps' => 10, 'rest_seconds' => 60, 'order' => 3],
                            ['name' => 'Crunch', 'sets' => 3, 'reps' => 20, 'rest_seconds' => 45, 'order' => 4],
                            ['name' => 'Bicycle Crunch', 'sets' => 3, 'reps' => 20, 'rest_seconds' => 45, 'order' => 5],
                            ['name' => 'Plank', 'sets' => 3, 'duration_seconds' => 30, 'rest_seconds' => 45, 'order' => 6],
                            ['name' => 'Superman', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 45, 'order' => 7],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Beginner Gym Program',
                'name_es' => 'Iniciación al Gimnasio',
                'description' => '6-week introduction to gym training for absolute beginners',
                'description_es' => 'Programa de 6 semanas de introducción al entrenamiento en gimnasio para absolutos principiantes. Aprende la técnica correcta de los ejercicios fundamentales.',
                'difficulty' => 'beginner',
                'location_type' => 'gym',
                'duration_weeks' => 6,
                'sessions_per_week' => 3,
                'estimated_session_duration' => 55,
                'is_public' => true,
                'is_active' => true,
                'sort_order' => 2,
                'tags' => ['principiante', 'gym', 'técnica', 'full body'],
                'target_goals' => ['gain_muscle', 'general_fitness'],
                'workouts' => [
                    [
                        'week' => 1, 'day' => 1,
                        'name' => 'Full Body Workout A',
                        'name_es' => 'Cuerpo Completo A',
                        'estimated_duration' => 55,
                        'exercises' => [
                            ['name' => 'Bodyweight Squat', 'sets' => 2, 'reps' => 10, 'rest_seconds' => 60, 'order' => 1, 'is_warmup' => true, 'notes_es' => 'Calentamiento - practica la técnica'],
                            ['name' => 'Squat', 'sets' => 3, 'reps' => 10, 'rest_seconds' => 90, 'order' => 2, 'weight_recommendation' => 20],
                            ['name' => 'Bench Press', 'sets' => 3, 'reps' => 10, 'rest_seconds' => 90, 'order' => 3, 'weight_recommendation' => 20],
                            ['name' => 'Lat Pulldown', 'sets' => 3, 'reps' => 10, 'rest_seconds' => 90, 'order' => 4],
                            ['name' => 'Plank', 'sets' => 3, 'duration_seconds' => 30, 'rest_seconds' => 60, 'order' => 5],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 2,
                        'name' => 'Full Body Workout B',
                        'name_es' => 'Cuerpo Completo B',
                        'estimated_duration' => 55,
                        'exercises' => [
                            ['name' => 'Romanian Deadlift', 'sets' => 3, 'reps' => 10, 'rest_seconds' => 90, 'order' => 1, 'weight_recommendation' => 30],
                            ['name' => 'Overhead Press', 'sets' => 3, 'reps' => 8, 'rest_seconds' => 90, 'order' => 2, 'weight_recommendation' => 15],
                            ['name' => 'Dumbbell Row', 'sets' => 3, 'reps' => 10, 'rest_seconds' => 90, 'order' => 3, 'notes_es' => '10 repeticiones por brazo'],
                            ['name' => 'Lunge', 'sets' => 3, 'reps' => 10, 'rest_seconds' => 75, 'order' => 4, 'notes_es' => '10 repeticiones por pierna'],
                            ['name' => 'Crunch', 'sets' => 3, 'reps' => 15, 'rest_seconds' => 45, 'order' => 5],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 3,
                        'name' => 'Full Body Workout C',
                        'name_es' => 'Cuerpo Completo C',
                        'estimated_duration' => 55,
                        'exercises' => [
                            ['name' => 'Goblet Squat', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 75, 'order' => 1],
                            ['name' => 'Dumbbell Fly', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 75, 'order' => 2],
                            ['name' => 'Lat Pulldown', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 75, 'order' => 3],
                            ['name' => 'Lateral Raise', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 60, 'order' => 4],
                            ['name' => 'Hammer Curl', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 60, 'order' => 5],
                            ['name' => 'Bicycle Crunch', 'sets' => 3, 'reps' => 20, 'rest_seconds' => 45, 'order' => 6],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Intermediate Push Pull Legs',
                'name_es' => 'Push Pull Legs Intermedio',
                'description' => '8-week PPL split for intermediate lifters',
                'description_es' => 'Programa de 8 semanas con split Push-Pull-Piernas para nivel intermedio. Maximiza el volumen por grupo muscular.',
                'difficulty' => 'intermediate',
                'location_type' => 'gym',
                'duration_weeks' => 8,
                'sessions_per_week' => 6,
                'estimated_session_duration' => 70,
                'is_public' => true,
                'is_active' => true,
                'sort_order' => 3,
                'tags' => ['intermedio', 'PPL', 'gym', 'volumen', 'fuerza'],
                'target_goals' => ['gain_muscle', 'improve_strength'],
                'workouts' => [
                    [
                        'week' => 1, 'day' => 1,
                        'name' => 'Push Day (Chest/Shoulders/Triceps)',
                        'name_es' => 'Día de Empuje (Pecho/Hombros/Tríceps)',
                        'estimated_duration' => 70,
                        'exercises' => [
                            ['name' => 'Bench Press', 'sets' => 4, 'reps_range_min' => 6, 'reps_range_max' => 8, 'rest_seconds' => 120, 'order' => 1, 'weight_recommendation' => 70],
                            ['name' => 'Overhead Press', 'sets' => 3, 'reps_range_min' => 8, 'reps_range_max' => 10, 'rest_seconds' => 90, 'order' => 2, 'weight_recommendation' => 45],
                            ['name' => 'Dumbbell Fly', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 75, 'order' => 3],
                            ['name' => 'Lateral Raise', 'sets' => 4, 'reps' => 15, 'rest_seconds' => 60, 'order' => 4],
                            ['name' => 'Skull Crusher', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 75, 'order' => 5, 'weight_recommendation' => 25],
                            ['name' => 'Tricep Dip', 'sets' => 3, 'reps_range_min' => 10, 'reps_range_max' => 15, 'rest_seconds' => 75, 'order' => 6],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 2,
                        'name' => 'Pull Day (Back/Biceps)',
                        'name_es' => 'Día de Jalón (Espalda/Bíceps)',
                        'estimated_duration' => 70,
                        'exercises' => [
                            ['name' => 'Deadlift', 'sets' => 4, 'reps_range_min' => 4, 'reps_range_max' => 6, 'rest_seconds' => 180, 'order' => 1, 'weight_recommendation' => 100],
                            ['name' => 'Pull-up', 'sets' => 4, 'reps_range_min' => 6, 'reps_range_max' => 10, 'rest_seconds' => 120, 'order' => 2],
                            ['name' => 'Bent-over Row', 'sets' => 3, 'reps' => 10, 'rest_seconds' => 90, 'order' => 3, 'weight_recommendation' => 60],
                            ['name' => 'Lat Pulldown', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 75, 'order' => 4],
                            ['name' => 'Barbell Curl', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 75, 'order' => 5, 'weight_recommendation' => 30],
                            ['name' => 'Hammer Curl', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 60, 'order' => 6],
                            ['name' => 'Face Pull', 'sets' => 3, 'reps' => 15, 'rest_seconds' => 60, 'order' => 7],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 3,
                        'name' => 'Legs Day',
                        'name_es' => 'Día de Piernas',
                        'estimated_duration' => 75,
                        'exercises' => [
                            ['name' => 'Squat', 'sets' => 4, 'reps_range_min' => 6, 'reps_range_max' => 8, 'rest_seconds' => 180, 'order' => 1, 'weight_recommendation' => 90],
                            ['name' => 'Romanian Deadlift', 'sets' => 3, 'reps' => 10, 'rest_seconds' => 120, 'order' => 2, 'weight_recommendation' => 70],
                            ['name' => 'Lunge', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 90, 'order' => 3, 'notes_es' => '12 repeticiones por pierna'],
                            ['name' => 'Hip Thrust', 'sets' => 4, 'reps' => 12, 'rest_seconds' => 90, 'order' => 4, 'weight_recommendation' => 60],
                            ['name' => 'Calf Raise', 'sets' => 4, 'reps' => 20, 'rest_seconds' => 60, 'order' => 5],
                            ['name' => 'Leg Raise', 'sets' => 3, 'reps' => 15, 'rest_seconds' => 60, 'order' => 6],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 4,
                        'name' => 'Push Day 2',
                        'name_es' => 'Día de Empuje 2',
                        'estimated_duration' => 65,
                        'exercises' => [
                            ['name' => 'Overhead Press', 'sets' => 4, 'reps_range_min' => 6, 'reps_range_max' => 8, 'rest_seconds' => 120, 'order' => 1, 'weight_recommendation' => 50],
                            ['name' => 'Bench Press', 'sets' => 3, 'reps_range_min' => 10, 'reps_range_max' => 12, 'rest_seconds' => 90, 'order' => 2, 'weight_recommendation' => 60],
                            ['name' => 'Dumbbell Fly', 'sets' => 3, 'reps' => 15, 'rest_seconds' => 60, 'order' => 3],
                            ['name' => 'Lateral Raise', 'sets' => 4, 'reps' => 20, 'rest_seconds' => 45, 'order' => 4],
                            ['name' => 'Dips (Bench)', 'sets' => 3, 'reps_range_min' => 12, 'reps_range_max' => 15, 'rest_seconds' => 60, 'order' => 5],
                            ['name' => 'Diamond Push-up', 'sets' => 3, 'reps_range_min' => 10, 'reps_range_max' => 15, 'rest_seconds' => 60, 'order' => 6],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 5,
                        'name' => 'Pull Day 2',
                        'name_es' => 'Día de Jalón 2',
                        'estimated_duration' => 65,
                        'exercises' => [
                            ['name' => 'Pull-up', 'sets' => 4, 'reps_range_min' => 6, 'reps_range_max' => 10, 'rest_seconds' => 120, 'order' => 1],
                            ['name' => 'Dumbbell Row', 'sets' => 4, 'reps' => 12, 'rest_seconds' => 75, 'order' => 2, 'notes_es' => '12 repeticiones por brazo'],
                            ['name' => 'Lat Pulldown', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 75, 'order' => 3],
                            ['name' => 'Face Pull', 'sets' => 4, 'reps' => 20, 'rest_seconds' => 45, 'order' => 4],
                            ['name' => 'Barbell Curl', 'sets' => 3, 'reps' => 15, 'rest_seconds' => 60, 'order' => 5, 'weight_recommendation' => 25],
                            ['name' => 'Hammer Curl', 'sets' => 3, 'reps' => 15, 'rest_seconds' => 60, 'order' => 6],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 6,
                        'name' => 'Legs Day 2',
                        'name_es' => 'Día de Piernas 2',
                        'estimated_duration' => 65,
                        'exercises' => [
                            ['name' => 'Romanian Deadlift', 'sets' => 4, 'reps' => 10, 'rest_seconds' => 120, 'order' => 1, 'weight_recommendation' => 75],
                            ['name' => 'Goblet Squat', 'sets' => 4, 'reps' => 12, 'rest_seconds' => 90, 'order' => 2],
                            ['name' => 'Hip Thrust', 'sets' => 4, 'reps' => 15, 'rest_seconds' => 90, 'order' => 3, 'weight_recommendation' => 50],
                            ['name' => 'Step-up', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 75, 'order' => 4, 'notes_es' => '12 repeticiones por pierna'],
                            ['name' => 'Calf Raise', 'sets' => 4, 'reps' => 25, 'rest_seconds' => 45, 'order' => 5],
                            ['name' => 'Russian Twist', 'sets' => 3, 'reps' => 20, 'rest_seconds' => 45, 'order' => 6],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Advanced Strength Program',
                'name_es' => 'Programa de Fuerza Avanzado',
                'description' => '12-week advanced strength program based on periodization',
                'description_es' => 'Programa de 12 semanas de fuerza avanzado basado en periodización. Para deportistas con experiencia que buscan maximizar su rendimiento.',
                'difficulty' => 'advanced',
                'location_type' => 'gym',
                'duration_weeks' => 12,
                'sessions_per_week' => 4,
                'estimated_session_duration' => 90,
                'is_public' => true,
                'is_active' => true,
                'sort_order' => 4,
                'tags' => ['avanzado', 'fuerza', 'periodización', 'powerlifting'],
                'target_goals' => ['improve_strength', 'gain_muscle'],
                'workouts' => [
                    [
                        'week' => 1, 'day' => 1,
                        'name' => 'Chest & Triceps (Heavy)',
                        'name_es' => 'Pecho y Tríceps (Pesado)',
                        'estimated_duration' => 90,
                        'exercises' => [
                            ['name' => 'Bench Press', 'sets' => 5, 'reps_range_min' => 3, 'reps_range_max' => 5, 'rest_seconds' => 180, 'order' => 1, 'rpe' => 8.5, 'weight_recommendation' => 100],
                            ['name' => 'Bench Press', 'sets' => 3, 'reps_range_min' => 8, 'reps_range_max' => 10, 'rest_seconds' => 120, 'order' => 2, 'weight_recommendation' => 75, 'notes_es' => 'Backoff sets'],
                            ['name' => 'Dumbbell Fly', 'sets' => 4, 'reps' => 12, 'rest_seconds' => 75, 'order' => 3],
                            ['name' => 'Skull Crusher', 'sets' => 4, 'reps_range_min' => 8, 'reps_range_max' => 10, 'rest_seconds' => 90, 'order' => 4, 'weight_recommendation' => 35],
                            ['name' => 'Tricep Dip', 'sets' => 4, 'reps_range_min' => 10, 'reps_range_max' => 15, 'rest_seconds' => 75, 'order' => 5],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 2,
                        'name' => 'Back & Biceps (Heavy)',
                        'name_es' => 'Espalda y Bíceps (Pesado)',
                        'estimated_duration' => 90,
                        'exercises' => [
                            ['name' => 'Deadlift', 'sets' => 5, 'reps_range_min' => 2, 'reps_range_max' => 4, 'rest_seconds' => 240, 'order' => 1, 'rpe' => 9.0, 'weight_recommendation' => 140],
                            ['name' => 'Pull-up', 'sets' => 5, 'reps_range_min' => 5, 'reps_range_max' => 8, 'rest_seconds' => 120, 'order' => 2],
                            ['name' => 'Bent-over Row', 'sets' => 4, 'reps_range_min' => 6, 'reps_range_max' => 8, 'rest_seconds' => 120, 'order' => 3, 'weight_recommendation' => 90],
                            ['name' => 'Barbell Curl', 'sets' => 4, 'reps_range_min' => 8, 'reps_range_max' => 10, 'rest_seconds' => 75, 'order' => 4, 'weight_recommendation' => 45],
                            ['name' => 'Face Pull', 'sets' => 4, 'reps' => 20, 'rest_seconds' => 45, 'order' => 5],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 3,
                        'name' => 'Legs (Heavy)',
                        'name_es' => 'Piernas (Pesado)',
                        'estimated_duration' => 95,
                        'exercises' => [
                            ['name' => 'Squat', 'sets' => 5, 'reps_range_min' => 3, 'reps_range_max' => 5, 'rest_seconds' => 240, 'order' => 1, 'rpe' => 8.5, 'weight_recommendation' => 130],
                            ['name' => 'Romanian Deadlift', 'sets' => 4, 'reps_range_min' => 6, 'reps_range_max' => 8, 'rest_seconds' => 120, 'order' => 2, 'weight_recommendation' => 100],
                            ['name' => 'Hip Thrust', 'sets' => 4, 'reps' => 10, 'rest_seconds' => 90, 'order' => 3, 'weight_recommendation' => 100],
                            ['name' => 'Box Jump', 'sets' => 4, 'reps' => 5, 'rest_seconds' => 120, 'order' => 4, 'notes_es' => 'Explosivo, aterriza suave'],
                            ['name' => 'Calf Raise', 'sets' => 5, 'reps' => 15, 'rest_seconds' => 60, 'order' => 5],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 4,
                        'name' => 'Shoulders & Arms',
                        'name_es' => 'Hombros y Brazos',
                        'estimated_duration' => 80,
                        'exercises' => [
                            ['name' => 'Overhead Press', 'sets' => 5, 'reps_range_min' => 3, 'reps_range_max' => 5, 'rest_seconds' => 180, 'order' => 1, 'rpe' => 8.5, 'weight_recommendation' => 75],
                            ['name' => 'Lateral Raise', 'sets' => 5, 'reps' => 15, 'rest_seconds' => 60, 'order' => 2],
                            ['name' => 'Face Pull', 'sets' => 4, 'reps' => 20, 'rest_seconds' => 45, 'order' => 3],
                            ['name' => 'Barbell Curl', 'sets' => 4, 'reps_range_min' => 8, 'reps_range_max' => 10, 'rest_seconds' => 75, 'order' => 4, 'weight_recommendation' => 40],
                            ['name' => 'Skull Crusher', 'sets' => 4, 'reps' => 12, 'rest_seconds' => 75, 'order' => 5, 'weight_recommendation' => 30],
                            ['name' => 'Russian Twist', 'sets' => 3, 'reps' => 20, 'rest_seconds' => 45, 'order' => 6],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Home HIIT & Strength',
                'name_es' => 'HIIT y Fuerza en Casa',
                'description' => '6-week home workout combining HIIT and bodyweight strength',
                'description_es' => 'Programa de 6 semanas en casa combinando HIIT y fuerza con peso corporal. Quema grasa y mantén músculo.',
                'difficulty' => 'intermediate',
                'location_type' => 'home',
                'duration_weeks' => 6,
                'sessions_per_week' => 4,
                'estimated_session_duration' => 50,
                'is_public' => true,
                'is_active' => true,
                'sort_order' => 5,
                'tags' => ['intermedio', 'casa', 'HIIT', 'pérdida de grasa', 'sin equipamiento'],
                'target_goals' => ['lose_weight', 'improve_endurance'],
                'workouts' => [
                    [
                        'week' => 1, 'day' => 1,
                        'name' => 'HIIT Full Body',
                        'name_es' => 'HIIT Cuerpo Completo',
                        'estimated_duration' => 45,
                        'exercises' => [
                            ['name' => 'Jumping Jack', 'sets' => 1, 'duration_seconds' => 60, 'rest_seconds' => 30, 'order' => 1, 'is_warmup' => true],
                            ['name' => 'Burpee', 'sets' => 4, 'duration_seconds' => 30, 'rest_seconds' => 15, 'order' => 2, 'notes_es' => 'Intervalos 30s trabajo / 15s descanso'],
                            ['name' => 'Mountain Climber', 'sets' => 4, 'duration_seconds' => 30, 'rest_seconds' => 15, 'order' => 3],
                            ['name' => 'Jumping Jack', 'sets' => 4, 'duration_seconds' => 30, 'rest_seconds' => 15, 'order' => 4],
                            ['name' => 'Push-up', 'sets' => 4, 'duration_seconds' => 30, 'rest_seconds' => 15, 'order' => 5],
                            ['name' => 'Bodyweight Squat', 'sets' => 4, 'duration_seconds' => 30, 'rest_seconds' => 15, 'order' => 6],
                            ['name' => 'Plank', 'sets' => 1, 'duration_seconds' => 60, 'rest_seconds' => 60, 'order' => 7, 'notes_es' => 'Para finalizar'],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 2,
                        'name' => 'Lower Body Strength',
                        'name_es' => 'Fuerza Tren Inferior',
                        'estimated_duration' => 50,
                        'exercises' => [
                            ['name' => 'Bodyweight Squat', 'sets' => 4, 'reps' => 20, 'rest_seconds' => 60, 'order' => 1],
                            ['name' => 'Lunge', 'sets' => 4, 'reps' => 15, 'rest_seconds' => 60, 'order' => 2, 'notes_es' => '15 por pierna'],
                            ['name' => 'Glute Bridge', 'sets' => 4, 'reps' => 25, 'rest_seconds' => 45, 'order' => 3],
                            ['name' => 'Wall Sit', 'sets' => 3, 'duration_seconds' => 45, 'rest_seconds' => 60, 'order' => 4],
                            ['name' => 'Calf Raise', 'sets' => 4, 'reps' => 25, 'rest_seconds' => 45, 'order' => 5],
                            ['name' => 'Step-up', 'sets' => 3, 'reps' => 15, 'rest_seconds' => 60, 'order' => 6, 'notes_es' => '15 por pierna, usa una silla'],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 3,
                        'name' => 'Upper Body Strength',
                        'name_es' => 'Fuerza Tren Superior',
                        'estimated_duration' => 50,
                        'exercises' => [
                            ['name' => 'Push-up', 'sets' => 4, 'reps' => 15, 'rest_seconds' => 75, 'order' => 1],
                            ['name' => 'Diamond Push-up', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 75, 'order' => 2],
                            ['name' => 'Pike Push-up', 'sets' => 3, 'reps' => 10, 'rest_seconds' => 75, 'order' => 3],
                            ['name' => 'Dips (Bench)', 'sets' => 3, 'reps' => 15, 'rest_seconds' => 60, 'order' => 4],
                            ['name' => 'Decline Push-up', 'sets' => 3, 'reps' => 12, 'rest_seconds' => 75, 'order' => 5],
                            ['name' => 'Plank', 'sets' => 3, 'duration_seconds' => 45, 'rest_seconds' => 45, 'order' => 6],
                        ],
                    ],
                    [
                        'week' => 1, 'day' => 4,
                        'name' => 'Core & Conditioning',
                        'name_es' => 'Core y Acondicionamiento',
                        'estimated_duration' => 45,
                        'exercises' => [
                            ['name' => 'Mountain Climber', 'sets' => 4, 'duration_seconds' => 45, 'rest_seconds' => 30, 'order' => 1],
                            ['name' => 'Crunch', 'sets' => 4, 'reps' => 25, 'rest_seconds' => 45, 'order' => 2],
                            ['name' => 'Bicycle Crunch', 'sets' => 4, 'reps' => 30, 'rest_seconds' => 45, 'order' => 3],
                            ['name' => 'Leg Raise', 'sets' => 4, 'reps' => 15, 'rest_seconds' => 45, 'order' => 4],
                            ['name' => 'Russian Twist', 'sets' => 4, 'reps' => 30, 'rest_seconds' => 45, 'order' => 5],
                            ['name' => 'Plank', 'sets' => 3, 'duration_seconds' => 60, 'rest_seconds' => 45, 'order' => 6],
                            ['name' => 'Superman', 'sets' => 3, 'reps' => 15, 'rest_seconds' => 45, 'order' => 7],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($plans as $planData) {
            $workoutsData = $planData['workouts'];
            unset($planData['workouts']);

            $plan = TrainingPlan::updateOrCreate(
                ['name' => $planData['name']],
                $planData
            );

            // Create workouts for the first week (template - other weeks copy this pattern)
            foreach ($workoutsData as $workoutData) {
                $exercisesData = $workoutData['exercises'];
                unset($workoutData['exercises']);

                $workout = PlanWorkout::updateOrCreate(
                    [
                        'plan_id' => $plan->id,
                        'week_number' => $workoutData['week'],
                        'day_number' => $workoutData['day'],
                    ],
                    [
                        'plan_id' => $plan->id,
                        'week_number' => $workoutData['week'],
                        'day_number' => $workoutData['day'],
                        'name' => $workoutData['name'],
                        'name_es' => $workoutData['name_es'],
                        'estimated_duration_minutes' => $workoutData['estimated_duration'],
                    ]
                );

                foreach ($exercisesData as $exerciseData) {
                    $exercise = Exercise::where('name', $exerciseData['name'])->first();
                    if (!$exercise) {
                        continue;
                    }

                    WorkoutExercise::updateOrCreate(
                        [
                            'workout_id' => $workout->id,
                            'exercise_id' => $exercise->id,
                            'order' => $exerciseData['order'],
                        ],
                        [
                            'workout_id' => $workout->id,
                            'exercise_id' => $exercise->id,
                            'sets' => $exerciseData['sets'] ?? 3,
                            'reps' => $exerciseData['reps'] ?? null,
                            'reps_range_min' => $exerciseData['reps_range_min'] ?? null,
                            'reps_range_max' => $exerciseData['reps_range_max'] ?? null,
                            'duration_seconds' => $exerciseData['duration_seconds'] ?? null,
                            'rest_seconds' => $exerciseData['rest_seconds'] ?? 60,
                            'weight_recommendation' => $exerciseData['weight_recommendation'] ?? null,
                            'rpe' => $exerciseData['rpe'] ?? null,
                            'order' => $exerciseData['order'],
                            'notes_es' => $exerciseData['notes_es'] ?? null,
                            'is_warmup' => $exerciseData['is_warmup'] ?? false,
                            'is_cooldown' => $exerciseData['is_cooldown'] ?? false,
                        ]
                    );
                }
            }
        }

        $this->command->info('Training plans seeded successfully: ' . count($plans) . ' plans created.');
    }
}
