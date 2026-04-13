<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: modify the policy_type ENUM to include 'custom'
        // MySQL requires re-declaring all enum values
        DB::statement("ALTER TABLE allocation_policies MODIFY COLUMN policy_type ENUM('equal','proportional','priority','weighted','hybrid','custom') DEFAULT 'equal'");

        Schema::table('allocation_policies', function (Blueprint $table) {
            // FK to formula_types — identifies which formula definition applies
            $table->unsignedBigInteger('formula_type_id')->nullable()->after('policy_type');
            $table->foreign('formula_type_id')->references('id')->on('formula_types')->nullOnDelete();

            // Flags a policy as using a custom formula (vs one of the 4 built-in algorithms)
            $table->boolean('is_custom')->default(false)->after('formula_type_id');

            // Stores per-policy factor overrides: [{ field, weight, label }]
            $table->json('config_json')->nullable()->after('is_custom');

            // Optional advanced expression override for this specific policy
            $table->text('formula_expression')->nullable()->after('config_json');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('allocation_policies', function (Blueprint $table) {
            $table->dropForeign(['formula_type_id']);
            $table->dropColumn(['formula_type_id', 'is_custom', 'config_json', 'formula_expression']);
        });

        DB::statement("ALTER TABLE allocation_policies MODIFY COLUMN policy_type ENUM('equal','proportional','priority','weighted','hybrid') DEFAULT 'equal'");
    }
};
