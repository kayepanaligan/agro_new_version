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
        Schema::table('farmers', function (Blueprint $table) {
            // Main Livelihood Type
            $table->enum('main_livelihood_type', ['farmer', 'farmworker', 'fisherfolk', 'agri_youth'])->nullable()->after('civil_status');
            
            // Farmer Fields
            $table->string('farmer_farming_activity')->nullable()->after('main_livelihood_type');
            $table->text('farmer_commodities')->nullable()->after('farmer_farming_activity');
            $table->text('farmer_varieties')->nullable()->after('farmer_commodities');
            
            // Farmworker Fields
            $table->boolean('farmworker_land_preparation')->default(false)->after('farmer_varieties');
            $table->boolean('farmworker_planting')->default(false)->after('farmworker_land_preparation');
            $table->boolean('farmworker_cultivation')->default(false)->after('farmworker_planting');
            $table->boolean('farmworker_harvesting')->default(false)->after('farmworker_cultivation');
            $table->boolean('farmworker_others')->default(false)->after('farmworker_harvesting');
            $table->string('farmworker_others_specify')->nullable()->after('farmworker_others');
            
            // Fisherfolk Fields
            $table->boolean('fisherfolk_fish_capture')->default(false)->after('farmworker_others_specify');
            $table->boolean('fisherfolk_aquaculture')->default(false)->after('fisherfolk_fish_capture');
            $table->boolean('fisherfolk_gleaning')->default(false)->after('fisherfolk_aquaculture');
            $table->boolean('fisherfolk_processing')->default(false)->after('fisherfolk_gleaning');
            $table->boolean('fisherfolk_vending')->default(false)->after('fisherfolk_processing');
            $table->boolean('fisherfolk_others')->default(false)->after('fisherfolk_vending');
            $table->string('fisherfolk_others_specify')->nullable()->after('fisherfolk_others');
            
            // Agri-Youth Fields
            $table->boolean('agri_youth_farming_household')->default(false)->after('fisherfolk_others_specify');
            $table->boolean('agri_youth_formal_course')->default(false)->after('agri_youth_farming_household');
            $table->boolean('agri_youth_participated')->default(false)->after('agri_youth_formal_course');
            $table->boolean('agri_youth_others')->default(false)->after('agri_youth_participated');
            $table->string('agri_youth_others_specify')->nullable()->after('agri_youth_others');
            
            // Gross Annual Income Fields
            $table->decimal('gross_annual_income_farming', 15, 2)->nullable()->after('agri_youth_others_specify');
            $table->decimal('gross_annual_income_non_farming', 15, 2)->nullable()->after('gross_annual_income_farming');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('farmers', function (Blueprint $table) {
            $table->dropColumn([
                'main_livelihood_type',
                'farmer_farming_activity',
                'farmer_commodities',
                'farmer_varieties',
                'farmworker_land_preparation',
                'farmworker_planting',
                'farmworker_cultivation',
                'farmworker_harvesting',
                'farmworker_others',
                'farmworker_others_specify',
                'fisherfolk_fish_capture',
                'fisherfolk_aquaculture',
                'fisherfolk_gleaning',
                'fisherfolk_processing',
                'fisherfolk_vending',
                'fisherfolk_others',
                'fisherfolk_others_specify',
                'agri_youth_farming_household',
                'agri_youth_formal_course',
                'agri_youth_participated',
                'agri_youth_others',
                'agri_youth_others_specify',
                'gross_annual_income_farming',
                'gross_annual_income_non_farming',
            ]);
        });
    }
};
