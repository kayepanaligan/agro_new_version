<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssistanceCategory;
use App\Models\Program;
use App\Models\Barangay;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssistanceCategoryController extends Controller
{
    /**
     * Display assistance categories page.
     */
    public function index(): Response
    {
        $assistanceCategories = AssistanceCategory::with('program')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render(request()->is('super-admin/*') ? 'super_admin/assistance-categories' : 'admin/assistance-categories', [
            'assistanceCategories' => $assistanceCategories,
            'programs' => Program::orderBy('program_name', 'asc')->get(),
            'barangays' => Barangay::where('is_active', true)->orderBy('name', 'asc')->get(),
        ]);
    }

    /**
     * Get form data for assistance categories.
     */
    public function getFormData(): Response
    {
        return Inertia::render(request()->is('super-admin/*') ? 'super_admin/assistance-categories' : 'admin/assistance-categories', [
            'programs' => Program::orderBy('program_name', 'asc')->get(),
            'barangays' => Barangay::where('is_active', true)->orderBy('name', 'asc')->get(),
        ]);
    }

    /**
     * Store a new assistance category.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'program_id' => 'required|exists:programs,id',
            'barangay_ids' => 'nullable|array',
            'barangay_ids.*' => 'exists:barangays,id',
        ]);

        AssistanceCategory::create($validated);

        return back()->with('success', 'Assistance category created successfully.');
    }

    /**
     * Update an existing assistance category.
     */
    public function update(Request $request, AssistanceCategory $assistanceCategory): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'program_id' => 'required|exists:programs,id',
            'barangay_ids' => 'nullable|array',
            'barangay_ids.*' => 'exists:barangays,id',
        ]);

        $assistanceCategory->update($validated);

        return back()->with('success', 'Assistance category updated successfully.');
    }

    /**
     * Delete an assistance category.
     */
    public function destroy(AssistanceCategory $assistanceCategory): RedirectResponse
    {
        $assistanceCategory->delete();

        return back()->with('success', 'Assistance category deleted successfully.');
    }
}
