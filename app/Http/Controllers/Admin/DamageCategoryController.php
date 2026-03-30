<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DamageCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DamageCategoryController extends Controller
{
    /**
     * Display damage categories page.
     */
    public function index(): Response
    {
        $damageCategories = DamageCategory::orderBy('damage_category_name', 'asc')
            ->withCount('damageTypes')
            ->get();

        return Inertia::render('admin/damage-categories', [
            'damageCategories' => $damageCategories,
        ]);
    }

    /**
     * Store a new damage category.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'damage_category_name' => 'required|string|max:255|unique:damage_categories,damage_category_name',
            'damage_category_description' => 'nullable|string|max:1000',
        ]);

        DamageCategory::create($validated);

        return redirect()->back()->with('success', 'Damage category created successfully.');
    }

    /**
     * Update damage category.
     */
    public function update(Request $request, DamageCategory $damageCategory)
    {
        $validated = $request->validate([
            'damage_category_name' => 'required|string|max:255|unique:damage_categories,damage_category_name,' . $damageCategory->damage_category_id . ',damage_category_id',
            'damage_category_description' => 'nullable|string|max:1000',
        ]);

        $damageCategory->update($validated);

        return redirect()->back()->with('success', 'Damage category updated successfully.');
    }

    /**
     * Delete damage category.
     */
    public function destroy(DamageCategory $damageCategory)
    {
        $damageCategory->delete();

        return redirect()->back()->with('success', 'Damage category deleted successfully.');
    }
}
