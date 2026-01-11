<?php

use Illuminate\Support\Facades\Route;
use App\Modules\ServiceWorker\Http\Controllers\ServiceWorkerController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('serviceworkers', ServiceWorkerController::class)->names('serviceworker');
});
