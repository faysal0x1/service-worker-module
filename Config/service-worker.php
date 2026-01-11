<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Service Worker Configuration
    |--------------------------------------------------------------------------
    |
    | Control whether the service worker is enabled or disabled.
    | When disabled, the service worker will not be registered.
    |
    */

    'enabled'        => env('SERVICE_WORKER_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Control caching behavior:
    | - 'full': Full caching enabled (images, API responses, etc.)
    | - 'partial': Only specific resources cached (e.g., images only)
    | - 'off': No caching at all
    |
    */

    'cache'          => env('SERVICE_WORKER_CACHE', 'full'), // 'full', 'partial', 'off'

    /*
    |--------------------------------------------------------------------------
    | Image Caching
    |--------------------------------------------------------------------------
    |
    | Control whether images should be cached.
    | Only applies when cache is 'full' or 'partial'.
    |
    */

    'cache_images'   => env('SERVICE_WORKER_CACHE_IMAGES', true),

    /*
    |--------------------------------------------------------------------------
    | API Response Caching
    |--------------------------------------------------------------------------
    |
    | Control whether API responses should be cached.
    | Only applies when cache is 'full'.
    |
    */

    'cache_api'      => env('SERVICE_WORKER_CACHE_API', false),

    /*
    |--------------------------------------------------------------------------
    | Maximum Cache Size
    |--------------------------------------------------------------------------
    |
    | Maximum number of items to cache before cleanup.
    |
    */

    'max_cache_size' => env('SERVICE_WORKER_MAX_CACHE_SIZE', 100),

    /*
    |--------------------------------------------------------------------------
    | Cache Version
    |--------------------------------------------------------------------------
    |
    | Cache version for cache invalidation.
    | Increment this to invalidate all caches.
    |
    */

    'cache_version'  => env('SERVICE_WORKER_CACHE_VERSION', '1'),
];