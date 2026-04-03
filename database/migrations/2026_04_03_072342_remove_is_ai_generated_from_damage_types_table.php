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
        Schema::table('damage_types', function (Blueprint $table) {
            $table->dropColumn('is_ai_generated');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('damage_types', function (Blueprint $table) {
            $table->boolean('is_ai_generated')->default(false)->after('image_path');
        });
    }
};
