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
        Schema::create('point_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Daily Login", "Form Submission"
            $table->string('trigger_action'); // e.g., "login", "form_submit", "photo_upload"
            $table->integer('points_awarded'); // points given per trigger
            $table->integer('max_earnable')->nullable(); // null = unlimited
            $table->text('description')->nullable(); // shown to farmers
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('trigger_action');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('point_rules');
    }
};
