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
        Schema::create('distribution_record_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('distribution_record_id')->constrained('distribution_records')->onDelete('cascade'); // Reference to master distribution
            $table->string('farmer_lfid'); // Farmer LFID who received items
            $table->decimal('quantity_allocated', 12, 2)->default(0); // Amount farmer received
            $table->foreignId('allocation_policy_id')->nullable()->constrained('allocation_policies')->onDelete('set null'); // If DSS generated, what policy was applied
            $table->enum('status', ['pending', 'received'])->default('pending'); // Status of this item
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('distribution_record_items');
    }
};
