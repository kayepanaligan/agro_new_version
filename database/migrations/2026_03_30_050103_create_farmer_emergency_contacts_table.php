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
        Schema::create('farmer_emergency_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained()->onDelete('cascade');
            $table->string('emergency_contact_first_name');
            $table->string('emergency_contact_middle_name')->nullable();
            $table->string('emergency_contact_last_name');
            $table->string('emergency_contact_extension_name')->nullable();
            $table->string('contact_number');
            $table->string('email')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('farmer_emergency_contacts');
    }
};
