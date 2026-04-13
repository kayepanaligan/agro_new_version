<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DamageCategory;
use App\Models\DamageType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DamageTypeController extends Controller
{
    /**
     * Display damage types page.
     */
    public function index(): Response
    {
        $damageTypes = DamageType::with('damageCategory')
            ->orderBy('damage_type_name', 'asc')
            ->get();

        $damageCategories = DamageCategory::orderBy('damage_category_name', 'asc')->get();

        return Inertia::render(request()->is('super-admin/*') ? 'super_admin/damage-types' : 'admin/damage-types', [
            'damageTypes' => $damageTypes,
            'damageCategories' => $damageCategories,
        ]);
    }

    /**
     * Store a new damage type.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'damage_type_name' => 'required|string|max:255|unique:damage_types,damage_type_name',
            'damage_category_id' => 'required|exists:damage_categories,damage_category_id',
            'damage_type_description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_ai_generated' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('damage-images', 'public');
        }

        $validated['is_ai_generated'] = $validated['is_ai_generated'] ?? false;

        DamageType::create($validated);

        return redirect()->back()->with('success', 'Damage type created successfully.');
    }

    /**
     * Update damage type.
     */
    public function update(Request $request, DamageType $damageType)
    {
        $validated = $request->validate([
            'damage_type_name' => 'required|string|max:255|unique:damage_types,damage_type_name,' . $damageType->damage_type_id . ',damage_type_id',
            'damage_category_id' => 'required|exists:damage_categories,damage_category_id',
            'damage_type_description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_ai_generated' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($damageType->image_path) {
                Storage::disk('public')->delete($damageType->image_path);
            }
            
            $validated['image_path'] = $request->file('image')->store('damage-images', 'public');
        }

        $validated['is_ai_generated'] = $validated['is_ai_generated'] ?? false;

        $damageType->update($validated);

        return redirect()->back()->with('success', 'Damage type updated successfully.');
    }

    /**
     * Delete damage type.
     */
    public function destroy(DamageType $damageType)
    {
        // Delete image if exists
        if ($damageType->image_path) {
            Storage::disk('public')->delete($damageType->image_path);
        }

        $damageType->delete();

        return redirect()->back()->with('success', 'Damage type deleted successfully.');
    }
}
