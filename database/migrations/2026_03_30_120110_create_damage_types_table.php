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
        Schema::create('damage_types', function (Blueprint $table) {
            $table->id('damage_type_id');
            $table->string('damage_type_name')->unique();
            $table->foreignId('damage_category_id')
                  ->constrained('damage_categories', 'damage_category_id')
                  ->onDelete('cascade');
            $table->text('damage_type_description')->nullable();
            $table->string('image_path')->nullable();
            $table->boolean('is_ai_generated')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('damage_types');
    }
};
