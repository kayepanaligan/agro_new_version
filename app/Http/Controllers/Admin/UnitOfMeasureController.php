<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UnitOfMeasure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitOfMeasureController extends Controller
{
    /**
     * Display unit of measures page.
     */
    public function index(): Response
    {
        $unitOfMeasures = UnitOfMeasure::orderBy('name', 'asc')->get();

        return Inertia::render(request()->is('super-admin/*') ? 'super_admin/unit-of-measures' : 'admin/unit-of-measures', [
            'unitOfMeasures' => $unitOfMeasures,
        ]);
    }

    /**
     * Store a new unit of measure.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:unit_of_measures,name',
            'code' => 'required|string|max:50|unique:unit_of_measures,code',
            'description' => 'nullable|string',
        ]);

        UnitOfMeasure::create($validated);

        return back()->with('success', 'Unit of Measure created successfully.');
    }

    /**
     * Update an existing unit of measure.
     */
    public function update(Request $request, UnitOfMeasure $unitOfMeasure): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:unit_of_measures,name,' . $unitOfMeasure->id,
            'code' => 'required|string|max:50|unique:unit_of_measures,code,' . $unitOfMeasure->id,
            'description' => 'nullable|string',
        ]);

        $unitOfMeasure->update($validated);

        return back()->with('success', 'Unit of Measure updated successfully.');
    }

    /**
     * Delete a unit of measure.
     */
    public function destroy(UnitOfMeasure $unitOfMeasure): RedirectResponse
    {
        $unitOfMeasure->delete();

        return back()->with('success', 'Unit of Measure deleted successfully.');
    }
}
