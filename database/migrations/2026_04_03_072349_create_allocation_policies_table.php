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
        Schema::create('allocation_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('allocation_type_id')->constrained('allocation_types')->onDelete('cascade');
            $table->json('allocation_inputs')->nullable(); // JSON: {resource_type, total_quantity, unit}
            $table->json('eligible_rules')->nullable(); // JSON: Array of eligibility rule IDs
            $table->json('eligible_barangays')->nullable(); // JSON: Array of barangay IDs
            $table->enum('policy_type', ['equal', 'proportional', 'priority', 'weighted', 'hybrid'])->default('equal');
            $table->json('policy_config')->nullable(); // Additional policy configuration
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('allocation_policies');
    }
};
