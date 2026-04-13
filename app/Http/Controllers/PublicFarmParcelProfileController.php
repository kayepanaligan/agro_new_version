<?php

namespace App\Http\Controllers;

use App\Models\FarmParcel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicFarmParcelProfileController extends Controller
{
    /**
     * Display the public farm parcel profile
     */
    public function show($fpid)
    {
        $parcel = FarmParcel::with(['farm.farmer'])->where('fpid', $fpid)->firstOrFail();
        
        return Inertia::render('public/farm-parcel-profile', [
            'parcel' => $parcel,
        ]);
    }
}
