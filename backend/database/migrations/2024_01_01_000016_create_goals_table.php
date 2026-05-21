<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type', 50)->default('custom');
            $table->string('title', 200);
            $table->string('title_es', 200)->nullable();
            $table->text('description')->nullable();
            $table->float('target_value')->nullable();
            $table->float('current_value')->nullable();
            $table->float('initial_value')->nullable();
            $table->string('unit', 30)->nullable();
            $table->date('deadline')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->tinyInteger('priority')->default(1)->comment('1=low, 2=medium, 3=high');
            $table->json('milestones')->nullable();
            $table->string('reminder_frequency', 30)->nullable();
            $table->timestamp('last_reminded_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_active', 'is_completed']);
            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'deadline']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
