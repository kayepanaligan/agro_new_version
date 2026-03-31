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
        Schema::table('farmers', function (Blueprint $table) {
            $table->string('lfid')->unique()->nullable()->after('id');
            $table->enum('registration_status', [
                'not_registered',
                'for_submission',
                'submitted_to_da',
                'verified',
                'rejected'
            ])->default('not_registered')->after('lfid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('farmers', function (Blueprint $table) {
            $table->dropColumn(['lfid', 'registration_status']);
        });
    }
};
