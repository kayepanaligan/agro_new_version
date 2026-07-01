<?php

namespace Database\Seeders;

use App\Models\TierConfig;
use Illuminate\Database\Seeder;

class TierConfigsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiers = [
            [
                'tier_name' => 'Seedling',
                'min_points' => 0,
                'max_points' => 199,
                'benefits' => json_encode(['Participation Phase', 'Basic App Access']),
                'color' => 'green',
                'sort_order' => 1,
            ],
            [
                'tier_name' => 'Bronze',
                'min_points' => 200,
                'max_points' => 499,
                'benefits' => json_encode(['Priority Eligibility', 'Basic Training Access']),
                'color' => 'amber',
                'sort_order' => 2,
            ],
            [
                'tier_name' => 'Silver',
                'min_points' => 500,
                'max_points' => 999,
                'benefits' => json_encode(['Voucher Eligibility', 'Priority Training', 'Early Access to Programs']),
                'color' => 'sky',
                'sort_order' => 3,
            ],
            [
                'tier_name' => 'Gold',
                'min_points' => 1000,
                'max_points' => null,
                'benefits' => json_encode(['Voucher + Priority Allocation', 'Exclusive Programs', 'Premium Support']),
                'color' => 'gold',
                'sort_order' => 4,
            ],
        ];

        foreach ($tiers as $tier) {
            TierConfig::create($tier);
        }
    }
}
