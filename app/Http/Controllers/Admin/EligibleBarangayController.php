<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EligibleBarangay;
use App\Models\AllocationType;
use App\Models\Barangay;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EligibleBarangayController extends Controller
{
    /**
     * Display eligible barangays page.
     */
    public function index(): Response
    {
        $eligibleBarangays = EligibleBarangay::with(['allocationType', 'barangay'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/eligible-barangays', [
            'eligibleBarangays' => $eligibleBarangays,
        ]);
    }

    /**
     * Get form data for eligible barangays.
     */
    public function getFormData(): Response
    {
        return Inertia::render('admin/eligible-barangays', [
            'allocationTypes' => AllocationType::orderBy('name', 'asc')->get(),
            'barangays' => Barangay::where('is_active', true)->orderBy('name', 'asc')->get(),
        ]);
    }

    /**
     * Store a new eligible barangay.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'allocation_type_id' => 'required|exists:allocation_types,id',
            'barangay_id' => 'required|exists:barangays,id',
        ]);

        // Check for duplicates
        $exists = EligibleBarangay::where('allocation_type_id', $validated['allocation_type_id'])
            ->where('barangay_id', $validated['barangay_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['barangay_id' => 'This barangay is already eligible for this allocation type.']);
        }

        EligibleBarangay::create($validated);

        return back()->with('success', 'Eligible barangay added successfully.');
    }

    /**
     * Delete an eligible barangay.
     */
    public function destroy(EligibleBarangay $eligibleBarangay): RedirectResponse
    {
        $eligibleBarangay->delete();

        return back()->with('success', 'Eligible barangay removed successfully.');
    }
}
