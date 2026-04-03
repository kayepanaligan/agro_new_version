<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Acknowledgement;
use App\Models\DistributionRecordItem;

class AcknowledgementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all received items that don't have acknowledgements yet
        $receivedItems = DistributionRecordItem::where('status', 'received')
            ->whereDoesntHave('acknowledgement')
            ->get();

        if ($receivedItems->count() === 0) {
            $this->command->warn('No received items without acknowledgements found.');
            return;
        }

        $acknowledgements = [];

        foreach ($receivedItems as $item) {
            // Generate random received date (1-7 days after item creation)
            $receivedDate = $item->created_at->copy()->addDays(rand(1, 7));

            // Random notes for variety
            $notesOptions = [
                null,
                'Received in good condition. Thank you!',
                'Farmer confirmed receipt via phone call.',
                'Picked up at barangay hall distribution center.',
                'Delivered to farm site. Farmer very satisfied.',
                'Received with minor packaging damage but contents OK.',
                'Early morning delivery. Farmer present.',
                null, // Some without notes
                'Verified by barangay official.',
            ];

            $notes = $notesOptions[array_rand($notesOptions)];

            // 30% chance of having photo proof (simulated path)
            $hasPhoto = rand(0, 100) < 30;
            $photoProof = null;
            if ($hasPhoto) {
                $photoProof = 'acknowledgements/' . $item->farmer_lfid . '_' . time() . '.jpg';
            }

            $acknowledgements[] = [
                'distribution_record_item_id' => $item->id,
                'farmer_lfid' => $item->farmer_lfid,
                'received_at' => $receivedDate,
                'photo_proof' => $photoProof,
                'notes' => $notes,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert all acknowledgements
        Acknowledgement::insert($acknowledgements);

        $this->command->info('Acknowledgements seeded successfully!');
        $this->command->info('Created ' . count($acknowledgements) . ' acknowledgement records');
    }
}
