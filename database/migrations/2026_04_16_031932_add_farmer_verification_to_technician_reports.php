<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE technician_reports MODIFY COLUMN report_type ENUM('farmer_registration', 'farm_creation', 'crop_monitoring', 'crop_damage', 'distribution_record', 'farmer_verification')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE technician_reports MODIFY COLUMN report_type ENUM('farmer_registration', 'farm_creation', 'crop_monitoring', 'crop_damage', 'distribution_record')");
    }
};
