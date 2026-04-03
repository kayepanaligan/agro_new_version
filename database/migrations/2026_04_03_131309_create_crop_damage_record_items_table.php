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
        Schema::create('crop_damage_record_items', function (Blueprint $table) {
            $table->id('crop_damage_record_item_id');
            $table->foreignId('crop_damage_record_id')->constrained('crop_damage_records', 'crop_damage_record_id')->onDelete('cascade');
            $table->string('photo_path')->nullable();
            $table->foreignId('farm_id')->constrained('farms')->onDelete('cascade');
            $table->string('commodity_name');
            $table->string('variety_name');
            $table->foreignId('damage_type_id')->constrained('damage_types', 'damage_type_id')->onDelete('cascade');
            $table->enum('damage_severity', ['low', 'medium', 'high']);
            $table->enum('status', ['pending', 'verified', 'closed']);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crop_damage_record_items');
    }
};
