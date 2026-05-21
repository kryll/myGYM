<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('plan_workout_id')->nullable()->constrained('plan_workouts')->onDelete('set null');
            $table->foreignId('user_training_plan_id')->nullable()->constrained('user_training_plans')->onDelete('set null');
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->float('total_duration_minutes')->nullable();
            $table->float('active_duration_minutes')->nullable();
            $table->float('calories_burned')->nullable();
            $table->string('status', 30)->default('in_progress');
            $table->text('notes')->nullable();
            $table->smallInteger('heart_rate_avg')->nullable();
            $table->smallInteger('heart_rate_max')->nullable();
            $table->smallInteger('heart_rate_min')->nullable();
            $table->integer('steps_count')->nullable();
            $table->float('distance_meters')->nullable();
            $table->string('device_source', 50)->default('app');
            $table->json('device_data')->nullable();
            $table->tinyInteger('overall_feeling')->nullable()->comment('1-5 scale');
            $table->tinyInteger('difficulty_rating')->nullable()->comment('1-5 scale');
            $table->string('location_type', 30)->nullable();
            $table->string('weather_condition', 50)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'started_at']);
            $table->index('plan_workout_id');
            $table->index('user_training_plan_id');
            $table->index('started_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_sessions');
    }
};
