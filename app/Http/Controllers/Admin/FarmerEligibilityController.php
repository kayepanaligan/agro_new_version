<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FarmerEligibility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FarmerEligibilityController extends Controller
{
    /**
     * Display farmer eligibilities page.
     */
    public function index(): Response
    {
        $farmerEligibilities = FarmerEligibility::orderBy('name')->get();

        return Inertia::render('admin/farmer-eligibilities', [
            'farmerEligibilities' => $farmerEligibilities,
        ]);
    }

    /**
     * Store a new farmer eligibility.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'attribute_field' => 'required|string|max:255',
            'required_value' => 'required|string|max:255',
        ]);

        FarmerEligibility::create($validated);

        return back()->with('success', 'Farmer Eligibility created successfully.');
    }

    /**
     * Update an existing farmer eligibility.
     */
    public function update(Request $request, FarmerEligibility $farmerEligibility): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'attribute_field' => 'required|string|max:255',
            'required_value' => 'required|string|max:255',
        ]);

        $farmerEligibility->update($validated);

        return back()->with('success', 'Farmer Eligibility updated successfully.');
    }

    /**
     * Delete a farmer eligibility.
     */
    public function destroy(FarmerEligibility $farmerEligibility): RedirectResponse
    {
        $farmerEligibility->delete();

        return back()->with('success', 'Farmer Eligibility deleted successfully.');
    }
}
