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
        Schema::create('crop_rotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_parcel_id')->constrained()->onDelete('cascade');
            $table->foreignId('farmer_id')->constrained()->onDelete('cascade');
            
            // Season/Crop Cycle Information
            $table->string('season_identifier')->nullable(); // e.g., "Season 1", "Wet Season"
            $table->integer('cycle_order')->default(1); // sequence of crop rotation
            
            // Crop Information
            $table->foreignId('commodity_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('variety_id')->nullable()->constrained()->onDelete('set null');
            
            // Planting and Harvesting Dates
            $table->date('planting_date')->nullable();
            $table->date('harvest_date')->nullable();
            
            // Area planted for this rotation
            $table->decimal('area_planted', 10, 4)->default(0);
            
            // Yield information
            $table->decimal('yield_quantity', 10, 2)->nullable();
            $table->string('yield_unit')->nullable(); // kg, tons, etc.
            
            // Remarks
            $table->text('remarks')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crop_rotations');
    }
};
