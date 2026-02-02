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
        // Ensure cache service is available before merging config files
        // This prevents Laravel from trying to resolve 'cache' as a class name
        // if (!$this->app->bound('cache')) {
        //     $this->app->register(\Illuminate\Cache\CacheServiceProvider::class);
        // }

        $this->mergeConfigFrom(__DIR__ . '/../Config/service-worker.php', 'service-worker');
        $this->mergeConfigFrom(__DIR__ . '/../Config/frontend-cache.php', 'frontend-cache');

        $this->app->register(EventServiceProvider::class);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/web.php');
        $this->registerPublishables();
        $this->ensureBootstrapFilesExist();
    }

    protected function registerPublishables(): void
    {
        $this->publishes([
            __DIR__ . '/../Config/service-worker.php' => config_path('service-worker.php'),
            __DIR__ . '/../Config/frontend-cache.php' => config_path('frontend-cache.php'),
        ], 'serviceworker-config');

        $this->publishes([
            __DIR__ . '/../Resources/js/utils/serviceWorker.js'  => resource_path('js/utils/serviceWorker.js'),
            __DIR__ . '/../Resources/js/config/serviceWorker.js' => resource_path('js/config/serviceWorker.js'),
        ], 'serviceworker-frontend');

        $this->publishes([
            __DIR__ . '/../Resources/public/sw.bootstrap.js' => public_path('sw.js'),
            __DIR__ . '/../Resources/public/sw.js'           => public_path('sw.module.js'),
        ], 'serviceworker-assets');

        $this->publishes([
            __DIR__ . '/../Resources/docs/SERVICE_WORKER_CONFIG.md' => base_path('SERVICE_WORKER_CONFIG.md'),
        ], 'serviceworker-docs');
    }

    protected function ensureBootstrapFilesExist(): void
    {
        $this->copyIfMissing(
            __DIR__ . '/../Resources/docs/SERVICE_WORKER_CONFIG.md',
            base_path('SERVICE_WORKER_CONFIG.md')
        );

        $this->copyIfMissing(
            __DIR__ . '/../Resources/public/sw.bootstrap.js',
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
