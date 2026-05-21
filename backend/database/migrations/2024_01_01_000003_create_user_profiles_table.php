<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->date('date_of_birth')->nullable();
            $table->float('height_cm')->nullable();
            $table->float('weight_kg')->nullable();
            $table->string('sex', 20)->nullable();
            $table->string('fitness_level', 30)->default('beginner');
            $table->string('primary_goal', 50)->nullable();
            $table->json('secondary_goals')->nullable();
            $table->json('available_equipment')->nullable();
            $table->tinyInteger('workout_days_per_week')->default(3);
            $table->smallInteger('preferred_workout_duration')->default(60);
            $table->text('medical_notes')->nullable();
            $table->json('injuries')->nullable();
            $table->string('activity_level', 30)->default('moderately_active');
            $table->string('occupation', 100)->nullable();
            $table->json('dietary_preferences')->nullable();
            $table->boolean('onboarding_completed')->default(false);
            $table->timestamp('onboarding_completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'fitness_level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
