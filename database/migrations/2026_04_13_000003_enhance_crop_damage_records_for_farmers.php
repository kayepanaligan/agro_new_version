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
        // Check if columns exist before adding them
        Schema::table('crop_damage_record_items', function (Blueprint $table) {
            if (!Schema::hasColumn('crop_damage_record_items', 'farmer_id')) {
                $table->foreignId('farmer_id')->nullable()->after('crop_damage_record_id')->constrained('farmers')->onDelete('set null');
            }
            if (!Schema::hasColumn('crop_damage_record_items', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable()->after('notes');
            }
            if (!Schema::hasColumn('crop_damage_record_items', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            }
            if (!Schema::hasColumn('crop_damage_record_items', 'temperature')) {
                $table->decimal('temperature', 5, 2)->nullable()->after('longitude');
            }
            if (!Schema::hasColumn('crop_damage_record_items', 'humidity')) {
                $table->decimal('humidity', 5, 2)->nullable()->after('temperature');
            }
            if (!Schema::hasColumn('crop_damage_record_items', 'weather_condition')) {
                $table->string('weather_condition')->nullable()->after('humidity');
            }
            if (!Schema::hasColumn('crop_damage_record_items', 'wind_speed')) {
                $table->decimal('wind_speed', 5, 2)->nullable()->after('weather_condition');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crop_damage_record_items', function (Blueprint $table) {
            $table->dropForeign(['farmer_id']);
            $table->dropColumn([
                'farmer_id',
                'latitude',
                'longitude',
                'temperature',
                'humidity',
                'weather_condition',
                'wind_speed'
            ]);
        });
    }
};
