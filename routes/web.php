<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        
        // Redirect based on user role
        if ($user->role && $user->role->name === 'super admin') {
            return Inertia::render('super_admin/dashboard');
        } elseif ($user->role && $user->role->name === 'admin') {
            return Inertia::render('admin/dashboard');
        } else {
            return Inertia::render('technician/dashboard');
        }
    })->name('dashboard');

    // Admin Routes
    Route::prefix('admin')->middleware('auth')->group(function () {
        Route::get('/categories', [App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('admin.categories');
        Route::post('/categories', [App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('admin.categories.store');
        Route::put('/categories/{category}', [App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('admin.categories.update');
        Route::delete('/categories/{category}', [App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('admin.categories.destroy');

        Route::get('/commodities', [App\Http\Controllers\Admin\CommodityController::class, 'index'])->name('admin.commodities');
        Route::post('/commodities', [App\Http\Controllers\Admin\CommodityController::class, 'store'])->name('admin.commodities.store');
        Route::put('/commodities/{commodity}', [App\Http\Controllers\Admin\CommodityController::class, 'update'])->name('admin.commodities.update');
        Route::delete('/commodities/{commodity}', [App\Http\Controllers\Admin\CommodityController::class, 'destroy'])->name('admin.commodities.destroy');

        Route::get('/varieties', [App\Http\Controllers\Admin\VarietyController::class, 'index'])->name('admin.varieties');
        Route::post('/varieties', [App\Http\Controllers\Admin\VarietyController::class, 'store'])->name('admin.varieties.store');
        Route::put('/varieties/{variety}', [App\Http\Controllers\Admin\VarietyController::class, 'update'])->name('admin.varieties.update');
        Route::delete('/varieties/{variety}', [App\Http\Controllers\Admin\VarietyController::class, 'destroy'])->name('admin.varieties.destroy');

        // Farmer Routes
        Route::get('/farmers', [App\Http\Controllers\Admin\FarmerController::class, 'index'])->name('admin.farmers');
        Route::get('/farmers/{farmer}', [App\Http\Controllers\Admin\FarmerController::class, 'show'])->name('admin.farmers.show');
        Route::post('/farmers', [App\Http\Controllers\Admin\FarmerController::class, 'store'])->name('admin.farmers.store');
        Route::put('/farmers/{farmer}', [App\Http\Controllers\Admin\FarmerController::class, 'update'])->name('admin.farmers.update');
        Route::delete('/farmers/{farmer}', [App\Http\Controllers\Admin\FarmerController::class, 'destroy'])->name('admin.farmers.destroy');

        // Farm Routes
        Route::get('/farms', [App\Http\Controllers\Admin\FarmController::class, 'index'])->name('admin.farms');
        Route::get('/farms/{farm}', [App\Http\Controllers\Admin\FarmController::class, 'show'])->name('admin.farms.show');

        // Program Routes
        Route::get('/programs', [App\Http\Controllers\Admin\ProgramController::class, 'index'])->name('admin.programs');
        Route::post('/programs', [App\Http\Controllers\Admin\ProgramController::class, 'store'])->name('admin.programs.store');
        Route::put('/programs/{program}', [App\Http\Controllers\Admin\ProgramController::class, 'update'])->name('admin.programs.update');
        Route::delete('/programs/{program}', [App\Http\Controllers\Admin\ProgramController::class, 'destroy'])->name('admin.programs.destroy');

        // Funding Source Routes
        Route::get('/funding-sources', [App\Http\Controllers\Admin\FundingSourceController::class, 'index'])->name('admin.funding-sources');
        Route::post('/funding-sources', [App\Http\Controllers\Admin\FundingSourceController::class, 'store'])->name('admin.funding-sources.store');
        Route::put('/funding-sources/{fundingSource}', [App\Http\Controllers\Admin\FundingSourceController::class, 'update'])->name('admin.funding-sources.update');
        Route::delete('/funding-sources/{fundingSource}', [App\Http\Controllers\Admin\FundingSourceController::class, 'destroy'])->name('admin.funding-sources.destroy');

        // Assistance Category Routes
        Route::get('/assistance-categories', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'index'])->name('admin.assistance-categories');
        Route::get('/assistance-categories/form-data', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'getFormData'])->name('admin.assistance-categories.form-data');
        Route::post('/assistance-categories', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'store'])->name('admin.assistance-categories.store');
        Route::put('/assistance-categories/{assistanceCategory}', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'update'])->name('admin.assistance-categories.update');
        Route::delete('/assistance-categories/{assistanceCategory}', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'destroy'])->name('admin.assistance-categories.destroy');

        // Eligible Barangays Routes
        Route::get('/eligible-barangays', [App\Http\Controllers\Admin\EligibleBarangayController::class, 'index'])->name('admin.eligible-barangays');
        Route::get('/eligible-barangays/form-data', [App\Http\Controllers\Admin\EligibleBarangayController::class, 'getFormData'])->name('admin.eligible-barangays.form-data');
        Route::post('/eligible-barangays', [App\Http\Controllers\Admin\EligibleBarangayController::class, 'store'])->name('admin.eligible-barangays.store');
        Route::delete('/eligible-barangays/{eligibleBarangay}', [App\Http\Controllers\Admin\EligibleBarangayController::class, 'destroy'])->name('admin.eligible-barangays.destroy');

        // Distribution Records Routes (Master List)
        Route::get('/distribution-records', [App\Http\Controllers\Admin\DistributionRecordController::class, 'index'])->name('admin.distribution-records');
        Route::post('/distribution-records', [App\Http\Controllers\Admin\DistributionRecordController::class, 'store'])->name('admin.distribution-records.store');
        Route::put('/distribution-records/{distributionRecord}', [App\Http\Controllers\Admin\DistributionRecordController::class, 'update'])->name('admin.distribution-records.update');
        Route::delete('/distribution-records/{distributionRecord}', [App\Http\Controllers\Admin\DistributionRecordController::class, 'destroy'])->name('admin.distribution-records.destroy');

        // Distribution Record Items Routes (Detailed List)
        Route::get('/distribution-records/{distributionRecord}/items', [App\Http\Controllers\Admin\DistributionRecordItemController::class, 'index'])->name('admin.distribution-records.items');
        Route::post('/distribution-record-items', [App\Http\Controllers\Admin\DistributionRecordItemController::class, 'store'])->name('admin.distribution-record-items.store');
        Route::put('/distribution-record-items/{distributionRecordItem}', [App\Http\Controllers\Admin\DistributionRecordItemController::class, 'update'])->name('admin.distribution-record-items.update');
        Route::delete('/distribution-record-items/{distributionRecordItem}', [App\Http\Controllers\Admin\DistributionRecordItemController::class, 'destroy'])->name('admin.distribution-record-items.destroy');
        Route::get('/distribution-records/{distributionRecord}/export-csv', [App\Http\Controllers\Admin\DistributionRecordItemController::class, 'exportCsv'])->name('admin.distribution-records.export-csv');

        // Acknowledgements Routes
        Route::post('/acknowledgements', [App\Http\Controllers\Admin\AcknowledgementController::class, 'store'])->name('admin.acknowledgements.store');
        Route::put('/acknowledgements/{acknowledgement}', [App\Http\Controllers\Admin\AcknowledgementController::class, 'update'])->name('admin.acknowledgements.update');
        Route::delete('/acknowledgements/{acknowledgement}', [App\Http\Controllers\Admin\AcknowledgementController::class, 'destroy'])->name('admin.acknowledgements.destroy');

        // Eligibility Rules Routes
        Route::get('/eligibility-rules', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'index'])->name('admin.eligibility-rules');
        Route::get('/eligibility-rules/form-data', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'getFormData'])->name('admin.eligibility-rules.form-data');
        Route::post('/eligibility-rules', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'store'])->name('admin.eligibility-rules.store');
        Route::put('/eligibility-rules/{eligibilityRule}', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'update'])->name('admin.eligibility-rules.update');
        Route::delete('/eligibility-rules/{eligibilityRule}', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'destroy'])->name('admin.eligibility-rules.destroy');

        // Distribution Records Routes
        Route::get('/distribution-records', [App\Http\Controllers\Admin\DistributionRecordController::class, 'index'])->name('admin.distribution-records');
        Route::get('/distribution-records/form-data', [App\Http\Controllers\Admin\DistributionRecordController::class, 'getFormData'])->name('admin.distribution-records.form-data');
        Route::post('/distribution-records', [App\Http\Controllers\Admin\DistributionRecordController::class, 'store'])->name('admin.distribution-records.store');
        Route::put('/distribution-records/{distributionRecord}', [App\Http\Controllers\Admin\DistributionRecordController::class, 'update'])->name('admin.distribution-records.update');
        Route::delete('/distribution-records/{distributionRecord}', [App\Http\Controllers\Admin\DistributionRecordController::class, 'destroy'])->name('admin.distribution-records.destroy');

        // Allocation Policies Routes
        Route::get('/allocation-policies', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'index'])->name('admin.allocation-policies');
        Route::get('/allocation-policies/form-data', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'getFormData'])->name('admin.allocation-policies.form-data');
        Route::post('/allocation-policies', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'store'])->name('admin.allocation-policies.store');
        Route::put('/allocation-policies/{allocationPolicy}', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'update'])->name('admin.allocation-policies.update');
        Route::delete('/allocation-policies/{allocationPolicy}', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'destroy'])->name('admin.allocation-policies.destroy');

        // Organization Routes
        Route::get('/organizations', [App\Http\Controllers\Admin\OrganizationController::class, 'index'])->name('admin.organizations');
        Route::post('/organizations', [App\Http\Controllers\Admin\OrganizationController::class, 'store'])->name('admin.organizations.store');
        Route::put('/organizations/{organization}', [App\Http\Controllers\Admin\OrganizationController::class, 'update'])->name('admin.organizations.update');
        Route::delete('/organizations/{organization}', [App\Http\Controllers\Admin\OrganizationController::class, 'destroy'])->name('admin.organizations.destroy');

        // Damage Category Routes
        Route::get('/damage-categories', [App\Http\Controllers\Admin\DamageCategoryController::class, 'index'])->name('admin.damage-categories');
        Route::post('/damage-categories', [App\Http\Controllers\Admin\DamageCategoryController::class, 'store'])->name('admin.damage-categories.store');
        Route::put('/damage-categories/{damageCategory}', [App\Http\Controllers\Admin\DamageCategoryController::class, 'update'])->name('admin.damage-categories.update');
        Route::delete('/damage-categories/{damageCategory}', [App\Http\Controllers\Admin\DamageCategoryController::class, 'destroy'])->name('admin.damage-categories.destroy');

        // Damage Type Routes
        Route::get('/damage-types', [App\Http\Controllers\Admin\DamageTypeController::class, 'index'])->name('admin.damage-types');
        Route::post('/damage-types', [App\Http\Controllers\Admin\DamageTypeController::class, 'store'])->name('admin.damage-types.store');
        Route::put('/damage-types/{damageType}', [App\Http\Controllers\Admin\DamageTypeController::class, 'update'])->name('admin.damage-types.update');
        Route::delete('/damage-types/{damageType}', [App\Http\Controllers\Admin\DamageTypeController::class, 'destroy'])->name('admin.damage-types.destroy');

        // Crop Damage Records Routes (Folders)
        Route::get('/crop-damage-records', [App\Http\Controllers\Admin\CropDamageRecordController::class, 'index'])->name('admin.crop-damage-records');
        Route::get('/crop-damage-records/{cropDamageRecord}', [App\Http\Controllers\Admin\CropDamageRecordController::class, 'show'])->name('admin.crop-damage-records.show');
        Route::post('/crop-damage-records', [App\Http\Controllers\Admin\CropDamageRecordController::class, 'store'])->name('admin.crop-damage-records.store');
        Route::put('/crop-damage-records/{cropDamageRecord}', [App\Http\Controllers\Admin\CropDamageRecordController::class, 'update'])->name('admin.crop-damage-records.update');
        Route::delete('/crop-damage-records/{cropDamageRecord}', [App\Http\Controllers\Admin\CropDamageRecordController::class, 'destroy'])->name('admin.crop-damage-records.destroy');

        // Crop Damage Record Items Routes (Files inside folders)
        Route::post('/crop-damage-records/{cropDamageRecord}/items', [App\Http\Controllers\Admin\CropDamageRecordItemController::class, 'store'])->name('admin.crop-damage-record-items.store');
        Route::put('/crop-damage-record-items/{cropDamageRecordItem}', [App\Http\Controllers\Admin\CropDamageRecordItemController::class, 'update'])->name('admin.crop-damage-record-items.update');
        Route::delete('/crop-damage-record-items/{cropDamageRecordItem}', [App\Http\Controllers\Admin\CropDamageRecordItemController::class, 'destroy'])->name('admin.crop-damage-record-items.destroy');

        // Crop Monitoring Categories Routes
        Route::get('/monitoring-categories', [App\Http\Controllers\Admin\CropMonitoringCategoryController::class, 'index'])->name('admin.monitoring-categories.index');
        Route::post('/monitoring-categories', [App\Http\Controllers\Admin\CropMonitoringCategoryController::class, 'store'])->name('admin.monitoring-categories.store');
        Route::put('/monitoring-categories/{category}', [App\Http\Controllers\Admin\CropMonitoringCategoryController::class, 'update'])->name('admin.monitoring-categories.update');
        Route::delete('/monitoring-categories/{category}', [App\Http\Controllers\Admin\CropMonitoringCategoryController::class, 'destroy'])->name('admin.monitoring-categories.destroy');

        // Crop Monitoring Folders Routes
        Route::get('/monitoring-folders', [App\Http\Controllers\Admin\CropMonitoringFolderController::class, 'index'])->name('admin.monitoring-folders.index');
        Route::get('/monitoring-folders/{cropMonitoringFolder}', [App\Http\Controllers\Admin\CropMonitoringFolderController::class, 'show'])->name('admin.monitoring-folders.show');
        Route::post('/monitoring-folders', [App\Http\Controllers\Admin\CropMonitoringFolderController::class, 'store'])->name('admin.monitoring-folders.store');
        Route::put('/monitoring-folders/{folder}', [App\Http\Controllers\Admin\CropMonitoringFolderController::class, 'update'])->name('admin.monitoring-folders.update');
        Route::delete('/monitoring-folders/{folder}', [App\Http\Controllers\Admin\CropMonitoringFolderController::class, 'destroy'])->name('admin.monitoring-folders.destroy');

        // Crop Monitoring Items (Timeline Entries) Routes
        Route::post('/monitoring-folders/{folder}/items', [App\Http\Controllers\Admin\CropMonitoringItemController::class, 'store'])->name('admin.monitoring-items.store');
        Route::put('/monitoring-items/{item}', [App\Http\Controllers\Admin\CropMonitoringItemController::class, 'update'])->name('admin.monitoring-items.update');
        Route::delete('/monitoring-items/{item}', [App\Http\Controllers\Admin\CropMonitoringItemController::class, 'destroy'])->name('admin.monitoring-items.destroy');

        // Unit of Measure Routes
        Route::get('/unit-of-measures', [App\Http\Controllers\Admin\UnitOfMeasureController::class, 'index'])->name('admin.unit-of-measures');
        Route::post('/unit-of-measures', [App\Http\Controllers\Admin\UnitOfMeasureController::class, 'store'])->name('admin.unit-of-measures.store');
        Route::put('/unit-of-measures/{unitOfMeasure}', [App\Http\Controllers\Admin\UnitOfMeasureController::class, 'update'])->name('admin.unit-of-measures.update');
        Route::delete('/unit-of-measures/{unitOfMeasure}', [App\Http\Controllers\Admin\UnitOfMeasureController::class, 'destroy'])->name('admin.unit-of-measures.destroy');

        // Allocation Type Routes
        Route::get('/allocation-types', [App\Http\Controllers\Admin\AllocationTypeController::class, 'index'])->name('admin.allocation-types');
        Route::get('/allocation-types/form-data', [App\Http\Controllers\Admin\AllocationTypeController::class, 'getFormData'])->name('admin.allocation-types.form-data');
        Route::post('/allocation-types', [App\Http\Controllers\Admin\AllocationTypeController::class, 'store'])->name('admin.allocation-types.store');
        Route::put('/allocation-types/{allocationType}', [App\Http\Controllers\Admin\AllocationTypeController::class, 'update'])->name('admin.allocation-types.update');
        Route::delete('/allocation-types/{allocationType}', [App\Http\Controllers\Admin\AllocationTypeController::class, 'destroy'])->name('admin.allocation-types.destroy');

        // Farmer Eligibility Routes
        Route::get('/farmer-eligibilities', [App\Http\Controllers\Admin\FarmerEligibilityController::class, 'index'])->name('admin.farmer-eligibilities');
        Route::post('/farmer-eligibilities', [App\Http\Controllers\Admin\FarmerEligibilityController::class, 'store'])->name('admin.farmer-eligibilities.store');
        Route::put('/farmer-eligibilities/{farmerEligibility}', [App\Http\Controllers\Admin\FarmerEligibilityController::class, 'update'])->name('admin.farmer-eligibilities.update');
        Route::delete('/farmer-eligibilities/{farmerEligibility}', [App\Http\Controllers\Admin\FarmerEligibilityController::class, 'destroy'])->name('admin.farmer-eligibilities.destroy');
    });

    // Super Admin Routes
    Route::prefix('super-admin')->middleware('super-admin')->group(function () {
        Route::get('/users', [App\Http\Controllers\SuperAdmin\UserManagementController::class, 'index'])->name('super-admin.users');
        Route::get('/users/{user}', [App\Http\Controllers\SuperAdmin\UserManagementController::class, 'show'])->name('super-admin.users.show');
        Route::post('/users/{user}/status', [App\Http\Controllers\SuperAdmin\UserManagementController::class, 'updateStatus'])->name('super-admin.users.status');
        
        // Session Monitoring Routes
        Route::get('/sessions', [App\Http\Controllers\SuperAdmin\SessionController::class, 'index'])->name('super-admin.sessions');
        Route::delete('/sessions/{session}', [App\Http\Controllers\SuperAdmin\SessionController::class, 'destroy'])->name('super-admin.sessions.destroy');
        Route::post('/sessions/user/{userId}/terminate-all', [App\Http\Controllers\SuperAdmin\SessionController::class, 'terminateUserSessions'])->name('super-admin.sessions.terminate-user');
        Route::post('/sessions/terminate-others', [App\Http\Controllers\SuperAdmin\SessionController::class, 'terminateAllOtherSessions'])->name('super-admin.sessions.terminate-others');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
