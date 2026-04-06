<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DistributionRecord;
use App\Models\AllocationType;
use App\Models\AllocationPolicy;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DistributionRecordController extends Controller
{
    /**
     * Display all distribution records (master list).
     */
    public function index(): \Inertia\Response
    {
        $distributionRecords = DistributionRecord::with([
            'allocationType', 
            'allocationPolicy',
            'items' => function($query) {
                $query->with(['user', 'approver']);
            }
        ])
            ->orderBy('release_date', 'desc')
            ->get();

        return Inertia::render('admin/distribution-records/index', [
            'distributionRecords' => $distributionRecords,
            'allocationTypes' => AllocationType::orderBy('name', 'asc')->get(),
            'allocationPolicies' => AllocationPolicy::orderBy('created_at', 'desc')->get(),
        ]);
    }

    /**
     * Store a new distribution record.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'distribution_name' => 'required|string|max:255',
            'allocation_type_id' => 'required|exists:allocation_types,id',
            'source_type' => 'required|in:dss_generated,manual',
            'total_quantity' => 'required|numeric|min:0',
            'release_date' => 'required|date',
            'note' => 'nullable|string',
            'allocation_policy_id' => 'nullable|exists:allocation_policies,id',
        ]);

        DistributionRecord::create($validated);

        return back()->with('success', 'Distribution record created successfully.');
    }

    /**
     * Update an existing distribution record.
     */
    public function update(Request $request, DistributionRecord $distributionRecord): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'distribution_name' => 'required|string|max:255',
            'allocation_type_id' => 'required|exists:allocation_types,id',
            'source_type' => 'required|in:dss_generated,manual',
            'total_quantity' => 'required|numeric|min:0',
            'release_date' => 'required|date',
            'note' => 'nullable|string',
            'allocation_policy_id' => 'nullable|exists:allocation_policies,id',
        ]);

        $distributionRecord->update($validated);

        return back()->with('success', 'Distribution record updated successfully.');
    }

    /**
     * Delete a distribution record.
     */
    public function destroy(DistributionRecord $distributionRecord): \Illuminate\Http\RedirectResponse
    {
        $distributionRecord->delete();

        return back()->with('success', 'Distribution record deleted successfully.');
    }
}
