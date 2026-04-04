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
        Schema::table('crop_monitoring_items', function (Blueprint $table) {
            $table->decimal('temperature', 5, 2)->nullable()->after('longitude')->comment('Temperature in Celsius');
            $table->string('weather_condition')->nullable()->after('temperature')->comment('e.g., Sunny, Rainy, Cloudy');
            $table->integer('humidity')->nullable()->after('weather_condition')->comment('Humidity percentage');
            $table->decimal('wind_speed', 5, 2)->nullable()->after('humidity')->comment('Wind speed in km/h');
            $table->text('weather_notes')->nullable()->after('wind_speed')->comment('Additional weather observations');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crop_monitoring_items', function (Blueprint $table) {
            $table->dropColumn(['temperature', 'weather_condition', 'humidity', 'wind_speed', 'weather_notes']);
        });
    }
};
