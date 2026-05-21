<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('body_measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('measured_at');
            $table->float('weight_kg')->nullable();
            $table->float('bmi')->nullable();
            $table->float('body_fat_percent')->nullable();
            $table->float('muscle_mass_kg')->nullable();
            $table->float('water_percent')->nullable();
            $table->float('bone_mass_kg')->nullable();
            $table->float('visceral_fat')->nullable();
            $table->tinyInteger('metabolic_age')->nullable();
            $table->float('protein_percent')->nullable();
            $table->float('basal_metabolism')->nullable();
            $table->float('subcutaneous_fat')->nullable();
            $table->float('skeletal_muscle_rate')->nullable();
            $table->float('body_score')->nullable();
            $table->string('source', 50)->default('manual');
            $table->string('device_id')->nullable();
            $table->json('raw_data')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'measured_at']);
            $table->index(['user_id', 'source']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('body_measurements');
    }
};
