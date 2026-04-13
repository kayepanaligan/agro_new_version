<?php

namespace App\Services;

use App\Models\FormulaType;

/**
 * DSS Allocation Engine
 *
 * Pipeline:
 *  1. resolveMetrics()     — pull raw metric values per farmer
 *  2. computeScores()      — apply formula (builder weights or advanced expression)
 *  3. distribute()         — convert scores to allocation quantities
 *
 * Edge-case guarantees:
 *  - ∑scores = 0           → fallbackToEqual()
 *  - Division by zero      → caught and returns 0
 *  - Rounding              → floor() everywhere, remainder distributed top-down
 *  - Minimum allocation    → at least 1 unit if qty allows (priority mode only)
 */
class AllocationEngine
{
    public function __construct(
        private readonly SafeExpressionParser $parser = new SafeExpressionParser()
    ) {}

    // -----------------------------------------------------------------------
    // Main Entry Point
    // -----------------------------------------------------------------------

    /**
     * Run the full allocation pipeline.
     *
     * @param  FormulaType                    $formula      the formula definition to apply
     * @param  array<int, array<string,mixed>> $farmers     [farmer_id => [metric_key => value, ...]]
     * @param  float                          $totalQuantity total units to distribute
     * @param  float|null                     $packageSize  fixed package per farmer (priority mode only)
     * @return array<int, float>                            [farmer_id => allocated_quantity]
     */
    public function run(
        FormulaType $formula,
        array $farmers,
        float $totalQuantity,
        ?float $packageSize = null
    ): array {
        if (empty($farmers) || $totalQuantity <= 0) {
            return [];
        }

        // Step 1: resolve normalised metric values
        $metrics = $this->resolveMetrics($farmers);

        // Step 2: compute a score per farmer
        $scores = $this->computeScores($formula, $metrics);

        // Step 3: determine the base distribution algorithm
        $algorithm = $formula->base_algorithm ?? 'equal';

        // Step 4: distribute
        return $this->distribute($algorithm, $scores, $totalQuantity, $packageSize);
    }

    // -----------------------------------------------------------------------
    // Step 1 — Metric Resolution
    // -----------------------------------------------------------------------

    /**
     * Extract and normalise metric values from raw farmer data.
     * Any missing key defaults to 0.
     *
     * @param  array<int, array<string,mixed>> $farmers
     * @return array<int, array<string, float>>  [farmer_id => [metric => float]]
     */
    public function resolveMetrics(array $farmers): array
    {
        $resolved = [];
        foreach ($farmers as $farmerId => $data) {
            $resolved[$farmerId] = [
                'eligibility_score' => (float) ($data['eligibility_score'] ?? 0),
                'damage_score'      => (float) ($data['damage_score']      ?? 0),
                'farm_size'         => (float) ($data['farm_size']          ?? 0),
                'membership_score'  => (float) ($data['membership_score']  ?? 0),
                'years_farming'     => (float) ($data['years_farming']     ?? 0),
            ];
        }
        return $resolved;
    }

    // -----------------------------------------------------------------------
    // Step 2 — Score Computation
    // -----------------------------------------------------------------------

    /**
     * Compute a composite score for each farmer based on the formula definition.
     *
     * Builder mode: WeightedScore_i = ∑(factor.weight × metric_value)
     * Advanced mode: evaluate the expression string for each farmer
     *
     * @param  FormulaType                        $formula
     * @param  array<int, array<string, float>>   $metrics
     * @return array<int, float>                  [farmer_id => score]
     */
    public function computeScores(FormulaType $formula, array $metrics): array
    {
        $scores = [];

        if ($formula->expression_mode === 'advanced' && !empty($formula->formula_expression)) {
            // Advanced mode: parse and evaluate expression per farmer
            foreach ($metrics as $farmerId => $vars) {
                try {
                    $scores[$farmerId] = $this->parser->evaluate($formula->formula_expression, $vars);
                } catch (\RuntimeException) {
                    $scores[$farmerId] = 0.0;
                }
            }
        } else {
            // Builder mode: weighted sum of factors
            $factors = $formula->factors ?? [];

            foreach ($metrics as $farmerId => $vars) {
                $score = 0.0;
                foreach ($factors as $factor) {
                    $field  = $factor['field']  ?? '';
                    $weight = (float) ($factor['weight'] ?? 0);
                    $value  = $vars[$field] ?? 0.0;
                    $score += $value * $weight;
                }
                $scores[$farmerId] = $score;
            }
        }

        return $scores;
    }

    // -----------------------------------------------------------------------
    // Step 3 — Distribution
    // -----------------------------------------------------------------------

    /**
     * Convert farmer scores into allocation quantities.
     *
     * @param  string              $algorithm    'equal'|'proportional'|'priority'|'weighted'
     * @param  array<int, float>   $scores       [farmer_id => score]
     * @param  float               $totalQty
     * @param  float|null          $packageSize  only used by 'priority'
     * @return array<int, float>
     */
    public function distribute(
        string $algorithm,
        array $scores,
        float $totalQty,
        ?float $packageSize = null
    ): array {
        $n = count($scores);
        if ($n === 0 || $totalQty <= 0) {
            return [];
        }

        return match ($algorithm) {
            'equal'        => $this->equalDistribution(array_keys($scores), $totalQty),
            'proportional' => $this->proportionalDistribution($scores, $totalQty),
            'weighted'     => $this->proportionalDistribution($scores, $totalQty),  // same maths on weighted scores
            'priority'     => $this->priorityDistribution($scores, $totalQty, $packageSize ?? floor($totalQty / $n)),
            default        => $this->equalDistribution(array_keys($scores), $totalQty),
        };
    }

    // -----------------------------------------------------------------------
    // Distribution Algorithms
    // -----------------------------------------------------------------------

    /**
     * Equal Distribution
     * Every farmer gets the same amount; remainder is distributed top-down by 1 unit.
     *
     * @param  int[]   $farmerIds
     * @return array<int, float>
     */
    public function equalDistribution(array $farmerIds, float $totalQty): array
    {
        $n = count($farmerIds);
        if ($n === 0) return [];

        $base      = (int) floor($totalQty / $n);
        $remainder = (int) ($totalQty - $base * $n);

        $result = [];
        foreach ($farmerIds as $i => $id) {
            $result[$id] = (float) ($base + ($i < $remainder ? 1 : 0));
        }
        return $result;
    }

    /**
     * Proportional Distribution
     * Allocation_i = (score_i / ∑scores) × totalQty
     * Falls back to equal if ∑scores = 0.
     *
     * @param  array<int, float>  $scores
     * @return array<int, float>
     */
    public function proportionalDistribution(array $scores, float $totalQty): array
    {
        $totalScore = array_sum($scores);

        if ($totalScore <= 0) {
            return $this->fallbackToEqual($scores, $totalQty);
        }

        // Calculate raw allocations (floor)
        $result    = [];
        $allocated = 0;
        foreach ($scores as $id => $score) {
            $raw        = (int) floor(($score / $totalScore) * $totalQty);
            $result[$id] = (float) $raw;
            $allocated  += $raw;
        }

        // Distribute remainder to farmers with highest fractional part
        $remainder = (int) ($totalQty - $allocated);
        if ($remainder > 0) {
            $fractions = [];
            foreach ($scores as $id => $score) {
                $fractions[$id] = ($score / $totalScore) * $totalQty - floor(($score / $totalScore) * $totalQty);
            }
            arsort($fractions);
            $topIds = array_slice(array_keys($fractions), 0, $remainder);
            foreach ($topIds as $id) {
                $result[$id] += 1.0;
            }
        }

        return $result;
    }

    /**
     * Priority-Based Distribution
     * Sort farmers by score (desc), allocate packageSize each until totalQty exhausted.
     * Tie-break: order of appearance in $scores (by insertion / farmer_id).
     *
     * @param  array<int, float>  $scores
     * @return array<int, float>
     */
    public function priorityDistribution(array $scores, float $totalQty, float $packageSize): array
    {
        if ($packageSize <= 0) {
            return $this->fallbackToEqual($scores, $totalQty);
        }

        arsort($scores); // descending by score

        $result    = [];
        $remaining = $totalQty;

        foreach ($scores as $id => $score) {
            if ($remaining <= 0) {
                $result[$id] = 0.0;
                continue;
            }
            $give       = min($packageSize, $remaining);
            $result[$id] = $give;
            $remaining  -= $give;
        }

        return $result;
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Fallback used when ∑scores = 0 (cannot proportionally distribute).
     *
     * @param  array<int, float>  $scores  only keys are used
     * @return array<int, float>
     */
    public function fallbackToEqual(array $scores, float $totalQty): array
    {
        return $this->equalDistribution(array_keys($scores), $totalQty);
    }

    /**
     * Validate that a custom formula's expression is safe before saving.
     *
     * @return array{ valid: bool, errors: string[] }
     */
    public function validateExpression(string $expression): array
    {
        return $this->parser->validate($expression);
    }
}
