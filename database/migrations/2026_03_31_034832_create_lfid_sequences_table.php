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
        Schema::create('lfid_sequences', function (Blueprint $table) {
            $table->id();
            $table->year('year');
            $table->string('barangay_code', 10);
            $table->unsignedInteger('last_sequence')->default(0);
            $table->timestamps();

            $table->unique(['year', 'barangay_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lfid_sequences');
    }
};
