<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FarmerEligibility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FarmerEligibilityController extends Controller
{
    /**
     * Display farmer eligibilities page.
     */
    public function index(): Response
    {
        $farmerEligibilities = FarmerEligibility::orderBy('name')->get();

        return Inertia::render('admin/farmer-eligibilities', [
            'farmerEligibilities' => $farmerEligibilities,
            'farmerAttributes' => $this->getFarmerAttributes(),
        ]);
    }

    /**
     * Store a new farmer eligibility.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'attribute_field' => 'required|string|max:255',
            'required_value' => 'required|string|max:255',
        ]);

        FarmerEligibility::create($validated);

        return back()->with('success', 'Farmer Eligibility created successfully.');
    }

    /**
     * Update an existing farmer eligibility.
     */
    public function update(Request $request, FarmerEligibility $farmerEligibility): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'attribute_field' => 'required|string|max:255',
            'required_value' => 'required|string|max:255',
        ]);

        $farmerEligibility->update($validated);

        return back()->with('success', 'Farmer Eligibility updated successfully.');
    }

    /**
     * Delete a farmer eligibility.
     */
    public function destroy(FarmerEligibility $farmerEligibility): RedirectResponse
    {
        $farmerEligibility->delete();

        return back()->with('success', 'Farmer Eligibility deleted successfully.');
    }

    /**
     * Get all farmer attributes with their types and possible values.
     */
    private function getFarmerAttributes(): array
    {
        // Get barangays for location dropdown
        $barangays = \App\Models\Barangay::where('is_active', true)
            ->orderBy('name', 'asc')
            ->get()
            ->map(fn($b) => ['value' => $b->id, 'label' => $b->name])
            ->toArray();

        // Get organizations for membership dropdown
        $organizations = \App\Models\Organization::orderBy('name', 'asc')
            ->get()
            ->map(fn($o) => ['value' => $o->id, 'label' => $o->name])
            ->toArray();

        return [
            // Basic Information (from farmers table)
            [
                'value' => 'lfid',
                'label' => 'LFID (Farmer ID)',
                'type' => 'string',
                'values' => null,
            ],
            [
                'value' => 'rsbsa_number',
                'label' => 'RSBSA Number',
                'type' => 'string',
                'values' => null,
            ],
            [
                'value' => 'registration_status',
                'label' => 'Registration Status',
                'type' => 'enum',
                'values' => [['value' => 'active', 'label' => 'Active'], ['value' => 'inactive', 'label' => 'Inactive'], ['value' => 'pending', 'label' => 'Pending']],
            ],
            
            // Personal Information (from farmer_profiles table)
            [
                'value' => 'profile.first_name',
                'label' => 'First Name',
                'type' => 'string',
                'values' => null,
            ],
            [
                'value' => 'profile.last_name',
                'label' => 'Last Name',
                'type' => 'string',
                'values' => null,
            ],
            [
                'value' => 'profile.middle_name',
                'label' => 'Middle Name',
                'type' => 'string',
                'values' => null,
            ],
            [
                'value' => 'profile.suffix',
                'label' => 'Name Suffix',
                'type' => 'enum',
                'values' => [['value' => 'Jr.', 'label' => 'Junior'], ['value' => 'Sr.', 'label' => 'Senior'], ['value' => 'II', 'label' => '2nd'], ['value' => 'III', 'label' => '3rd'], ['value' => '', 'label' => 'None']],
            ],
            [
                'value' => 'profile.date_of_birth',
                'label' => 'Date of Birth',
                'type' => 'date',
                'values' => null,
            ],
            [
                'value' => 'profile.age',
                'label' => 'Age',
                'type' => 'number',
                'values' => null,
            ],
            [
                'value' => 'profile.sex',
                'label' => 'Sex / Gender',
                'type' => 'enum',
                'values' => [['value' => 'Male', 'label' => 'Male'], ['value' => 'Female', 'label' => 'Female']],
            ],
            [
                'value' => 'profile.civil_status',
                'label' => 'Civil Status',
                'type' => 'enum',
                'values' => [['value' => 'Single', 'label' => 'Single'], ['value' => 'Married', 'label' => 'Married'], ['value' => 'Widowed', 'label' => 'Widowed'], ['value' => 'Separated', 'label' => 'Separated'], ['value' => 'Common-Law', 'label' => 'Common-Law']],
            ],
            [
                'value' => 'profile.nationality',
                'label' => 'Nationality',
                'type' => 'string',
                'values' => [['value' => 'Filipino', 'label' => 'Filipino']],
            ],
            [
                'value' => 'profile.religion',
                'label' => 'Religion',
                'type' => 'string',
                'values' => null,
            ],
            [
                'value' => 'profile.is_indigenous',
                'label' => 'Is Indigenous Person (IP)',
                'type' => 'boolean',
                'values' => [['value' => '1', 'label' => 'Yes'], ['value' => '0', 'label' => 'No']],
            ],
            [
                'value' => 'profile.indigenous_group',
                'label' => 'Indigenous Group',
                'type' => 'string',
                'values' => null,
            ],
            [
                'value' => 'profile.is_pwd',
                'label' => 'Is PWD (Person with Disability)',
                'type' => 'boolean',
                'values' => [['value' => '1', 'label' => 'Yes'], ['value' => '0', 'label' => 'No']],
            ],
            [
                'value' => 'profile.pwd_disability',
                'label' => 'PWD Disability Type',
                'type' => 'string',
                'values' => null,
            ],
            [
                'value' => 'profile.contact_number',
                'label' => 'Contact Number',
                'type' => 'string',
                'values' => null,
            ],
            [
                'value' => 'profile.email',
                'label' => 'Email Address',
                'type' => 'string',
                'values' => null,
            ],
            
            // Location (from farmer_addresses and barangays)
            [
                'value' => 'address.barangay_id',
                'label' => 'Barangay (Location)',
                'type' => 'relation',
                'values' => $barangays,
            ],
            [
                'value' => 'address.street',
                'label' => 'Street / Sitio',
                'type' => 'string',
                'values' => null,
            ],
            [
                'value' => 'address.zone',
                'label' => 'Zone / Purok',
                'type' => 'string',
                'values' => null,
            ],
            
            // Education (from farmer_educations)
            [
                'value' => 'education.educational_level',
                'label' => 'Educational Level',
                'type' => 'enum',
                'values' => [['value' => 'Elementary', 'label' => 'Elementary'], ['value' => 'High School', 'label' => 'High School'], ['value' => 'Senior High School', 'label' => 'Senior High School'], ['value' => 'College', 'label' => 'College'], ['value' => 'Post-Graduate', 'label' => 'Post-Graduate']],
            ],
            [
                'value' => 'education.course_degree',
                'label' => 'Course / Degree',
                'type' => 'string',
                'values' => null,
            ],
            
            // Household (from farmer_households)
            [
                'value' => 'household.household_size',
                'label' => 'Household Size',
                'type' => 'number',
                'values' => null,
            ],
            [
                'value' => 'household.total_income',
                'label' => 'Total Household Income',
                'type' => 'number',
                'values' => null,
            ],
            [
                'value' => 'household.total_expenses',
                'label' => 'Total Household Expenses',
                'type' => 'number',
                'values' => null,
            ],
            
            // Farm Ownership (from farmer_profiles)
            [
                'value' => 'profile.is_farm_owner',
                'label' => 'Is Farm Owner',
                'type' => 'boolean',
                'values' => [['value' => '1', 'label' => 'Yes'], ['value' => '0', 'label' => 'No']],
            ],
            [
                'value' => 'profile.farm_area',
                'label' => 'Farm Area (hectares)',
                'type' => 'number',
                'values' => null,
            ],
            
            // Government Support (from farmer_profiles)
            [
                'value' => 'profile.has_government_support',
                'label' => 'Has Government Support',
                'type' => 'boolean',
                'values' => [['value' => '1', 'label' => 'Yes'], ['value' => '0', 'label' => 'No']],
            ],
            [
                'value' => 'profile.government_support_details',
                'label' => 'Government Support Details',
                'type' => 'string',
                'values' => null,
            ],
            
            // Organization Membership (from farmer_organization_memberships)
            [
                'value' => 'organization_memberships.organization_id',
                'label' => 'Farmer Organization',
                'type' => 'relation',
                'values' => $organizations,
            ],
            [
                'value' => 'organization_memberships.position',
                'label' => 'Position in Organization',
                'type' => 'string',
                'values' => null,
            ],
        ];
    }
}
