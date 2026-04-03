<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FundingSource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FundingSourceController extends Controller
{
    /**
     * Display funding sources page.
     */
    public function index(): Response
    {
        $fundingSources = FundingSource::orderBy('name', 'asc')->get();

        return Inertia::render('admin/funding-sources', [
            'fundingSources' => $fundingSources,
        ]);
    }

    /**
     * Store a new funding source.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:funding_sources,name',
            'description' => 'nullable|string',
        ], [
            'name.unique' => 'A funding source with this name already exists.',
        ]);

        FundingSource::create($validated);

        return back()->with('success', 'Funding source created successfully.');
    }

    /**
     * Update an existing funding source.
     */
    public function update(Request $request, FundingSource $fundingSource): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:funding_sources,name,' . $fundingSource->id,
            'description' => 'nullable|string',
        ], [
            'name.unique' => 'A funding source with this name already exists.',
        ]);

        $fundingSource->update($validated);

        return back()->with('success', 'Funding source updated successfully.');
    }

    /**
     * Delete a funding source.
     */
    public function destroy(FundingSource $fundingSource): RedirectResponse
    {
        $fundingSource->delete();

        return back()->with('success', 'Funding source deleted successfully.');
    }
}
