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
        Schema::create('farmer_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained()->onDelete('cascade');
            $table->string('activity_name');
            $table->text('description')->nullable();
            $table->string('category'); // farming, reporting, learning, community
            $table->integer('points'); // positive for earned, negative for deducted
            $table->string('status')->default('pending'); // pending, verified, rejected
            $table->string('icon')->nullable();
            $table->json('metadata')->nullable(); // additional data
            $table->timestamp('verified_at')->nullable();
            $table->string('verified_by')->nullable();
            $table->timestamps();
            
            $table->index('farmer_id');
            $table->index('category');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('farmer_points');
    }
};
