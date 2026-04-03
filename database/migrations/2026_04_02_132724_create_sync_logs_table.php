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
        Schema::create('sync_logs', function (Blueprint $table) {
            $table->id();
            $table->string('operation_id')->unique(); // For idempotency
            $table->string('entity_type'); // farmer, farm, etc.
            $table->string('action_type'); // create, update, delete
            $table->json('payload'); // The data that was synced
            $table->timestamp('timestamp')->nullable(); // Original client timestamp
            $table->timestamp('synced_at')->useCurrent()->nullable(); // When it was synced to server
            $table->timestamps();
            
            $table->index(['entity_type', 'action_type']);
            $table->index('synced_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_logs');
    }
};
