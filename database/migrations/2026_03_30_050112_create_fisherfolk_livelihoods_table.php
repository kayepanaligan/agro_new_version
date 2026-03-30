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
        Schema::create('fisherfolk_livelihoods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained()->onDelete('cascade');
            $table->enum('fishing_activity', [
                'fish_capture', 
                'aquaculture', 
                'gleaning', 
                'fish_processing', 
                'fish_vending', 
                'others'
            ]);
            $table->string('fishing_specify')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fisherfolk_livelihoods');
    }
};
