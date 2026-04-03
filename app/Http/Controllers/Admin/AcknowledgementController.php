<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Acknowledgement;
use App\Models\DistributionRecordItem;
use Illuminate\Http\Request;

class AcknowledgementController extends Controller
{
    /**
     * Store a new acknowledgement.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'distribution_record_item_id' => 'required|exists:distribution_record_items,id',
            'farmer_lfid' => 'required|string|max:255',
            'received_at' => 'required|date',
            'photo_proof' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        // Check if acknowledgement already exists
        $existing = Acknowledgement::where('distribution_record_item_id', $validated['distribution_record_item_id'])->first();
        if ($existing) {
            return back()->with('error', 'Acknowledgement already exists for this item.');
        }

        Acknowledgement::create($validated);

        // Update item status to received
        $item = DistributionRecordItem::find($validated['distribution_record_item_id']);
        if ($item) {
            $item->update(['status' => 'received']);
        }

        return back()->with('success', 'Acknowledgement created successfully.');
    }

    /**
     * Update an existing acknowledgement.
     */
    public function update(Request $request, Acknowledgement $acknowledgement): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'distribution_record_item_id' => 'required|exists:distribution_record_items,id',
            'farmer_lfid' => 'required|string|max:255',
            'received_at' => 'required|date',
            'photo_proof' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $acknowledgement->update($validated);

        return back()->with('success', 'Acknowledgement updated successfully.');
    }

    /**
     * Delete an acknowledgement.
     */
    public function destroy(Acknowledgement $acknowledgement): \Illuminate\Http\RedirectResponse
    {
        $distributionRecordItemId = $acknowledgement->distribution_record_item_id;
        
        $acknowledgement->delete();

        // Update item status back to pending
        $item = DistributionRecordItem::find($distributionRecordItemId);
        if ($item) {
            $item->update(['status' => 'pending']);
        }

        return back()->with('success', 'Acknowledgement deleted successfully.');
    }
}
