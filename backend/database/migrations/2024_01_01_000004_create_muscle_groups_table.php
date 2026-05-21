<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('muscle_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('name_es', 100)->nullable();
            $table->string('body_part', 30)->default('upper');
            $table->string('image_url')->nullable();
            $table->text('description')->nullable();
            $table->tinyInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('body_part');
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('muscle_groups');
    }
};
