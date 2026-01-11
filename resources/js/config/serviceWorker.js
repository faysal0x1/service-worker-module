/**
 * Service Worker Configuration
 * Loaded from backend via Inertia props or defaults
 */

let config = {
    enabled: false,
    cache: 'full', // 'full', 'partial', 'off'
    cacheImages: true,
    cacheApi: false,
    maxCacheSize: 100,
    cacheVersion: '1',
};

/**
 * Initialize config from Inertia props or window
 */
export function initConfig(inertiaProps = null) {
    if (inertiaProps?.serviceWorker) {
        config = {
            enabled: inertiaProps.serviceWorker.enabled ?? false,
            cache: inertiaProps.serviceWorker.cache ?? 'full',
            cacheImages: inertiaProps.serviceWorker.cacheImages ?? true,
            cacheApi: inertiaProps.serviceWorker.cacheApi ?? false,
            maxCacheSize: inertiaProps.serviceWorker.maxCacheSize ?? 100,
            cacheVersion: inertiaProps.serviceWorker.cacheVersion ?? '1',
        };
    } else if (typeof window !== 'undefined' && window.serviceWorkerConfig) {
        config = { ...config, ...window.serviceWorkerConfig };
    }

    return config;
}

/**
 * Get current config
 */
export function getConfig() {
    return { ...config };
}

/**
 * Check if service worker is enabled
 */
export function isServiceWorkerEnabled() {
    return config.enabled === true;
}

/**
 * Check if caching is enabled
 */
export function isCachingEnabled() {
    return config.cache !== 'off';
}

/**
 * Check if image caching is enabled
 */
export function isImageCachingEnabled() {
    return isCachingEnabled() && config.cacheImages === true;
}

/**
 * Check if API caching is enabled
 */
export function isApiCachingEnabled() {
    return config.cache === 'full' && config.cacheApi === true;
}

/**
 * Get cache mode
 */
export function getCacheMode() {
    return config.cache;
}

export default {
    initConfig,
    getConfig,
    isServiceWorkerEnabled,
    isCachingEnabled,
    isImageCachingEnabled,
    isApiCachingEnabled,
    getCacheMode,
};

