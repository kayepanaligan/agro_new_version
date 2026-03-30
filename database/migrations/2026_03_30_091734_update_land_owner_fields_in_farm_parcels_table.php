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
            // Add new landowner name fields
            $table->string('landowner_first_name')->nullable()->after('ownership_type');
            $table->string('landowner_middle_name')->nullable()->after('landowner_first_name');
            $table->string('landowner_surname')->nullable()->after('landowner_middle_name');
            $table->string('landowner_extension_name')->nullable()->after('landowner_surname');
            
            // Drop old landowner name field
            $table->dropColumn(['land_owner_first_name', 'land_owner_middle_name', 'land_owner_surname', 'land_owner_extension_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('farm_parcels', function (Blueprint $table) {
            // Restore old fields
            $table->string('land_owner_first_name')->nullable()->after('ownership_type');
            $table->string('land_owner_middle_name')->nullable()->after('land_owner_first_name');
            $table->string('land_owner_surname')->nullable()->after('land_owner_middle_name');
            $table->string('land_owner_extension_name')->nullable()->after('land_owner_surname');
            
            // Drop new fields
            $table->dropColumn(['landowner_first_name', 'landowner_middle_name', 'landowner_surname', 'landowner_extension_name']);
        });
    }
};
