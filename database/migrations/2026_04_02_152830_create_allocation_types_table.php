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
        Schema::create('allocation_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2);
            $table->foreignId('unit_of_measurement_id')->constrained('unit_of_measures')->onDelete('restrict');
            $table->foreignId('program_id')->constrained('programs')->onDelete('cascade');
            $table->json('category_ids')->nullable(); // Multiple categories
            $table->json('commodity_ids')->nullable(); // Multiple commodities
            $table->json('variety_ids')->nullable(); // Multiple varieties
            $table->json('barangay_ids')->nullable(); // Multiple barangays
            $table->json('farmer_eligibility_criteria')->nullable(); // JSON of eligibility requirements
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('allocation_types');
    }
};
