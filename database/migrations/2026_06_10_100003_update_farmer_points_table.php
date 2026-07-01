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
        Schema::table('farmer_points', function (Blueprint $table) {
            $table->foreignId('point_rule_id')->nullable()->constrained()->onDelete('set null');
            $table->string('awarded_by')->nullable(); // admin user who manually awarded
            $table->text('admin_notes')->nullable();
            $table->boolean('is_manual')->default(false);
            
            $table->index('point_rule_id');
            $table->index('is_manual');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('farmer_points', function (Blueprint $table) {
            $table->dropForeign(['point_rule_id']);
            $table->dropIndex(['point_rule_id']);
            $table->dropIndex(['is_manual']);
            $table->dropColumn(['point_rule_id', 'awarded_by', 'admin_notes', 'is_manual']);
        });
    }
};
