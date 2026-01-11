<?php

use App\Modules\ServiceWorker\Http\Controllers\ServiceWorkerController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function () {
    Route::get('/service-worker-module/sw.js', [ServiceWorkerController::class, 'script'])
        ->name('serviceworker.script');
});
