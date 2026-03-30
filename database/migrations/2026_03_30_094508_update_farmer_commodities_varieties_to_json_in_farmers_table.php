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
            // Add category field
            $table->string('farmer_category')->nullable()->after('farmer_farming_activity');
            
            // Change commodities and varieties to JSON for multi-select support
            $table->json('farmer_commodities')->nullable()->change();
            $table->json('farmer_varieties')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('farmers', function (Blueprint $table) {
            $table->dropColumn('farmer_category');
            $table->text('farmer_commodities')->nullable()->change();
            $table->text('farmer_varieties')->nullable()->change();
        });
    }
};
