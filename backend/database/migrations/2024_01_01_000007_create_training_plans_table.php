<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('name_es', 200)->nullable();
            $table->text('description')->nullable();
            $table->text('description_es')->nullable();
            $table->string('difficulty', 30)->default('beginner');
            $table->string('location_type', 30)->default('gym');
            $table->tinyInteger('duration_weeks')->default(4);
            $table->tinyInteger('sessions_per_week')->default(3);
            $table->smallInteger('estimated_session_duration')->default(60);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('cascade');
            $table->boolean('is_ai_generated')->default(false);
            $table->boolean('is_public')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('cover_image_url')->nullable();
            $table->json('tags')->nullable();
            $table->json('target_goals')->nullable();
            $table->json('required_equipment')->nullable();
            $table->json('ai_generation_params')->nullable();
            $table->tinyInteger('sort_order')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['difficulty', 'location_type', 'is_active']);
            $table->index(['is_public', 'is_active']);
            $table->index(['tenant_id', 'is_active']);
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_plans');
    }
};
