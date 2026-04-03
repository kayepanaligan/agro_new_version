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
        Schema::dropIfExists('distribution_records');
        
        Schema::create('distribution_records', function (Blueprint $table) {
            $table->id();
            $table->string('distribution_name'); // Name/title of the distribution
            $table->foreignId('allocation_type_id')->constrained('allocation_types')->onDelete('cascade');
            $table->enum('source_type', ['dss_generated', 'manual'])->default('manual'); // DSS generated or manual list
            $table->decimal('total_quantity', 12, 2)->default(0); // Total amount released
            $table->date('release_date'); // When the list was released
            $table->text('note')->nullable(); // General notes about this distribution
            $table->foreignId('allocation_policy_id')->nullable()->constrained('allocation_policies')->onDelete('set null'); // If DSS generated, which policy was used
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
