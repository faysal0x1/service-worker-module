# Service Worker Module

Reusable `nwidart/laravel-modules` package that ships:

- A production-ready `sw.js` implementation with image/API caching helpers
- Frontend utilities (`resources/js/utils/serviceWorker.js` + config helper)
- Publishable config files (`config/service-worker.php`, `config/frontend-cache.php`)
- Documentation (`SERVICE_WORKER_CONFIG.md`)

## Installation

```bash
composer require faysal0x1/service-worker-module
php artisan module:enable ServiceWorker
```

## Publish assets

```bash
# Config + docs
php artisan vendor:publish --provider="App\Modules\ServiceWorker\Providers\ServiceWorkerServiceProvider" --tag=serviceworker-config
php artisan vendor:publish --provider="App\Modules\ServiceWorker\Providers\ServiceWorkerServiceProvider" --tag=serviceworker-docs

# Frontend helpers
php artisan vendor:publish --provider="App\Modules\ServiceWorker\Providers\ServiceWorkerServiceProvider" --tag=serviceworker-frontend

# Optional: publish the service worker bootstrap + standalone worker file
php artisan vendor:publish --provider="App\Modules\ServiceWorker\Providers\ServiceWorkerServiceProvider" --tag=serviceworker-assets
```

## Frontend usage

```javascript
import serviceWorkerManager from '@/utils/serviceWorker';

serviceWorkerManager.init(page.props);
serviceWorkerManager.register();
```

The manager automatically shares configuration via Inertia props and exposes helpers
for clearing caches, pushing config updates, etc.

## Service worker route

The module registers `GET /service-worker-module/sw.js`, which serves the worker code.
The published `public/sw.js` bootstrap simply `importScripts` this route, so the worker
always stays in sync with the module.

