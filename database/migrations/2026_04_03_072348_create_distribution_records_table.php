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
        Schema::create('distribution_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('allocation_type_id')->constrained('allocation_types')->onDelete('cascade');
            $table->string('farmer_lfid'); // Farmer LFID
            $table->string('items_assigned')->nullable(); // Description of items
            $table->decimal('quantity', 10, 2)->default(0);
            $table->enum('status', ['pending', 'distributed', 'cancelled'])->default('pending');
            $table->date('distribution_date')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('distribution_records');
    }
};
