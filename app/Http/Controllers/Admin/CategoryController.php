<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display categories page.
     */
    public function index(): Response
    {
        $categories = Category::orderBy('name', 'asc')->get();
        
        // Determine which view to render based on the current route
        $view = request()->is('super-admin/*') ? 'super_admin/categories' : 'admin/categories';

        return Inertia::render($view, [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a new category.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($validated);

        // Log the creation
        AuditLogService::created(
            'categories',
            $validated,
            Category::class,
            $category->id,
            "Created category: {$validated['name']}"
        );

        return back()->with('success', 'Category created successfully.');
    }

    /**
     * Update an existing category.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
        ]);

        $oldValues = $category->toArray();
        $category->update($validated);

        // Log the update
        AuditLogService::updated(
            'categories',
            $oldValues,
            $validated,
            Category::class,
            $category->id,
            "Updated category: {$validated['name']}"
        );

        return back()->with('success', 'Category updated successfully.');
    }

    /**
     * Delete a category.
     */
    public function destroy(Category $category): RedirectResponse
    {
        $oldValues = $category->toArray();
        $categoryName = $category->name;
        $category->delete();

        // Log the deletion
        AuditLogService::deleted(
            'categories',
            $oldValues,
            Category::class,
            $category->id,
            "Deleted category: {$categoryName}"
        );

        return back()->with('success', 'Category deleted successfully.');
    }
}
