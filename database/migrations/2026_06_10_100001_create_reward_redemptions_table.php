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
        Schema::create('reward_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained()->onDelete('cascade');
            $table->string('reward_type'); // voucher, priority_allocation
            $table->string('reward_name'); // e.g., "Agricultural Input Voucher"
            $table->integer('points_cost');
            $table->string('status')->default('pending'); // pending, approved, rejected, completed
            $table->text('notes')->nullable();
            $table->string('voucher_code')->nullable();
            $table->date('valid_until')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->string('approved_by')->nullable();
            $table->timestamps();
            
            $table->index('farmer_id');
            $table->index('status');
            $table->index('reward_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reward_redemptions');
    }
};
