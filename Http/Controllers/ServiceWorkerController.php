<?php

namespace App\Modules\ServiceWorker\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\File;

class ServiceWorkerController extends Controller
{
    /**
     * Return the compiled service worker script that lives inside the module.
     */
    public function script(): Response
    {
        $path = module_path('ServiceWorker', 'Resources/public/sw.js');

        if (! File::exists($path)) {
            abort(404, 'Service worker script not found.');
        }

        return response(File::get($path), 200, [
            'Content-Type'           => 'application/javascript',
            'Service-Worker-Allowed' => '/',
            'Cache-Control'          => 'no-cache, no-store, must-revalidate',
        ]);
    }
}
