<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\LanguageController;
use App\Http\Controllers\Api\V1\VideoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - PlayDub V1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public authentication routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Public reference routes
    Route::get('/languages', [LanguageController::class, 'index']);

    // Protected routes (Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Video Projects & Dubbing API
        Route::get('/videos', [VideoController::class, 'index']);
        Route::post('/videos', [VideoController::class, 'store']);
        Route::get('/videos/{video}', [VideoController::class, 'show']);
        Route::get('/videos/{video}/transcript', [VideoController::class, 'transcript']);
        Route::delete('/videos/{video}', [VideoController::class, 'destroy']);
        Route::post('/videos/{video}/dub', [VideoController::class, 'dub']);

        // Dub status & control
        Route::get('/dubs/{dub}/status', [VideoController::class, 'dubStatus']);
        Route::post('/dubs/{dub}/retry', [VideoController::class, 'retryDub']);
    });
});
