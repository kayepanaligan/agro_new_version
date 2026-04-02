<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FarmerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will be
| assigned to the api middleware group.
|
*/

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Farmer routes
    Route::apiResource('farmers', FarmerController::class);
    
    // Additional farmer-specific routes
    Route::get('/farmers/{farmer}/profile', [FarmerController::class, 'profile']);
    Route::put('/farmers/{farmer}/profile', [FarmerController::class, 'updateProfile']);
});
