<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('plan')->default('trial');
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('owner_name')->nullable();
            $table->string('owner_email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('timezone', 50)->default('UTC');
            $table->string('logo_url')->nullable();
            $table->string('primary_color', 7)->nullable();
            $table->integer('max_users')->default(5);
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscribed_at')->nullable();
            $table->timestamp('subscription_expires_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['slug', 'is_active']);
            $table->index('plan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
