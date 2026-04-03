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
        Schema::create('acknowledgements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('distribution_record_item_id')->constrained('distribution_record_items')->onDelete('cascade'); // Reference to the item
            $table->string('farmer_lfid'); // Farmer LFID (for quick reference)
            $table->timestamp('received_at'); // When it was received
            $table->string('photo_proof')->nullable(); // Path to photo file proof
            $table->text('notes')->nullable(); // Notes/remarks about the receipt
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('acknowledgements');
    }
};
