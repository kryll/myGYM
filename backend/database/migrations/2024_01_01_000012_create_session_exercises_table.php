<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('workout_sessions')->onDelete('cascade');
            $table->foreignId('exercise_id')->constrained('exercises')->onDelete('cascade');
            $table->foreignId('workout_exercise_id')->nullable()->constrained('workout_exercises')->onDelete('set null');
            $table->json('sets_completed')->nullable();
            $table->json('weight_used')->nullable();
            $table->json('reps_completed')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->smallInteger('rest_taken_seconds')->nullable();
            $table->json('heart_rate_during')->nullable();
            $table->tinyInteger('perceived_exertion')->nullable()->comment('1-10 scale');
            $table->text('notes')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->string('skipped_reason')->nullable();
            $table->boolean('personal_record')->default(false);
            $table->timestamps();

            $table->index(['session_id', 'exercise_id']);
            $table->index('exercise_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_exercises');
    }
};
