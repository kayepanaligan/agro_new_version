<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AllocationPolicy;
use App\Models\AllocationType;
use App\Models\EligibilityRule;
use App\Models\Barangay;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AllocationPolicyController extends Controller
{
    /**
     * Display allocation policies page.
     */
    public function index(): Response
    {
        $allocationPolicies = AllocationPolicy::with(['allocationType'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/allocation-policies', [
            'allocationPolicies' => $allocationPolicies,
        ]);
    }

    /**
     * Get form data for allocation policies.
     */
    public function getFormData(): Response
    {
        return Inertia::render('admin/allocation-policies', [
            'allocationTypes' => AllocationType::orderBy('name', 'asc')->get(),
            'eligibilityRules' => EligibilityRule::orderBy('created_at', 'desc')->get(),
            'barangays' => Barangay::where('is_active', true)->orderBy('name', 'asc')->get(),
        ]);
    }

    /**
     * Store a new allocation policy.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'allocation_type_id' => 'required|exists:allocation_types,id',
            'allocation_inputs' => 'nullable|array',
            'eligible_rules' => 'nullable|array',
            'eligible_barangays' => 'nullable|array',
            'policy_type' => 'required|in:equal,proportional,priority,weighted,hybrid',
            'policy_config' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        AllocationPolicy::create($validated);

        return back()->with('success', 'Allocation policy created successfully.');
    }

    /**
     * Update an existing allocation policy.
     */
    public function update(Request $request, AllocationPolicy $allocationPolicy): RedirectResponse
    {
        $validated = $request->validate([
            'allocation_type_id' => 'required|exists:allocation_types,id',
            'allocation_inputs' => 'nullable|array',
            'eligible_rules' => 'nullable|array',
            'eligible_barangays' => 'nullable|array',
            'policy_type' => 'required|in:equal,proportional,priority,weighted,hybrid',
            'policy_config' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $allocationPolicy->update($validated);

        return back()->with('success', 'Allocation policy updated successfully.');
    }

    /**
     * Delete an allocation policy.
     */
    public function destroy(AllocationPolicy $allocationPolicy): RedirectResponse
    {
        $allocationPolicy->delete();

        return back()->with('success', 'Allocation policy deleted successfully.');
    }
}
