<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            CategorySeeder::class,
            CommoditySeeder::class,
            VarietySeeder::class,
            ProgramSeeder::class,
            UnitOfMeasureSeeder::class,
            OrganizationSeeder::class,
            FarmerSeeder::class,
            FarmAndParcelSeeder::class,
            DamageCategorySeeder::class,
            DamageTypeSeeder::class,
            AllocationTypeSeeder::class,
            EligibilityRuleSeeder::class,
            AllocationPolicySeeder::class,
            DistributionRecordSeeder::class,
            DistributionRecordItemSeeder::class,
            AcknowledgementSeeder::class,
            CropDamageRecordSeeder::class,
            FakeDistributionDataSeeder::class,
            CropMonitoringCategorySeeder::class,
            CropMonitoringFolderSeeder::class,
            FakeCropMonitoringDataSeeder::class,
        ]);

        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
