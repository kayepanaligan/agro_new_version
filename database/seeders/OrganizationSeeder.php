<?php

namespace Database\Seeders;

use App\Models\Organization;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $organizations = [
            ['name' => 'Green Valley Farmers Cooperative', 'type' => 'coop'],
            ['name' => 'Sunny Ridge Agricultural Association', 'type' => 'association'],
            ['name' => 'Metro Vegetable Growers Cooperative', 'type' => 'coop'],
            ['name' => 'Highland Crop Producers Association', 'type' => 'association'],
            ['name' => 'Coastal Fisherfolk Cooperative', 'type' => 'coop'],
        ];

        foreach ($organizations as $org) {
            Organization::create($org);
        }
    }
}
