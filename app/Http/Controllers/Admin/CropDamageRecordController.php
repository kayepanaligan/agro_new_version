<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CropDamageRecord;
use App\Models\CropDamageRecordItem;
use App\Models\DamageType;
use App\Models\Farm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CropDamageRecordController extends Controller
{
    /**
     * Display crop damage records (folders) page.
     */
    public function index(): Response
    {
        $cropDamageRecords = CropDamageRecord::withCount('items')
            ->orderBy('recorded_date', 'desc')
            ->get();

        return Inertia::render('admin/crop-damage-records', [
            'cropDamageRecords' => $cropDamageRecords,
        ]);
    }

    /**
     * Show items inside a specific crop damage record (folder).
     */
    public function show(CropDamageRecord $cropDamageRecord): Response
    {
        $cropDamageRecord->load(['items.farm.farmer', 'items.damageType.damageCategory']);

        return Inertia::render('admin/crop-damage-record-detail', [
            'cropDamageRecord' => $cropDamageRecord,
            'cropDamageRecordItems' => $cropDamageRecord->items,
        ]);
    }

    /**
     * Store a new crop damage record (folder).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'recorded_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        CropDamageRecord::create($validated);

        return redirect()->back()->with('success', 'Crop damage record folder created successfully.');
    }

    /**
     * Update crop damage record (folder).
     */
    public function update(Request $request, CropDamageRecord $cropDamageRecord)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'recorded_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $cropDamageRecord->update($validated);

        return redirect()->back()->with('success', 'Crop damage record folder updated successfully.');
    }

    /**
     * Delete crop damage record (folder) and all its items.
     */
    public function destroy(CropDamageRecord $cropDamageRecord)
    {
        // Delete all item photos first
        foreach ($cropDamageRecord->items as $item) {
            if ($item->photo_path) {
                Storage::disk('public')->delete($item->photo_path);
            }
        }

        $cropDamageRecord->delete(); // This will cascade delete items

        return redirect()->back()->with('success', 'Crop damage record folder and all items deleted successfully.');
    }
}
