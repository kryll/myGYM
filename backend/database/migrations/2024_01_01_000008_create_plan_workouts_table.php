<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_workouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained('training_plans')->onDelete('cascade');
            $table->tinyInteger('week_number')->default(1);
            $table->tinyInteger('day_number')->default(1);
            $table->string('name', 200);
            $table->string('name_es', 200)->nullable();
            $table->text('description')->nullable();
            $table->smallInteger('estimated_duration_minutes')->default(60);
            $table->string('workout_type', 50)->nullable();
            $table->json('target_muscle_groups')->nullable();
            $table->text('notes')->nullable();
            $table->tinyInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['plan_id', 'week_number', 'day_number']);
            $table->unique(['plan_id', 'week_number', 'day_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_workouts');
    }
};
