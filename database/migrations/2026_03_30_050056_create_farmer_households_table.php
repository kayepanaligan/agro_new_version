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
        Schema::create('farmer_households', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained()->onDelete('cascade');
            $table->boolean('is_household_head')->default(false);
            $table->string('household_head_first_name')->nullable();
            $table->string('household_head_middle_name')->nullable();
            $table->string('household_head_surname')->nullable();
            $table->string('household_head_extension_name')->nullable();
            $table->string('relationship_to_household_head')->nullable();
            $table->integer('no_male_household_members')->default(0);
            $table->integer('no_female_household_members')->default(0);
            $table->integer('no_living_household_members')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('farmer_households');
    }
};
