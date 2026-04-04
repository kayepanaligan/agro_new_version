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
        Schema::create('crop_monitoring_updaters', function (Blueprint $table) {
            $table->id('updater_id');
            $table->foreignId('folder_id')->constrained('crop_monitoring_folders', 'crop_monitoring_folder_id')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('updated_at')->useCurrent();
            $table->unique(['folder_id', 'user_id', 'updated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crop_monitoring_updaters');
    }
};
