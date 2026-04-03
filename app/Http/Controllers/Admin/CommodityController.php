<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Commodity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommodityController extends Controller
{
    /**
     * Display commodities page.
     */
    public function index(): Response
    {
        $commodities = Commodity::with('category')->orderBy('name', 'asc')->get();
        $categories = Category::orderBy('name', 'asc')->get(['id', 'name']);

        return Inertia::render('admin/commodities', [
            'commodities' => $commodities,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a new commodity.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255|unique:commodities,name',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ], [
            'name.unique' => 'A commodity with this name already exists. Please use a unique name.',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('commodities', 'public');
        }

        Commodity::create($validated);

        return back()->with('success', 'Commodity created successfully.');
    }

    /**
     * Update an existing commodity.
     */
    public function update(Request $request, Commodity $commodity): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255|unique:commodities,name,' . $commodity->id,
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ], [
            'name.unique' => 'A commodity with this name already exists. Please use a unique name.',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($commodity->image_path) {
                \Storage::disk('public')->delete($commodity->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('commodities', 'public');
        }

        $commodity->update($validated);

        return back()->with('success', 'Commodity updated successfully.');
    }

    /**
     * Delete a commodity.
     */
    public function destroy(Commodity $commodity): RedirectResponse
    {
        // Delete image if exists
        if ($commodity->image_path) {
            \Storage::disk('public')->delete($commodity->image_path);
        }

        $commodity->delete();

        return back()->with('success', 'Commodity deleted successfully.');
    }
}
