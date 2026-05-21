<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('name_es', 200)->nullable();
            $table->text('description')->nullable();
            $table->text('description_es')->nullable();
            $table->foreignId('primary_muscle_group_id')->nullable()->constrained('muscle_groups')->onDelete('set null');
            $table->json('muscle_groups')->nullable();
            $table->json('secondary_muscle_groups')->nullable();
            $table->foreignId('equipment_id')->nullable()->constrained('equipment_types')->onDelete('set null');
            $table->string('difficulty', 30)->default('beginner');
            $table->string('location_type', 30)->default('both');
            $table->string('exercise_type', 30)->default('strength');
            $table->string('video_url')->nullable();
            $table->string('image_url')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->json('instructions')->nullable();
            $table->json('tips')->nullable();
            $table->json('variations')->nullable();
            $table->float('calories_per_minute')->nullable();
            $table->float('met_value')->nullable();
            $table->boolean('is_compound')->default(false);
            $table->boolean('is_public')->default(true);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by_tenant_id')->nullable()->constrained('tenants')->onDelete('set null');
            $table->json('tags')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['difficulty', 'location_type']);
            $table->index(['primary_muscle_group_id', 'difficulty']);
            $table->index(['is_active', 'is_public']);
            $table->index('exercise_type');
            $table->index('equipment_id');
            $table->fullText(['name', 'name_es']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};
