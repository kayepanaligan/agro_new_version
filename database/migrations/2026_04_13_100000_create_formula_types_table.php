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
        Schema::create('formula_types', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['equal', 'proportional', 'priority', 'weighted'])->unique();
            $table->string('name');
            $table->text('short_description');
            $table->text('formula_expression');
            $table->json('logic_notes')->nullable();     // Array of logic bullet strings
            $table->json('example')->nullable();         // Structured example data
            $table->string('use_case')->nullable();      // One-liner use case label
            $table->json('edge_cases')->nullable();      // Array of edge case strings
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formula_types');
    }
};
