<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('device_type', 50);
            $table->string('device_name', 200)->nullable();
            $table->string('device_mac', 20)->nullable();
            $table->string('device_model', 100)->nullable();
            $table->string('firmware_version', 50)->nullable();
            $table->text('access_token')->nullable();
            $table->text('refresh_token')->nullable();
            $table->timestamp('token_expires_at')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable();
            $table->json('capabilities')->nullable();
            $table->smallInteger('sync_frequency_minutes')->default(60);
            $table->boolean('auto_sync')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'device_type']);
            $table->index(['user_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_connections');
    }
};
