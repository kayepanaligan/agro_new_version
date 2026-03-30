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
        Schema::create('farm_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained()->onDelete('cascade');
            
            // Main Livelihood
            $table->enum('main_livelihood', ['farmer', 'farmworker_laborer', 'fisherfolk', 'agri_youth']);
            
            // For Farmers - Type of Farming Activity
            $table->string('farming_activity_type')->nullable(); // crop production, livestock, etc.
            $table->foreignId('farming_commodity_category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->foreignId('farming_commodity_id')->nullable()->constrained('commodities')->onDelete('set null');
            $table->foreignId('farming_variety_id')->nullable()->constrained('varieties')->onDelete('set null');
            
            // For Farmworkers - Kind of Work
            $table->string('farmworker_kind_of_work')->nullable(); // land preparation, planting, etc.
            $table->string('farmworker_other_specify')->nullable();
            
            // For Fisherfolk - Type of Fishing Activity
            $table->string('fisherfolk_fishing_activity')->nullable(); // fish capture, aquaculture, etc.
            $table->string('fisherfolk_other_specify')->nullable();
            
            // For Agri-Youth - Type of Involvement
            $table->string('agri_youth_involvement')->nullable(); // part of farming household, attending course, etc.
            $table->string('agri_youth_other_specify')->nullable();
            
            // Gross Annual Income
            $table->decimal('gross_annual_income_farming', 15, 2)->nullable();
            $table->decimal('gross_annual_income_non_farming', 15, 2)->nullable();
            
            // Total Farm Size (sum of all parcels)
            $table->decimal('total_farm_size', 10, 4)->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('farm_profiles');
    }
};
