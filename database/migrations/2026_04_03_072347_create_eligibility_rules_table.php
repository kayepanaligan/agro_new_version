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
        Schema::create('eligibility_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('allocation_type_id')->constrained('allocation_types')->onDelete('cascade');
            $table->string('field_name'); // farmer attribute field name
            $table->string('operator'); // e.g., '=', '>', '<', '>=', '<=', 'in', 'not in'
            $table->string('value'); // required value
            $table->integer('score')->default(1)->comment('Weight/score for DSS ranking');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eligibility_rules');
    }
};
