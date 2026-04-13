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
        Schema::table('farm_parcels', function (Blueprint $table) {
            $table->string('qr_code')->nullable()->after('fpid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('farm_parcels', function (Blueprint $table) {
            $table->dropColumn('qr_code');
        });
    }
};
