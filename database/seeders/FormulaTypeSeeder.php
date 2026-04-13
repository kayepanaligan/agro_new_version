<?php

namespace Database\Seeders;

use App\Models\FormulaType;
use Illuminate\Database\Seeder;

class FormulaTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $formulas = [
            [
                'type' => 'equal',
                'name' => 'Equal Distribution',
                'is_default' => true,
                'base_algorithm' => 'equal',
                'expression_mode' => 'builder',
                'factors' => null,
                'short_description' => 'Every eligible farmer receives the same amount regardless of their eligibility score. Simple, transparent, and easy to implement — best used when fairness of quantity is the priority.',
                'formula_expression' => 'Allocation per Farmer = Total Available Quantity / Number of Eligible Farmers',
                'logic_notes' => [
                    'Ignore scores completely',
                    'Every eligible farmer gets the same amount',
                    'Remainder units (from flooring) are distributed starting from the top of the list',
                ],
                'example' => [
                    'given' => ['Total Quantity' => '100 bags', 'Number of Farmers' => 5],
                    'calculation' => '100 / 5 = 20 bags each',
                    'result' => 'Each farmer receives 20 bags',
                ],
                'use_case' => 'Fairness (simple, but not score-aware)',
                'edge_cases' => [
                    'If Number of Eligible Farmers = 0 → skip distribution (no allocation possible)',
                    'Remainder after floor division is distributed one unit at a time to the top-ranked farmers',
                ],
                'is_active' => true,
            ],
            [
                'type' => 'proportional',
                'name' => 'Proportional Distribution',
                'is_default' => true,
                'base_algorithm' => 'proportional',
                'expression_mode' => 'builder',
                'factors' => null,
                'short_description' => 'Allocation is proportional to each farmer\'s eligibility score relative to the total score of all eligible farmers. Farmers who scored higher receive more — rewarding those who meet more eligibility criteria.',
                'formula_expression' => 'Allocation_i = (Score_i / ΣScores) × Total Quantity',
                'logic_notes' => [
                    'Score_i = eligibility score of farmer i',
                    'ΣScores = total score of all eligible farmers',
                    'Higher score → more allocation',
                    'If ΣScores = 0, fall back to Equal Distribution',
                ],
                'example' => [
                    'given' => [
                        'Scores' => ['A = 10', 'B = 20', 'C = 30'],
                        'Total Score' => 60,
                        'Total Quantity' => '120 bags',
                    ],
                    'calculation' => [
                        'A = (10/60) × 120 = 20 bags',
                        'B = (20/60) × 120 = 40 bags',
                        'C = (30/60) × 120 = 60 bags',
                    ],
                    'result' => 'Allocation is proportional to each farmer\'s score',
                ],
                'use_case' => 'Fairness based on eligibility score',
                'edge_cases' => [
                    'If ΣScores = 0 → fall back to Equal Distribution to avoid division by zero',
                    'Use floor() for allocation amounts; distribute the remainder to highest-scored farmers first',
                    'Ensure minimum 1 unit per farmer if total quantity allows',
                ],
                'is_active' => true,
            ],
            [
                'type' => 'priority',
                'name' => 'Priority-Based Allocation',
                'is_default' => true,
                'base_algorithm' => 'priority',
                'expression_mode' => 'builder',
                'factors' => null,
                'short_description' => 'Farmers are sorted by eligibility score in descending order and served one by one until available resources are exhausted. This is a ranking + cutoff model — top farmers are guaranteed a full package while lower-ranked farmers may receive nothing.',
                'formula_expression' => 'Sort farmers by Score descending: Score_1 ≥ Score_2 ≥ ... then allocate full package per farmer until Total Quantity = 0',
                'logic_notes' => [
                    'Sort all eligible farmers by score from highest to lowest',
                    'Allocate a fixed package size to each farmer in order',
                    'Stop when total quantity reaches zero',
                    'Remaining farmers below the cutoff receive no allocation',
                    'Optional: Top-N variant — select only the top N farmers based on score',
                ],
                'example' => [
                    'given' => [
                        'Total Quantity' => '100 bags',
                        'Package per Farmer' => '20 bags',
                        'Sorted Farmers' => ['A', 'B', 'C', 'D', 'E'],
                    ],
                    'calculation' => ['A → 20', 'B → 20', 'C → 20', 'D → 20', 'E → 20'],
                    'note' => 'If only 60 bags available: A, B, C only — D and E receive nothing',
                ],
                'use_case' => 'Targeted support for highest-priority farmers',
                'edge_cases' => [
                    'Resources may not cover all farmers — lower-ranked farmers are excluded',
                    'Tie in scores → use secondary sort (e.g., LFID or registration date)',
                    'If total quantity is less than one package → no allocation is made',
                ],
                'is_active' => true,
            ],
            [
                'type' => 'weighted',
                'name' => 'Weighted / Hybrid Allocation',
                'is_default' => true,
                'base_algorithm' => 'weighted',
                'expression_mode' => 'builder',
                'factors' => null,
                'short_description' => 'The most powerful and realistic allocation model. Combines multiple scoring factors (eligibility score, damage severity, farm size, etc.) with configurable percentage weights to compute a weighted score per farmer, then distributes proportionally based on those weighted scores.',
                'formula_expression' => "Step 1 — Compute Weighted Score:\nWeightedScore_i = (S_i × w1) + (D_i × w2) + (F_i × w3)\n\nStep 2 — Allocate Proportionally:\nAllocation_i = (WeightedScore_i / Σ WeightedScores) × Total Quantity",
                'logic_notes' => [
                    'S_i = eligibility score of farmer i',
                    'D_i = damage score of farmer i',
                    'F_i = farm size or other configurable factor',
                    'w1, w2, w3 = weights (can sum to 1 or be free — your choice)',
                    'Higher weighted score → higher proportional allocation',
                    'If Σ WeightedScores = 0 → fall back to Equal Distribution',
                ],
                'example' => [
                    'weights' => ['Eligibility' => '50% (0.5)', 'Damage' => '30% (0.3)', 'Farm Size' => '20% (0.2)'],
                    'farmer_a' => ['Score' => 10, 'Damage' => 5, 'Farm' => 2],
                    'calculation' => 'WS_A = (10×0.5) + (5×0.3) + (2×0.2) = 5 + 1.5 + 0.4 = 6.9',
                    'result' => 'Then apply proportional allocation using weighted scores',
                ],
                'use_case' => 'Real-world Decision Support System (DSS) — best for complex multi-factor allocation',
                'edge_cases' => [
                    'If Σ WeightedScores = 0 → fall back to Equal Distribution to avoid division by zero',
                    'Weights should be validated (each w ≥ 0); warn if sum of weights deviates significantly from 1',
                    'Use floor() for allocation amounts; distribute the remainder to highest weighted-score farmers first',
                    'Minimum allocation: ensure at least 1 unit per farmer if total quantity allows',
                ],
                'is_active' => true,
            ],
        ];

        foreach ($formulas as $formula) {
            FormulaType::updateOrCreate(
                ['type' => $formula['type']],
                $formula
            );
        }
    }
}
