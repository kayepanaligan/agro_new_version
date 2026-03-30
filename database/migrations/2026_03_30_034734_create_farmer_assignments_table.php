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
        Schema::create('farmer_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_parcel_id')->constrained()->onDelete('cascade');
            $table->foreignId('farmer_id')->constrained()->onDelete('cascade');
            
            // Assignment Period
            $table->date('start_date');
            $table->date('end_date')->nullable();
            
            // Assignment Type
            $table->string('assignment_type')->default('cultivation'); // cultivation, lease, etc.
            
            // Status (active, completed, terminated)
            $table->enum('status', ['active', 'completed', 'terminated'])->default('active');
            
            // Remarks
            $table->text('remarks')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('farmer_assignments');
    }
};
