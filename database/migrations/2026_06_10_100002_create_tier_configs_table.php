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
        Schema::create('tier_configs', function (Blueprint $table) {
            $table->id();
            $table->string('tier_name'); // Seedling, Bronze, Silver, Gold
            $table->integer('min_points');
            $table->integer('max_points')->nullable();
            $table->json('benefits')->nullable(); // JSON description
            $table->string('color')->default('green'); // for UI
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index('tier_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tier_configs');
    }
};
