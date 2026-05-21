<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('name_es', 100)->nullable();
            $table->string('location', 30)->default('both');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->tinyInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('location');
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment_types');
    }
};
