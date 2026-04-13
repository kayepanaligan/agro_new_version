<?php

namespace Database\Seeders;

use App\Models\Farmer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FarmerUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $farmerRole = Role::where('name', 'farmer')->first();

        if (!$farmerRole) {
            $this->command->error('Farmer role not found. Please run RoleSeeder first.');
            return;
        }

        // Get all farmers that don't have user accounts yet
        $farmers = Farmer::whereNull('lfid')->get();

        if ($farmers->isEmpty()) {
            // If all farmers have LFIDs, create users for them
            $farmers = Farmer::all();
        }

        foreach ($farmers as $index => $farmer) {
            // Skip if user already exists with this LFID
            if ($farmer->lfid && User::where('lfid', $farmer->lfid)->exists()) {
                continue;
            }

            // Create user account for farmer
            User::firstOrCreate(
                ['lfid' => $farmer->lfid],
                [
                    'role_id' => $farmerRole->id,
                    'first_name' => $farmer->first_name ?? 'Farmer',
                    'last_name' => $farmer->last_name ?? $farmer->lfid ?? 'Unknown',
                    'email' => $farmer->lfid . '@farmer.local', // Placeholder email
                    'gender' => 'male', // Default gender
                    'dob' => '1990-01-01', // Default DOB
                    'contact_number' => '09' . str_pad($farmer->id, 9, '0', STR_PAD_LEFT), // Unique contact based on farmer ID
                    'street' => 'N/A',
                    'barangay' => 'N/A',
                    'municipality' => 'N/A',
                    'province' => 'N/A',
                    'postal_code' => '0000',
                    'password' => Hash::make('farmer123'), // Default password
                    'email_verified_at' => now(),
                ]
            );

            $this->command->info("Created user account for farmer: {$farmer->lfid}");
        }

        $this->command->info('Farmer user seeding completed!');
        $this->command->warn('Default password for all farmers: farmer123');
    }
}
