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
        Schema::table('users', function (Blueprint $table) {
            // Registration status: pending, approved, rejected
            $table->enum('registration_status', ['pending', 'approved', 'rejected'])->default('pending')->after('email_verified_at');
            
            // Active session status: active, inactive
            $table->boolean('is_active_session')->default(false)->after('registration_status');
            
            // Last activity timestamp
            $table->timestamp('last_activity_at')->nullable()->after('is_active_session');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['registration_status', 'is_active_session', 'last_activity_at']);
        });
    }
};
