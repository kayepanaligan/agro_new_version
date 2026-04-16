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
        Schema::create('technician_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technician_id')->constrained('users')->onDelete('cascade');
            $table->enum('report_type', [
                'farmer_registration',
                'farm_creation',
                'crop_monitoring',
                'crop_damage',
                'distribution_record'
            ]);
            $table->string('reference_model_type');
            $table->unsignedBigInteger('reference_model_id');
            $table->enum('status', [
                'pending',
                'submitted',
                'verified',
                'rejected'
            ])->default('pending');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_remarks')->nullable();
            $table->json('evidence_data')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index('technician_id');
            $table->index('status');
            $table->index('report_type');
            $table->index(['reference_model_type', 'reference_model_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('technician_reports');
    }
};
