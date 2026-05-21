<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('title_es', 200)->nullable();
            $table->text('description')->nullable();
            $table->text('description_es')->nullable();
            $table->string('type', 50)->default('workout_count');
            $table->string('difficulty', 30)->default('beginner');
            $table->smallInteger('duration_days')->default(30);
            $table->float('target_value');
            $table->string('target_unit', 30)->default('count');
            $table->integer('reward_points')->default(100);
            $table->string('cover_image_url')->nullable();
            $table->string('badge_image_url')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(false);
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('max_participants')->nullable();
            $table->json('tags')->nullable();
            $table->json('rules')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['is_active', 'start_date', 'end_date']);
            $table->index(['tenant_id', 'is_active']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('challenges');
    }
};
