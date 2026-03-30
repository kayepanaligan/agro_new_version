<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    /**
     * Display organizations page.
     */
    public function index(): Response
    {
        $organizations = Organization::orderBy('name', 'asc')->get();

        return Inertia::render('admin/organizations', [
            'organizations' => $organizations,
        ]);
    }

    /**
     * Store a new organization.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:organizations,name',
            'type' => 'required|in:coop,association',
        ], [
            'name.unique' => 'An organization with this name already exists.',
        ]);

        Organization::create($validated);

        return back()->with('success', 'Organization created successfully.');
    }

    /**
     * Update an existing organization.
     */
    public function update(Request $request, Organization $organization): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:organizations,name,' . $organization->id,
            'type' => 'required|in:coop,association',
        ], [
            'name.unique' => 'An organization with this name already exists.',
        ]);

        $organization->update($validated);

        return back()->with('success', 'Organization updated successfully.');
    }

    /**
     * Delete an organization.
     */
    public function destroy(Organization $organization): RedirectResponse
    {
        $organization->delete();

        return back()->with('success', 'Organization deleted successfully.');
    }
}
