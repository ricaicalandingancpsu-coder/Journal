<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EntryController;
use App\Http\Controllers\Api\MemoryController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:20,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::put('/profile/preferences', [ProfileController::class, 'updatePreferences']);

    Route::get('/dashboard', [DashboardController::class, 'show']);
    Route::get('/calendar', [CalendarController::class, 'index']);

    Route::apiResource('entries', EntryController::class);
    Route::get('/entries/{entry}/cover', [EntryController::class, 'cover']);

    Route::get('/tags', [TagController::class, 'index']);
    Route::delete('/tags/{tag}', [TagController::class, 'destroy']);

    Route::apiResource('memories', MemoryController::class)->except('show');
    Route::get('/memories/{memory}/image', [MemoryController::class, 'image']);
});
