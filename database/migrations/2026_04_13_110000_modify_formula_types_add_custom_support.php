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
        Schema::table('formula_types', function (Blueprint $table) {
            // Drop the ENUM constraint by changing type to VARCHAR(100)
            $table->string('type', 100)->change();

            // Mark the 4 seeded formulas as non-deletable defaults
            $table->boolean('is_default')->default(false)->after('type');

            // For custom formulas: which base distribution algorithm applies after scoring
            $table->enum('base_algorithm', ['equal', 'proportional', 'priority', 'weighted'])
                  ->nullable()
                  ->after('is_default');

            // Factor configuration: [{ field, weight, label }]
            $table->json('factors')->nullable()->after('base_algorithm');

            // How the formula is defined: visual builder or advanced expression
            $table->enum('expression_mode', ['builder', 'advanced'])
                  ->default('builder')
                  ->after('factors');
        });

        // Mark the 4 default formula types and set their base_algorithm
        DB::table('formula_types')->whereIn('type', ['equal', 'proportional', 'priority', 'weighted'])
            ->update(['is_default' => true]);

        DB::table('formula_types')->where('type', 'equal')
            ->update(['base_algorithm' => 'equal']);
        DB::table('formula_types')->where('type', 'proportional')
            ->update(['base_algorithm' => 'proportional']);
        DB::table('formula_types')->where('type', 'priority')
            ->update(['base_algorithm' => 'priority']);
        DB::table('formula_types')->where('type', 'weighted')
            ->update(['base_algorithm' => 'weighted']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('formula_types', function (Blueprint $table) {
            $table->dropColumn(['is_default', 'base_algorithm', 'factors', 'expression_mode']);
            // Restore ENUM — only safe if no custom rows exist
            $table->enum('type', ['equal', 'proportional', 'priority', 'weighted'])
                  ->change();
        });
    }
};
