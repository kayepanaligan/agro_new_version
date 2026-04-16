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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('task_type', [
                'monitor_crops',
                'verify_farmers',
                'distribute_allocation',
                'register_farmers',
                'crop_damage_assessment'
            ]);
            $table->json('target_barangay')->nullable();
            $table->date('due_date');
            $table->enum('status', [
                'pending',
                'assigned',
                'in_progress',
                'submitted',
                'verified',
                'rejected'
            ])->default('pending');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_to')->constrained('users')->onDelete('cascade');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->text('remarks')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index('status');
            $table->index('assigned_to');
            $table->index('assigned_by');
            $table->index('due_date');
            $table->index('task_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
