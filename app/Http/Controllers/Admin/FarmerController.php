<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Commodity;
use App\Models\Farmer;
use App\Models\Farm;
use App\Models\Organization;
use App\Models\Program;
use App\Models\Variety;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FarmerController extends Controller
{
    /**
     * Display farmers page.
     */
    public function index(): Response
    {
        $farmers = Farmer::with([
            'profile',
            'address',
            'contact',
            'spouse',
            'household',
            'education',
            'emergencyContact',
            'mainLivelihood',
            'farmingActivities.commodity',
            'farmingActivities.variety',
            'farmworkerLivelihood',
            'fisherfolkLivelihood',
            'agriYouthLivelihood',
            'income',
            'farms',
            'documents',
            'memberships.organization',
            'cropRotations',
            'farmerAssignments',
            'organizationMemberships'
        ])
            ->orderBy('last_name', 'asc')
            ->orderBy('first_name', 'asc')
            ->get();

        $commodities = Commodity::orderBy('name', 'asc')->get(['id', 'name', 'category_id']);
        $varieties = Variety::orderBy('name', 'asc')->get(['id', 'name', 'commodity_id']);
        $categories = Category::orderBy('name', 'asc')->get(['id', 'name']);
        $organizations = Organization::orderBy('name', 'asc')->get(['id', 'name', 'type']);
        $programs = Program::orderBy('program_name', 'asc')->get(['id', 'program_name']);

        return Inertia::render('admin/farmers', [
            'farmers' => $farmers,
            'categories' => $categories,
            'commodities' => $commodities,
            'varieties' => $varieties,
            'organizations' => $organizations,
            'programs' => $programs,
        ]);
    }

    /**
     * Display farmer profile.
     */
    public function show(Farmer $farmer): Response
    {
        $farmer->load([
            'profile',
            'address',
            'contact',
            'spouse',
            'household',
            'education',
            'emergencyContact',
            'mainLivelihood',
            'farmingActivities.commodity',
            'farmingActivities.variety',
            'farmworkerLivelihood',
            'fisherfolkLivelihood',
            'agriYouthLivelihood',
            'income',
            'farms',
            'documents',
            'memberships.organization',
            'cropRotations',
            'farmerAssignments',
            'organizationMemberships'
        ]);

        // Calculate household members count from household table
        $householdMembersCount = 0;
        if ($farmer->household) {
            $householdMembersCount = $farmer->household->no_living_household_members;
        }

        // Get crops planted from farming activities
        $cropsPlanted = [];
        if ($farmer->farmingActivities && $farmer->farmingActivities->isNotEmpty()) {
            $cropsPlanted = $farmer->farmingActivities
                ->filter(fn($activity) => $activity->commodity)
                ->unique('commodity_id')
                ->pluck('commodity.name')
                ->filter()
                ->values()
                ->toArray();
        }

        return Inertia::render('admin/farmers/show', [
            'farmer' => array_merge($farmer->toArray(), [
                'household_members_count' => $householdMembersCount,
                'crops_planted' => $cropsPlanted,
            ]),
        ]);
    }

    /**
     * Store a new farmer.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->getValidationRules(), [
            'rsbsa_number.unique' => 'This RSBSA number is already registered.',
        ]);

        // Handle enrollment updated timestamp
        if (isset($validated['enrollment_type']) && $validated['enrollment_type'] === 'updating') {
            $validated['enrollment_updated_at'] = now();
        }

        $farmer = Farmer::create($validated);

        return back()->with('success', 'Farmer created successfully.');
    }

    /**
     * Update an existing farmer.
     */
    public function update(Request $request, Farmer $farmer): RedirectResponse
    {
        $validated = $request->validate($this->getValidationRules($farmer->id), [
            'rsbsa_number.unique' => 'This RSBSA number is already registered.',
        ]);

        // Handle enrollment updated timestamp
        if (isset($validated['enrollment_type']) && $validated['enrollment_type'] === 'updating') {
            $validated['enrollment_updated_at'] = now();
        }

        $farmer->update($validated);

        return back()->with('success', 'Farmer updated successfully.');
    }

    /**
     * Delete a farmer.
     */
    public function destroy(Farmer $farmer): RedirectResponse
    {
        $farmer->delete();

        return back()->with('success', 'Farmer deleted successfully.');
    }

    /**
     * Get validation rules for farmer data.
     */
    private function getValidationRules(?int $farmerId = null): array
    {
        $uniqueRsbsa = $farmerId 
            ? 'nullable|string|max:255|unique:farmers,rsbsa_number,' . $farmerId
            : 'nullable|string|max:255|unique:farmers,rsbsa_number';

        return [
            // Basic Information (Required)
            'rsbsa_number' => $uniqueRsbsa,
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'extension_name' => 'nullable|string|max:255',
            'sex' => 'required|in:Male,Female,Other',
            'birthdate' => 'nullable|date',
            'picture_id' => 'nullable|string|max:255',
            
            // Enrollment
            'enrollment_type' => 'nullable|in:new,updating',
            'enrollment_updated_at' => 'nullable|date',
            
            // Contact Information
            'contact_number' => 'nullable|string|max:20',
            'landline_number' => 'nullable|string|max:20',
            
            // Civil Status & Spouse
            'civil_status' => 'nullable|in:single,married,widowed,separated',
            'spouse_first_name' => 'nullable|string|max:255',
            'spouse_middle_name' => 'nullable|string|max:255',
            'spouse_surname' => 'nullable|string|max:255',
            'spouse_extension_name' => 'nullable|string|max:255',
            
            // Address
            'house_lot_bldg_no_purok' => 'nullable|string|max:255',
            'street_sitio_subdv' => 'nullable|string|max:255',
            'barangay' => 'nullable|string|max:255',
            'municipality_city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            
            // Birthplace & Religion
            'place_of_birth_municipality' => 'nullable|string|max:255',
            'place_of_birth_province' => 'nullable|string|max:255',
            'place_of_birth_country' => 'nullable|string|max:255',
            'religion' => 'nullable|in:christianity,islam,others',
            
            // Household Information
            'is_household_head' => 'nullable|boolean',
            'household_head_first_name' => 'nullable|string|max:255',
            'household_head_middle_name' => 'nullable|string|max:255',
            'household_head_surname' => 'nullable|string|max:255',
            'household_head_extension_name' => 'nullable|string|max:255',
            'relationship_to_household_head' => 'nullable|string|max:255',
            'no_living_household_members' => 'nullable|integer|min:0',
            'no_male_household_members' => 'nullable|integer|min:0',
            'no_female_household_members' => 'nullable|integer|min:0',
            
            // Education
            'highest_formal_education' => 'nullable|in:pre_school,elementary,high_school_non_k12,junior_hs_k12,senior_hs_k12,college,vocational,post_graduate,none',
            
            // Special Fields
            'is_pwd' => 'nullable|boolean',
            'is_4ps_beneficiary' => 'nullable|boolean',
            'is_ip' => 'nullable|boolean',
            'ip_specify' => 'nullable|string|max:255',
            
            // Government ID
            'government_id_type' => 'nullable|string|max:255',
            'government_id_number' => 'nullable|string|max:255',
            
            // Emergency Contact
            'emergency_contact_first_name' => 'nullable|string|max:255',
            'emergency_contact_middle_name' => 'nullable|string|max:255',
            'emergency_contact_last_name' => 'nullable|string|max:255',
            'emergency_contact_extension_name' => 'nullable|string|max:255',
            'emergency_contact_number' => 'nullable|string|max:20',
        ];
    }
}
