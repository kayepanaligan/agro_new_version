<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AllocationType;
use App\Models\Barangay;
use App\Models\Category;
use App\Models\Commodity;
use App\Models\FarmerEligibility;
use App\Models\Program;
use App\Models\UnitOfMeasure;
use App\Models\Variety;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AllocationTypeController extends Controller
{
    /**
     * Display allocation types page.
     */
    public function index(): Response
    {
        $allocationTypes = AllocationType::with(['program', 'unitOfMeasurement'])->get();
        $programs = Program::orderBy('program_name')->get();
        $unitsOfMeasure = UnitOfMeasure::orderBy('name')->get();
        $categories = Category::orderBy('name')->get();
        $commodities = Commodity::with('category')->orderBy('name')->get();
        $varieties = Variety::with('commodity')->orderBy('name')->get();
        $barangays = Barangay::where('is_active', true)->orderBy('name')->get();
        $farmerEligibilities = FarmerEligibility::where('is_active', true)->get();

        return Inertia::render(request()->is('super-admin/*') ? 'super_admin/allocation-types' : 'admin/allocation-types', [
            'allocationTypes' => $allocationTypes,
            'programs' => $programs,
            'unitsOfMeasure' => $unitsOfMeasure,
            'categories' => $categories,
            'commodities' => $commodities,
            'varieties' => $varieties,
            'barangays' => $barangays,
            'farmerEligibilities' => $farmerEligibilities,
        ]);
    }

    /**
     * Get reference data for forms.
     */
    public function getFormData(): Response
    {
        $categories = Category::orderBy('name')->get();
        $commodities = Commodity::with('category')->orderBy('name')->get();
        $varieties = Variety::with('commodity')->orderBy('name')->get();
        $barangays = Barangay::where('is_active', true)->orderBy('name')->get();
        $programs = Program::orderBy('program_name')->get();
        $unitsOfMeasure = UnitOfMeasure::orderBy('name')->get();
        $farmerEligibilities = FarmerEligibility::where('is_active', true)->get();

        return Inertia::render('admin/allocation-types-form', [
            'categories' => $categories,
            'commodities' => $commodities,
            'varieties' => $varieties,
            'barangays' => $barangays,
            'programs' => $programs,
            'unitsOfMeasure' => $unitsOfMeasure,
            'farmerEligibilities' => $farmerEligibilities,
        ]);
    }

    /**
     * Store a new allocation type.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'unit_of_measurement_id' => 'required|exists:unit_of_measures,id',
            'program_id' => 'required|exists:programs,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'commodity_ids' => 'nullable|array',
            'commodity_ids.*' => 'exists:commodities,id',
            'variety_ids' => 'nullable|array',
            'variety_ids.*' => 'exists:varieties,id',
            'barangay_ids' => 'nullable|array',
            'barangay_ids.*' => 'exists:barangays,id',
            'farmer_eligibility_criteria' => 'nullable|array',
        ]);

        AllocationType::create($validated);

        return back()->with('success', 'Allocation Type created successfully.');
    }

    /**
     * Update an existing allocation type.
     */
    public function update(Request $request, AllocationType $allocationType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'unit_of_measurement_id' => 'required|exists:unit_of_measures,id',
            'program_id' => 'required|exists:programs,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'commodity_ids' => 'nullable|array',
            'commodity_ids.*' => 'exists:commodities,id',
            'variety_ids' => 'nullable|array',
            'variety_ids.*' => 'exists:varieties,id',
            'barangay_ids' => 'nullable|array',
            'barangay_ids.*' => 'exists:barangays,id',
            'farmer_eligibility_criteria' => 'nullable|array',
        ]);

        $allocationType->update($validated);

        return back()->with('success', 'Allocation Type updated successfully.');
    }

    /**
     * Delete an allocation type.
     */
    public function destroy(AllocationType $allocationType): RedirectResponse
    {
        $allocationType->delete();

        return back()->with('success', 'Allocation Type deleted successfully.');
    }
}
