<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CropMonitoringCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CropMonitoringCategoryController extends Controller
{
    public function index(): Response
    {
        $categories = CropMonitoringCategory::withCount('folders')
            ->orderBy('category_name')
            ->get();

        return Inertia::render('admin/monitoring-categories', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|max:255|unique:crop_monitoring_categories,category_name',
            'description' => 'nullable|string',
        ]);

        CropMonitoringCategory::create($validated);

        return redirect()->route('admin.monitoring-categories.index')
            ->with('success', 'Category created successfully');
    }

    public function update(Request $request, CropMonitoringCategory $category)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|max:255|unique:crop_monitoring_categories,category_name,' . 
                $category->crop_monitoring_category_id . ',crop_monitoring_category_id',
            'description' => 'nullable|string',
        ]);

        $category->update($validated);

        return redirect()->route('admin.monitoring-categories.index')
            ->with('success', 'Category updated successfully');
    }

    public function destroy(CropMonitoringCategory $category)
    {
        if ($category->folders()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete category with existing folders']);
        }

        $category->delete();

        return redirect()->route('admin.monitoring-categories.index')
            ->with('success', 'Category deleted successfully');
    }
}
