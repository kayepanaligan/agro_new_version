<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CropMonitoringFolder;
use App\Models\CropMonitoringItem;
use Illuminate\Http\Request;

class CropMonitoringItemController extends Controller
{
    public function store(Request $request, CropMonitoringFolder $folder)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'temperature' => 'nullable|numeric|between:-50,60',
            'weather_condition' => 'nullable|string|max:100',
            'humidity' => 'nullable|integer|between:0,100',
            'wind_speed' => 'nullable|numeric|min:0',
            'weather_notes' => 'nullable|string',
            'media_path' => 'nullable|string',
            'observation_date' => 'required|date',
        ]);

        if (!auth()->check()) {
            return back()->withErrors(['error' => 'User not authenticated']);
        }

        $validated['folder_id'] = $folder->crop_monitoring_folder_id;
        $validated['updated_by'] = auth()->id();

        // Handle file upload if present
        if ($request->hasFile('media')) {
            $path = $request->file('media')->store('monitoring/media', 'public');
            $validated['media_path'] = $path;
        }

        $item = CropMonitoringItem::create($validated);

        // Track folder updater
        \App\Models\CropMonitoringUpdater::create([
            'folder_id' => $folder->crop_monitoring_folder_id,
            'user_id' => auth()->id(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.monitoring-folders.show', $folder)
            ->with('success', 'Timeline entry added successfully');
    }

    public function update(Request $request, CropMonitoringItem $item)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'temperature' => 'nullable|numeric|between:-50,60',
            'weather_condition' => 'nullable|string|max:100',
            'humidity' => 'nullable|integer|between:0,100',
            'wind_speed' => 'nullable|numeric|min:0',
            'weather_notes' => 'nullable|string',
            'observation_date' => 'required|date',
        ]);

        // Handle file upload if present
        if ($request->hasFile('media')) {
            $path = $request->file('media')->store('monitoring/media', 'public');
            $validated['media_path'] = $path;
        }

        $item->update($validated);

        // Track folder updater
        if (auth()->check()) {
            \App\Models\CropMonitoringUpdater::create([
                'folder_id' => $item->folder_id,
                'user_id' => auth()->id(),
                'updated_at' => now(),
            ]);
        }

        return redirect()->route('admin.monitoring-folders.show', $item->folder_id)
            ->with('success', 'Timeline entry updated successfully');
    }

    public function destroy(CropMonitoringItem $item)
    {
        $folderId = $item->folder_id;
        $item->delete();

        return redirect()->route('admin.monitoring-folders.show', $folderId)
            ->with('success', 'Timeline entry deleted successfully');
    }
}
