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
        Schema::create('crop_monitoring_folders', function (Blueprint $table) {
            $table->id('crop_monitoring_folder_id');
            $table->string('folder_name');
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained('crop_monitoring_categories', 'crop_monitoring_category_id')->onDelete('cascade');
            $table->foreignId('commodity_id')->constrained('commodities')->onDelete('cascade');
            $table->foreignId('variety_id')->constrained('varieties')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crop_monitoring_folders');
    }
};
