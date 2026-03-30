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
        Schema::create('farm_parcels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->onDelete('cascade');
            
            // Farm Parcel Number
            $table->string('parcel_number')->nullable();
            
            // Farm Location
            $table->string('barangay')->nullable();
            $table->string('city_municipality')->nullable();
            
            // Total Farm Area
            $table->decimal('total_farm_area', 10, 4)->default(0);
            
            // Within Ancestral Domain
            $table->boolean('within_ancestral_domain')->default(false);
            
            // Ownership Document Information
            $table->string('ownership_document_type')->nullable(); // certificate of land transfer, emancipation patent, etc.
            $table->string('ownership_document_number')->nullable();
            $table->string('ownership_document_file_path')->nullable(); // for scanned document upload
            
            // Agrarian Reform Beneficiary
            $table->boolean('is_agrarian_reform_beneficiary')->default(false);
            
            // Ownership Type
            $table->enum('ownership_type', ['registered_owner', 'tenant', 'lessee'])->default('registered_owner');
            $table->string('land_owner_first_name')->nullable(); // if tenant or lessee
            $table->string('land_owner_middle_name')->nullable();
            $table->string('land_owner_surname')->nullable();
            $table->string('land_owner_extension_name')->nullable();
            
            // Crop Information
            $table->foreignId('commodity_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('variety_id')->nullable()->constrained()->onDelete('set null');
            
            // Size of Farm Parcel
            $table->decimal('parcel_size', 10, 4)->default(0);
            
            // Livestock/Poultry (if applicable)
            $table->integer('livestock_heads')->nullable();
            $table->string('livestock_type')->nullable(); // poultry, cattle, etc.
            
            // Farm Type
            $table->enum('farm_type', ['irrigated', 'rainfed_upland', 'rainfed_lowland', 'not_applicable'])->default('not_applicable');
            
            // Organic Practitioner
            $table->boolean('is_organic_practitioner')->default(false);
            
            // Remarks
            $table->text('remarks')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('farm_parcels');
    }
};
