<?php

use App\Http\Controllers\Api\AiController;
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

        // AI Image Generation Routes (for admin use)
        Route::post('/ai/generate-image', [AiController::class, 'generateImage'])
            ->name('admin.ai.generate-image')
            ->middleware('ai-rate-limit');
        Route::post('/ai/generate-text', [AiController::class, 'generateText'])
            ->name('admin.ai.generate-text')
            ->middleware('ai-rate-limit');

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
