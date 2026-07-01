<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PointRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PointRulesController extends Controller
{
    /**
     * Display point rules.
     */
    public function index(): Response
    {
        $rules = PointRule::orderBy('name')->get();

        return Inertia::render('admin/point-rules', [
            'rules' => $rules,
        ]);
    }

    /**
     * Store a new point rule.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger_action' => 'required|string|max:255',
            'points_awarded' => 'required|integer|min:1',
            'max_earnable' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        PointRule::create($validated);

        return back()->with('success', 'Point rule created successfully.');
    }

    /**
     * Update an existing point rule.
     */
    public function update(Request $request, PointRule $pointRule): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger_action' => 'required|string|max:255',
            'points_awarded' => 'required|integer|min:1',
            'max_earnable' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $pointRule->update($validated);

        return back()->with('success', 'Point rule updated successfully.');
    }

    /**
     * Delete a point rule.
     */
    public function destroy(PointRule $pointRule): RedirectResponse
    {
        $pointRule->delete();

        return back()->with('success', 'Point rule deleted successfully.');
    }

    /**
     * Toggle point rule active status.
     */
    public function toggle(PointRule $pointRule): RedirectResponse
    {
        $pointRule->update([
            'is_active' => !$pointRule->is_active,
        ]);

        return back()->with('success', 'Point rule ' . ($pointRule->is_active ? 'enabled' : 'disabled') . ' successfully.');
    }
}
