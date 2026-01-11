<?php

namespace App\Modules\ServiceWorker\Providers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\ServiceProvider;

class ServiceWorkerServiceProvider extends ServiceProvider
{
    protected string $moduleName = 'ServiceWorker';

    protected string $moduleNameLower = 'serviceworker';

    public function register(): void
    {
        $this->mergeConfigFrom(module_path($this->moduleName, 'Config/service-worker.php'), 'service-worker');
        $this->mergeConfigFrom(module_path($this->moduleName, 'Config/frontend-cache.php'), 'frontend-cache');

        $this->app->register(EventServiceProvider::class);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(module_path($this->moduleName, 'routes/web.php'));
        $this->registerPublishables();
        $this->ensureBootstrapFilesExist();
    }

    protected function registerPublishables(): void
    {
        $this->publishes([
            module_path($this->moduleName, 'Config/service-worker.php') => config_path('service-worker.php'),
            module_path($this->moduleName, 'Config/frontend-cache.php') => config_path('frontend-cache.php'),
        ], 'serviceworker-config');

        $this->publishes([
            module_path($this->moduleName, 'Resources/js/utils/serviceWorker.js')   => resource_path('js/utils/serviceWorker.js'),
            module_path($this->moduleName, 'Resources/js/config/serviceWorker.js') => resource_path('js/config/serviceWorker.js'),
        ], 'serviceworker-frontend');

        $this->publishes([
            module_path($this->moduleName, 'Resources/public/sw.bootstrap.js') => public_path('sw.js'),
            module_path($this->moduleName, 'Resources/public/sw.js')          => public_path('sw.module.js'),
        ], 'serviceworker-assets');

        $this->publishes([
            module_path($this->moduleName, 'Resources/docs/SERVICE_WORKER_CONFIG.md') => base_path('SERVICE_WORKER_CONFIG.md'),
        ], 'serviceworker-docs');
    }

    protected function ensureBootstrapFilesExist(): void
    {
        $this->copyIfMissing(
            module_path($this->moduleName, 'Resources/docs/SERVICE_WORKER_CONFIG.md'),
            base_path('SERVICE_WORKER_CONFIG.md')
        );

        $this->copyIfMissing(
            module_path($this->moduleName, 'Resources/public/sw.bootstrap.js'),
            public_path('sw.js')
        );
    }

    protected function copyIfMissing(string $source, string $destination): void
    {
        if (File::exists($destination)) {
            return;
        }

        File::ensureDirectoryExists(dirname($destination));
        File::copy($source, $destination);
    }
}
