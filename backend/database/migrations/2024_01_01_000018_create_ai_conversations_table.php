<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title')->nullable();
            $table->string('type', 50)->default('general');
            $table->json('context')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_message_at')->nullable();
            $table->integer('total_tokens_used')->default(0);
            $table->integer('message_count')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index(['user_id', 'last_message_at']);
            $table->index('type');
        });

        Schema::create('ai_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('ai_conversations')->onDelete('cascade');
            $table->string('role', 20)->default('user');
            $table->longText('content');
            $table->integer('tokens_used')->default(0);
            $table->string('model', 100)->nullable();
            $table->integer('input_tokens')->default(0);
            $table->integer('output_tokens')->default(0);
            $table->integer('processing_time_ms')->nullable();
            $table->boolean('is_streaming')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'role']);
            $table->index('conversation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_messages');
        Schema::dropIfExists('ai_conversations');
    }
};
