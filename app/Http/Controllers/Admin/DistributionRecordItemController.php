<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DistributionRecordItem;
use App\Models\DistributionRecord;
use App\Models\AllocationPolicy;
use App\Models\Farmer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DistributionRecordItemController extends Controller
{
    /**
     * Display all items for a specific distribution record.
     */
    public function index(DistributionRecord $distributionRecord): \Inertia\Response
    {
        $items = DistributionRecordItem::with(['allocationPolicy', 'acknowledgement', 'user', 'approver'])
            ->where('distribution_record_id', $distributionRecord->id)
            ->orderBy('farmer_lfid', 'asc')
            ->get();

        return Inertia::render('admin/distribution-records/items', [
            'distributionRecord' => $distributionRecord,
            'items' => $items,
            'allocationPolicies' => AllocationPolicy::orderBy('created_at', 'desc')->get(),
        ]);
    }

    /**
     * Store a new distribution record item.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'distribution_record_id' => 'required|exists:distribution_records,id',
            'farmer_lfid' => 'required|string|max:255',
            'quantity_allocated' => 'required|numeric|min:0',
            'allocation_policy_id' => 'nullable|exists:allocation_policies,id',
            'status' => 'required|in:pending,received',
        ]);

        // Add the authenticated user ID
        $validated['user_id'] = auth()->id();

        DistributionRecordItem::create($validated);

        // Update total quantity in parent distribution record
        $distributionRecord = DistributionRecord::find($validated['distribution_record_id']);
        if ($distributionRecord) {
            $totalQty = DistributionRecordItem::where('distribution_record_id', $distributionRecord->id)
                ->sum('quantity_allocated');
            $distributionRecord->update(['total_quantity' => $totalQty]);
        }

        return back()->with('success', 'Distribution item added successfully.');
    }

    /**
     * Update an existing distribution record item.
     */
    public function update(Request $request, DistributionRecordItem $distributionRecordItem): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'distribution_record_id' => 'required|exists:distribution_records,id',
            'farmer_lfid' => 'required|string|max:255',
            'quantity_allocated' => 'required|numeric|min:0',
            'allocation_policy_id' => 'nullable|exists:allocation_policies,id',
            'status' => 'required|in:pending,received',
        ]);

        $distributionRecordItem->update($validated);

        // Update total quantity in parent distribution record
        $distributionRecord = DistributionRecord::find($validated['distribution_record_id']);
        if ($distributionRecord) {
            $totalQty = DistributionRecordItem::where('distribution_record_id', $distributionRecord->id)
                ->sum('quantity_allocated');
            $distributionRecord->update(['total_quantity' => $totalQty]);
        }

        return back()->with('success', 'Distribution item updated successfully.');
    }

    /**
     * Delete a distribution record item.
     */
    public function destroy(DistributionRecordItem $distributionRecordItem): \Illuminate\Http\RedirectResponse
    {
        $distributionRecordId = $distributionRecordItem->distribution_record_id;
        $distributionRecordItem->delete();

        // Update total quantity in parent distribution record
        $distributionRecord = DistributionRecord::find($distributionRecordId);
        if ($distributionRecord) {
            $totalQty = DistributionRecordItem::where('distribution_record_id', $distributionRecordId)
                ->sum('quantity_allocated');
            $distributionRecord->update(['total_quantity' => $totalQty]);
        }

        return back()->with('success', 'Distribution item deleted successfully.');
    }

    /**
     * Export distribution items to CSV.
     */
    public function exportCsv(DistributionRecord $distributionRecord)
    {
        $items = DistributionRecordItem::with(['allocationPolicy', 'acknowledgement'])
            ->where('distribution_record_id', $distributionRecord->id)
            ->orderBy('farmer_lfid', 'asc')
            ->get();

        $filename = 'distribution_' . str_replace(' ', '_', $distributionRecord->distribution_name) . '_' . date('Y-m-d_His') . '.csv';

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $output = fopen('php://output', 'w');
        
        // CSV Header
        fputcsv($output, [
            'Farmer LFID',
            'Quantity Allocated',
            'Status',
            'Allocation Policy',
            'Acknowledged',
            'Received At',
            'Notes'
        ]);

        // CSV Data
        foreach ($items as $item) {
            fputcsv($output, [
                $item->farmer_lfid,
                $item->quantity_allocated,
                $item->status,
                $item->allocationPolicy?->name ?? '-',
                $item->acknowledgement ? 'Yes' : 'No',
                $item->acknowledgement?->received_at?->format('Y-m-d H:i') ?? '-',
                $item->acknowledgement?->notes ?? '-'
            ]);
        }

        fclose($output);
        exit;
    }
}
