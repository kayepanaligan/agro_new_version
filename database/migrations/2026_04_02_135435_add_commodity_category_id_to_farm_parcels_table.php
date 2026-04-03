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
        Schema::table('farm_parcels', function (Blueprint $table) {
            // Add commodity_category_id column before commodity_id
            $table->foreignId('commodity_category_id')->nullable()->after('remarks')->constrained('categories')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('farm_parcels', function (Blueprint $table) {
            // Drop foreign key and column
            $table->dropForeign(['commodity_category_id']);
            $table->dropColumn('commodity_category_id');
        });
    }
};
