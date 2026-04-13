<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Farmer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FarmerProfileController extends Controller
{
    public function show()
    {
        $user = auth()->user();
        $farmer = Farmer::where('lfid', $user->lfid)->with([
            'enrollmentInformation',
            'address',
            'contact',
            'spouse',
            'household',
            'profile',
            'education',
            'emergencyContact',
            'documents',
            'memberships',
            'mainLivelihood',
            'farms' => ['farm_parcels']
        ])->first();

        if (!$farmer) {
            abort(404, 'Farmer profile not found');
        }

        return Inertia::render('farmer/profile', [
            'farmer' => $farmer,
        ]);
    }
}
