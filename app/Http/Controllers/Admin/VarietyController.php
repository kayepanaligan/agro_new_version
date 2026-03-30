<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commodity;
use App\Models\Variety;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VarietyController extends Controller
{
    /**
     * Display varieties page.
     */
    public function index(): Response
    {
        $varieties = Variety::with('commodity')->orderBy('name', 'asc')->get();
        $commodities = Commodity::orderBy('name', 'asc')->get(['id', 'name']);

        return Inertia::render('admin/varieties', [
            'varieties' => $varieties,
            'commodities' => $commodities,
        ]);
    }

    /**
     * Store a new variety.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'commodity_id' => 'required|exists:commodities,id',
            'name' => 'required|string|max:255|unique:varieties,name',
            'description' => 'nullable|string',
        ], [
            'name.unique' => 'A variety with this name already exists. Please use a unique name.',
        ]);

        Variety::create($validated);

        return back()->with('success', 'Variety created successfully.');
    }

    /**
     * Update an existing variety.
     */
    public function update(Request $request, Variety $variety): RedirectResponse
    {
        $validated = $request->validate([
            'commodity_id' => 'required|exists:commodities,id',
            'name' => 'required|string|max:255|unique:varieties,name,' . $variety->id,
            'description' => 'nullable|string',
        ], [
            'name.unique' => 'A variety with this name already exists. Please use a unique name.',
        ]);

        $variety->update($validated);

        return back()->with('success', 'Variety updated successfully.');
    }

    /**
     * Delete a variety.
     */
    public function destroy(Variety $variety): RedirectResponse
    {
        $variety->delete();

        return back()->with('success', 'Variety deleted successfully.');
    }
}
