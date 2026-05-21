<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_training_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('training_plans')->onDelete('cascade');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->tinyInteger('current_week')->default(1);
            $table->tinyInteger('current_day')->default(1);
            $table->boolean('is_active')->default(true);
            $table->float('completion_percentage')->default(0);
            $table->smallInteger('total_sessions_completed')->default(0);
            $table->text('notes')->nullable();
            $table->tinyInteger('rating')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index(['user_id', 'plan_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_training_plans');
    }
};
