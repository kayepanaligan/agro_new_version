<?php

namespace App\Services;

use App\Models\LfidSequence;
use App\Models\FarmerAddress;
use Illuminate\Support\Facades\DB;

class LfidGenerator
{
    /**
     * Generate a unique Local Farmer ID (LFID)
     * Format: DCAG-YY-BRGY-XXXX
     * - DCAG: Digos City Agriculturist
     * - YY: Year (e.g., 26 for 2026)
     * - BRGY: Barangay code (short, controlled)
     * - XXXX: Zero-padded sequence number
     *
     * @param int $farmerId
     * @return string|null
     */
    public function generate(int $farmerId): ?string
    {
        // Get farmer's barangay from address
        $address = FarmerAddress::where('farmer_id', $farmerId)->first();
        
        if (!$address || !$address->barangay) {
            \Log::warning("LFID generation failed: No address or barangay for farmer #{$farmerId}");
            return null;
        }

        // Extract year (last 2 digits)
        $year = date('y');
        $fullYear = 2000 + $year;
        
        // Generate barangay code
        $barangayCode = strtoupper($this->generateBarangayCode($address->barangay));
        
        // Generate LFID within a database transaction to ensure thread safety
        return DB::transaction(function () use ($farmerId, $year, $fullYear, $barangayCode, $address) {
            // Get or create sequence for this year and barangay
            $sequence = LfidSequence::firstOrCreate(
                [
                    'year' => $fullYear,
                    'barangay_code' => $barangayCode,
                ],
                ['last_sequence' => 0]
            );

            // Lock the row for update and increment sequence
            $lockedSequence = LfidSequence::where('id', $sequence->id)
                ->lockForUpdate()
                ->first();
            
            // Increment the sequence
            $lockedSequence->increment('last_sequence');
            
            // Refresh to get the updated value
            $lockedSequence->refresh();
            
            // Format sequence number with zero padding (4 digits)
            $sequenceNumber = str_pad($lockedSequence->last_sequence, 4, '0', STR_PAD_LEFT);
            
            // Generate LFID
            $lfid = sprintf('DCAG-%s-%s-%s', $year, $barangayCode, $sequenceNumber);
            
            \Log::info("LFID generated for farmer #{$farmerId}: {$lfid} (Barangay: {$address->barangay}, Code: {$barangayCode})");
            
            return $lfid;
        });
    }

    /**
     * Generate a short code from barangay name
     * Examples:
     * - Aplaya -> APL
     * - Zone 1 -> ZN1
     * - San Isidro -> SNI
     * - Poblacion -> POB
     *
     * @param string $barangayName
     * @return string
     */
    private function generateBarangayCode(string $barangayName): string
    {
        $barangayName = trim($barangayName);
        
        // Common barangay code mappings
        $mappings = [
            'aplaya' => 'APL',
            'zone 1' => 'ZN1',
            'zone 2' => 'ZN2',
            'zone 3' => 'ZN3',
            'zone 4' => 'ZN4',
            'zone 5' => 'ZN5',
            'zone 6' => 'ZN6',
            'poblacion' => 'POB',
            'san isidro' => 'SNI',
            'santa cruz' => 'STC',
            'san jose' => 'SNJ',
            'rizal' => 'RIZ',
            'bonifacio' => 'BON',
            'aguinaldo' => 'AGU',
        ];

        $lowerBarangay = strtolower($barangayName);
        
        // Check if we have a predefined mapping
        if (isset($mappings[$lowerBarangay])) {
            return $mappings[$lowerBarangay];
        }

        // Generate code from first letters if no mapping exists
        // Take first letter of each word, max 3 characters
        $words = preg_split('/\s+/', $barangayName);
        $code = '';
        
        foreach ($words as $word) {
            if (strlen($code) < 3) {
                $code .= strtoupper(substr($word, 0, 1));
            }
        }

        // If code is less than 3 characters, use first 3 letters of barangay name
        if (strlen($code) < 3) {
            $code = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $barangayName), 0, 3));
        }

        return substr($code, 0, 3);
    }

    /**
     * Regenerate LFID for existing farmers (useful for migration)
     *
     * @param int $farmerId
     * @return string|null
     */
    public function regenerateForFarmer(int $farmerId): ?string
    {
        return $this->generate($farmerId);
    }
}
