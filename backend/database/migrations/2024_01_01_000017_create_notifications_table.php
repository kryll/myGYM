<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type', 80);
            $table->string('title', 200);
            $table->text('body');
            $table->json('data')->nullable();
            $table->string('channel', 30)->default('in_app');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->string('image_url')->nullable();
            $table->string('action_url')->nullable();
            $table->string('action_label', 100)->nullable();
            $table->tinyInteger('priority')->default(1)->comment('1=low, 2=medium, 3=high');
            $table->boolean('is_silent')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
            $table->index(['user_id', 'channel']);
            $table->index(['user_id', 'sent_at']);
            $table->index(['scheduled_at', 'sent_at']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
