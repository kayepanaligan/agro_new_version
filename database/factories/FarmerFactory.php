<?php

namespace Database\Factories;

use App\Models\Farmer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Farmer>
 */
class FarmerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstNames = ['Juan', 'Jose', 'Maria', 'Pedro', 'Rosa', 'Carlos', 'Ana', 'Miguel', 'Teresa', 'Antonio'];
        $lastNames = ['Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Lopez', 'Gonzales', 'Martinez', 'Perez', 'Rodriguez', 'Fernandez'];
        
        return [
            // Basic Info
            'rsbsa_number' => 'RSBSA-' . strtoupper(substr(uniqid(), 2, 4)) . '-' . rand(1000, 9999),
            'first_name' => $firstNames[array_rand($firstNames)],
            'last_name' => $lastNames[array_rand($lastNames)],
            'middle_name' => fake()->optional()->lastName(),
            'extension_name' => fake()->randomElement(['Jr.', 'Sr.', 'III', 'IV', null]),
            'sex' => fake()->randomElement(['Male', 'Female', 'Other']),
            'birthdate' => fake()->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d'),
            'picture_id' => fake()->optional()->imageUrl(200, 200, 'people'),
            
            // Enrollment
            'enrollment_type' => fake()->randomElement(['new', 'updating']),
            'enrollment_updated_at' => fake()->optional()->dateTimeBetween('-1 year', 'now'),
            
            // Contact
            'contact_number' => '09' . substr(fake()->phoneNumber(), 0, 9),
            'landline_number' => fake()->optional()->phoneNumber(),
            
            // Civil Status & Spouse
            'civil_status' => fake()->randomElement(['single', 'married', 'widowed', 'separated']),
            'spouse_first_name' => fake()->optional()->firstName(),
            'spouse_middle_name' => fake()->optional()->lastName(),
            'spouse_surname' => fake()->optional()->lastName(),
            
            // Address
            'house_lot_bldg_no_purok' => fake()->buildingNumber() . ' Purok ' . rand(1, 10),
            'street_sitio_subdv' => fake()->streetName(),
            'barangay' => fake()->randomElement(['Poblacion', 'San Isidro', 'Santa Cruz', 'San Jose', 'Rizal', 'Bonifacio', 'Aguinaldo']),
            'municipality_city' => fake()->city(),
            'province' => fake()->randomElement(['Cebu', 'Davao', 'Laguna', 'Batangas', 'Cavite', 'Bulacan']),
            'region' => 'Region ' . fake()->randomElement(['VII', 'XI', 'IV-A', 'CALABARZON', 'III', 'Central Luzon']),
            
            // Birthplace & Religion
            'place_of_birth_municipality' => fake()->city(),
            'place_of_birth_province' => fake()->state(),
            'place_of_birth_country' => 'Philippines',
            'religion' => fake()->randomElement(['christianity', 'islam', 'others']),
            
            // Household
            'is_household_head' => fake()->boolean(70),
            'household_head_first_name' => fake()->optional()->firstName(),
            'household_head_middle_name' => fake()->optional()->lastName(),
            'household_head_surname' => fake()->optional()->lastName(),
            'relationship_to_household_head' => fake()->randomElement(['Son', 'Daughter', 'Spouse', 'Parent', 'Self']),
            'no_living_household_members' => rand(1, 10),
            'no_male_household_members' => rand(0, 5),
            'no_female_household_members' => rand(0, 5),
            
            // Education
            'highest_formal_education' => fake()->randomElement(['elementary', 'high_school_non_k12', 'junior_hs_k12', 'senior_hs_k12', 'college', 'vocational', 'none']),
            
            // Special Fields
            'is_pwd' => fake()->boolean(10),
            'is_4ps_beneficiary' => fake()->boolean(30),
            'is_ip' => fake()->boolean(15),
            'ip_specify' => fake()->optional()->randomElement(['Tagalog', 'Cebuano', 'Ilocano', 'Hiligaynon', 'Waray']),
            
            // Government ID
            'government_id_type' => fake()->randomElement(['PhilSys', 'UMID', 'Drivers License', 'Passport', 'Voters ID', null]),
            'government_id_number' => strtoupper(fake()->bothify('??-########')),
            
            // Emergency Contact
            'emergency_contact_first_name' => fake()->firstName(),
            'emergency_contact_middle_name' => fake()->lastName(),
            'emergency_contact_last_name' => fake()->lastName(),
            'emergency_contact_number' => '09' . substr(fake()->phoneNumber(), 0, 9),
        ];
    }
}
