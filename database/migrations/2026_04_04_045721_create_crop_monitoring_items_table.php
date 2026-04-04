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
        Schema::create('crop_monitoring_items', function (Blueprint $table) {
            $table->id('crop_monitoring_item_id');
            $table->foreignId('folder_id')->constrained('crop_monitoring_folders', 'crop_monitoring_folder_id')->onDelete('cascade');
            $table->string('item_name');
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('media_path')->nullable(); // photo/video
            $table->foreignId('updated_by')->constrained('users', 'id')->onDelete('cascade');
            $table->timestamp('observation_date')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crop_monitoring_items');
    }
};
