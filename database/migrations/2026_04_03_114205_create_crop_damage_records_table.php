<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('crop_damage_records', function (Blueprint $table) {
            $table->id('crop_damage_record_id');
            $table->string('name'); // Name of the crop damage record folder
            $table->date('recorded_date'); // Date it was recorded/updated
            $table->text('notes')->nullable(); // General notes about this folder
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crop_damage_records');
    }
};
