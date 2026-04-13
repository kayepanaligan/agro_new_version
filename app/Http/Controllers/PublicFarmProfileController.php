<?php

namespace App\Http\Controllers;

use App\Models\Farm;
use Inertia\Inertia;
use Inertia\Response;

class PublicFarmProfileController extends Controller
{
    /**
     * Display a public farm profile when QR code is scanned
     */
    public function show(string $fid): Response
    {
        $farm = Farm::with([
            'farmer',
            'farmParcels'
        ])
            ->where('fid', $fid)
            ->firstOrFail();

        // Get farm parcels count
        $farmParcelsCount = $farm->farmParcels ? $farm->farmParcels->count() : 0;

        // Calculate total farm area
        $totalArea = 0;
        if ($farm->farmParcels) {
            $totalArea = $farm->farmParcels->sum(function($parcel) {
                return $parcel->parcel_size ?? $parcel->total_farm_area ?? 0;
            });
        }

        return Inertia::render('public/farm-profile', [
            'farm' => array_merge($farm->toArray(), [
                'farm_parcels_count' => $farmParcelsCount,
                'total_farm_area' => $totalArea,
            ]),
        ]);
    }
}
