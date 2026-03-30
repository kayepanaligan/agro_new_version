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
        if (!Schema::hasColumn('farmers', 'enrollment_type')) {
            Schema::table('farmers', function (Blueprint $table) {
                // Enrollment information
                $table->enum('enrollment_type', ['new', 'updating'])->default('new')->after('id');
                $table->timestamp('enrollment_updated_at')->nullable()->after('enrollment_type');
                
                // Personal Information - Extension Name
                $table->string('extension_name')->nullable()->after('middle_name');
                
                // Address Fields
                $table->string('house_lot_bldg_no_purok')->nullable()->after('updated_at');
                $table->string('street_sitio_subdv')->nullable()->after('house_lot_bldg_no_purok');
                $table->string('barangay')->nullable()->after('street_sitio_subdv');
                $table->string('municipality_city')->nullable()->after('barangay');
                $table->string('province')->nullable()->after('municipality_city');
                $table->string('region')->nullable()->after('province');
                
                // Other Farmer Information
                $table->string('landline_number')->nullable()->after('contact_number');
                $table->string('place_of_birth_municipality')->nullable()->after('birthdate');
                $table->string('place_of_birth_province')->nullable()->after('place_of_birth_municipality');
                $table->string('place_of_birth_country')->default('Philippines')->after('place_of_birth_province');
                $table->enum('religion', ['christianity', 'islam', 'others'])->nullable()->after('place_of_birth_country');
                
                // Update civil_status
                $table->dropColumn('civil_status');
            });
            
            Schema::table('farmers', function (Blueprint $table) {
                $table->enum('civil_status', ['single', 'married', 'widowed', 'separated'])->nullable()->after('religion');
                
                // Spouse Information
                $table->string('spouse_first_name')->nullable()->after('civil_status');
                $table->string('spouse_middle_name')->nullable()->after('spouse_first_name');
                $table->string('spouse_surname')->nullable()->after('spouse_middle_name');
                $table->string('spouse_extension_name')->nullable()->after('spouse_surname');
                
                // Household Information
                $table->boolean('is_household_head')->nullable()->after('spouse_extension_name');
                $table->string('household_head_first_name')->nullable()->after('is_household_head');
                $table->string('household_head_middle_name')->nullable()->after('household_head_first_name');
                $table->string('household_head_surname')->nullable()->after('household_head_middle_name');
                $table->string('household_head_extension_name')->nullable()->after('household_head_surname');
                $table->string('relationship_to_household_head')->nullable()->after('household_head_extension_name');
                $table->integer('no_living_household_members')->nullable()->after('relationship_to_household_head');
                $table->integer('no_male_household_members')->nullable()->after('no_living_household_members');
                $table->integer('no_female_household_members')->nullable()->after('no_male_household_members');
                
                // Education
                $table->enum('highest_formal_education', [
                    'pre_school', 'elementary', 'high_school_non_k12', 
                    'junior_hs_k12', 'senior_hs_k12', 'college', 
                    'vocational', 'post_graduate', 'none'
                ])->nullable()->after('no_female_household_members');
                
                // Special Fields
                $table->boolean('is_pwd')->default(false)->after('highest_formal_education');
                $table->boolean('is_4ps_beneficiary')->default(false)->after('is_pwd');
                $table->boolean('is_ip')->default(false)->after('is_4ps_beneficiary');
                $table->string('ip_specify')->nullable()->after('is_ip');
                
                // Government ID
                $table->string('government_id_type')->nullable()->after('ip_specify');
                $table->string('government_id_number')->nullable()->after('government_id_type');
                
                // Emergency Contact
                $table->string('emergency_contact_first_name')->nullable()->after('government_id_number');
                $table->string('emergency_contact_middle_name')->nullable()->after('emergency_contact_first_name');
                $table->string('emergency_contact_last_name')->nullable()->after('emergency_contact_middle_name');
                $table->string('emergency_contact_extension_name')->nullable()->after('emergency_contact_last_name');
                $table->string('emergency_contact_number')->nullable()->after('emergency_contact_extension_name');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('farmers', 'enrollment_type')) {
            Schema::table('farmers', function (Blueprint $table) {
                // Remove all added columns
                $table->dropColumn([
                    'enrollment_type', 'enrollment_updated_at', 'extension_name',
                    'house_lot_bldg_no_purok', 'street_sitio_subdv', 'barangay',
                    'municipality_city', 'province', 'region', 'landline_number',
                    'place_of_birth_municipality', 'place_of_birth_province', 'place_of_birth_country',
                    'religion', 'civil_status', 'spouse_first_name', 'spouse_middle_name', 
                    'spouse_surname', 'spouse_extension_name', 'is_household_head', 
                    'household_head_first_name', 'household_head_middle_name', 
                    'household_head_surname', 'household_head_extension_name', 
                    'relationship_to_household_head', 'no_living_household_members', 
                    'no_male_household_members', 'no_female_household_members', 
                    'highest_formal_education', 'is_pwd', 'is_4ps_beneficiary', 
                    'is_ip', 'ip_specify', 'government_id_type', 'government_id_number',
                    'emergency_contact_first_name', 'emergency_contact_middle_name',
                    'emergency_contact_last_name', 'emergency_contact_extension_name',
                    'emergency_contact_number'
                ]);
                
                // Restore original civil_status
                $table->enum('civil_status', ['Single', 'Married', 'Widow'])->nullable()->after('contact_number');
            });
        }
    }
};
