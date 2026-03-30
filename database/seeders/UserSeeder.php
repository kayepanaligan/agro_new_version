<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing users
        User::truncate();

        // Get roles
        $superAdminRole = Role::where('name', 'super admin')->first();
        $adminRole = Role::where('name', 'admin')->first();
        $technicianRole = Role::where('name', 'technician')->first();

        // Create Super Admin user
        User::create([
            'role_id' => $superAdminRole->id,
            'first_name' => 'John',
            'middle_name' => 'Michael',
            'last_name' => 'SuperAdmin',
            'gender' => 'male',
            'dob' => '1990-05-15',
            'email' => 'superadmin@agroprofiler.com',
            'contact_number' => '09123456789',
            'street' => '123 Main Street',
            'barangay' => 'Barangay Poblacion',
            'municipality' => 'Metro City',
            'province' => 'Metro Province',
            'postal_code' => '1000',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        // Create Admin user
        User::create([
            'role_id' => $adminRole->id,
            'first_name' => 'Jane',
            'middle_name' => 'Marie',
            'last_name' => 'Admin',
            'gender' => 'female',
            'dob' => '1992-08-20',
            'email' => 'admin@agroprofiler.com',
            'contact_number' => '09987654321',
            'street' => '456 Oak Avenue',
            'barangay' => 'Barangay San Jose',
            'municipality' => 'Green Valley',
            'province' => 'Highland Province',
            'postal_code' => '2000',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        // Create Technician user
        User::create([
            'role_id' => $technicianRole->id,
            'first_name' => 'Mark',
            'middle_name' => 'Anthony',
            'last_name' => 'Technician',
            'gender' => 'male',
            'dob' => '1995-12-10',
            'email' => 'technician@agroprofiler.com',
            'contact_number' => '09555123456',
            'street' => '789 Pine Road',
            'barangay' => 'Barangay Santa Cruz',
            'municipality' => 'Coastal Town',
            'province' => 'Seaside Province',
            'postal_code' => '3000',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
    }
}
