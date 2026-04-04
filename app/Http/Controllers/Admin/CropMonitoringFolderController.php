<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CropMonitoringCategory;
use App\Models\CropMonitoringFolder;
use App\Models\Commodity;
use App\Models\Variety;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CropMonitoringFolderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CropMonitoringFolder::with(['category', 'commodity', 'variety', 'updaters.user'])
            ->withCount('items');

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by commodity
        if ($request->filled('commodity_id')) {
            $query->where('commodity_id', $request->commodity_id);
        }

        // Search by folder name
        if ($request->filled('search')) {
            $query->where('folder_name', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $folders = $query->paginate(12)->withQueryString();

        $categories = CropMonitoringCategory::orderBy('category_name')->get();
        $commodities = Commodity::orderBy('name')->get();

        return Inertia::render('admin/monitoring-folders', [
            'folders' => $folders,
            'categories' => $categories,
            'commodities' => $commodities,
            'filters' => $request->only(['category_id', 'commodity_id', 'search']),
        ]);
    }

    public function show(CropMonitoringFolder $cropMonitoringFolder): Response
    {
        $cropMonitoringFolder->load([
            'category',
            'commodity',
            'variety',
            'items.updater',
            'updaters.user',
        ]);

        $items = $cropMonitoringFolder->items->sortByDesc('observation_date');

        return Inertia::render('admin/monitoring-folder-detail', [
            'folder' => $cropMonitoringFolder,
            'items' => $items->values(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'folder_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:crop_monitoring_categories,crop_monitoring_category_id',
            'commodity_id' => 'required|exists:commodities,id',
            'variety_id' => 'required|exists:varieties,id',
        ]);

        $folder = CropMonitoringFolder::create($validated);

        // Add current user as updater
        if (auth()->check()) {
            \App\Models\CropMonitoringUpdater::create([
                'folder_id' => $folder->crop_monitoring_folder_id,
                'user_id' => auth()->id(),
                'updated_at' => now(),
            ]);
        }

        return redirect()->route('admin.monitoring-folders.index')
            ->with('success', 'Monitoring folder created successfully');
    }

    public function update(Request $request, CropMonitoringFolder $folder)
    {
        $validated = $request->validate([
            'folder_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:crop_monitoring_categories,crop_monitoring_category_id',
            'commodity_id' => 'required|exists:commodities,id',
            'variety_id' => 'required|exists:varieties,id',
        ]);

        $folder->update($validated);

        // Track updater
        if (auth()->check()) {
            \App\Models\CropMonitoringUpdater::create([
                'folder_id' => $folder->crop_monitoring_folder_id,
                'user_id' => auth()->id(),
                'updated_at' => now(),
            ]);
        }

        return redirect()->route('admin.monitoring-folders.index')
            ->with('success', 'Monitoring folder updated successfully');
    }

    public function destroy(CropMonitoringFolder $folder)
    {
        $folder->delete();

        return redirect()->route('admin.monitoring-folders.index')
            ->with('success', 'Monitoring folder deleted successfully');
    }
}
