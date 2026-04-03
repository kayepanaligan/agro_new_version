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
        Schema::table('programs', function (Blueprint $table) {
            $table->date('start_date')->nullable()->after('program_description');
            $table->date('end_date')->nullable()->after('start_date');
            $table->foreignId('funding_source_id')->nullable()->after('end_date')->constrained('funding_sources')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropForeign(['funding_source_id']);
            $table->dropColumn(['start_date', 'end_date', 'funding_source_id']);
        });
    }
};
