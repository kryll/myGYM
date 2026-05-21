<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_id')->constrained('plan_workouts')->onDelete('cascade');
            $table->foreignId('exercise_id')->constrained('exercises')->onDelete('cascade');
            $table->tinyInteger('sets')->default(3);
            $table->tinyInteger('reps')->nullable();
            $table->tinyInteger('reps_range_min')->nullable();
            $table->tinyInteger('reps_range_max')->nullable();
            $table->smallInteger('duration_seconds')->nullable();
            $table->smallInteger('rest_seconds')->default(60);
            $table->float('weight_recommendation')->nullable();
            $table->string('weight_unit', 10)->default('kg');
            $table->string('tempo', 20)->nullable();
            $table->float('rpe')->nullable();
            $table->tinyInteger('order')->default(0);
            $table->text('notes')->nullable();
            $table->text('notes_es')->nullable();
            $table->tinyInteger('superset_group')->nullable();
            $table->boolean('is_warmup')->default(false);
            $table->boolean('is_cooldown')->default(false);
            $table->timestamps();

            $table->index(['workout_id', 'order']);
            $table->index('exercise_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_exercises');
    }
};
