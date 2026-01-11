<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Frontend Category Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Control caching behavior for category data in frontend components
    | (Nav.jsx, MegaMenu.jsx, etc.)
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Enable Frontend Category Cache
    |--------------------------------------------------------------------------
    |
    | When enabled, category data will be cached in localStorage.
    | When disabled, category data will be fetched on every component mount.
    |
    */

    'enabled'     => env('FRONTEND_CATEGORY_CACHE_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Cache Time To Live (TTL)
    |--------------------------------------------------------------------------
    |
    | Maximum cache duration in minutes.
    | Must be between 1 and 5 minutes (enforced).
    | Default: 5 minutes
    |
    */

    'ttl_minutes' => min(5, max(1, (int) env('FRONTEND_CATEGORY_CACHE_TTL', 5))),
];
