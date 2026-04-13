<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\CropDamageRecordItem;
use App\Models\DamageType;
use App\Models\Farm;
use App\Models\Farmer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FarmerCropDamageController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $farmer = Farmer::where('lfid', $user->lfid)->first();

        if (!$farmer) {
            abort(404, 'Farmer profile not found');
        }

        $damageReports = CropDamageRecordItem::where('farmer_id', $farmer->id)
            ->with(['farm', 'damageType', 'cropDamageRecord'])
            ->orderBy('created_at', 'desc')
            ->get();

        $farms = Farm::where('farmer_id', $farmer->id)->get();
        $damageTypes = DamageType::with('damageCategory')->get();

        return Inertia::render('farmer/crop-damage', [
            'damageReports' => $damageReports,
            'farms' => $farms,
            'damageTypes' => $damageTypes,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $farmer = Farmer::where('lfid', $user->lfid)->first();

        $validated = $request->validate([
            'farm_id' => 'required|exists:farms,id',
            'damage_type_id' => 'required|exists:damage_types,damage_type_id',
            'damage_severity' => 'required|in:low,medium,high',
            'commodity_name' => 'required|string|max:255',
            'variety_name' => 'required|string|max:255',
            'photo_path' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'temperature' => 'nullable|numeric',
            'humidity' => 'nullable|numeric',
            'weather_condition' => 'nullable|string|max:255',
            'wind_speed' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'recorded_date' => 'required|date',
        ]);

        // Verify farmer owns this farm
        $farm = Farm::where('id', $validated['farm_id'])
            ->where('farmer_id', $farmer->id)
            ->first();

        if (!$farm) {
            abort(403, 'Unauthorized access to this farm');
        }

        $damageReport = CropDamageRecordItem::create([
            'farmer_id' => $farmer->id,
            'farm_id' => $validated['farm_id'],
            'damage_type_id' => $validated['damage_type_id'],
            'damage_severity' => $validated['damage_severity'],
            'commodity_name' => $validated['commodity_name'],
            'variety_name' => $validated['variety_name'],
            'photo_path' => $validated['photo_path'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'temperature' => $validated['temperature'] ?? null,
            'humidity' => $validated['humidity'] ?? null,
            'weather_condition' => $validated['weather_condition'] ?? null,
            'wind_speed' => $validated['wind_speed'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
            'recorded_date' => $validated['recorded_date'],
        ]);

        return redirect()->route('farmer.crop-damage')
            ->with('success', 'Crop damage report submitted successfully');
    }

    public function show(CropDamageRecordItem $cropDamage)
    {
        $user = auth()->user();
        $farmer = Farmer::where('lfid', $user->lfid)->first();

        // Ensure farmer owns this damage report
        if ($cropDamage->farmer_id !== $farmer->id) {
            abort(403, 'Unauthorized access');
        }

        $cropDamage->load(['farm', 'damageType.damageCategory', 'cropDamageRecord']);

        return Inertia::render('farmer/crop-damage/show', [
            'damageReport' => $cropDamage,
        ]);
    }
}
