/**
 * Service Worker for Image Caching
 * Handles advanced image caching with cache invalidation
 */

// Get config from message or use defaults
let SW_CONFIG = {
    cache: 'full',
    cacheImages: true,
    cacheApi: false,
    maxCacheSize: 100,
    cacheVersion: '1',
};

// Listen for config updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'UPDATE_CONFIG') {
        SW_CONFIG = { ...SW_CONFIG, ...event.data.config };
        console.log('Service Worker config updated:', SW_CONFIG);
    }
});

const CACHE_NAME = `tbz-cache-v${SW_CONFIG.cacheVersion}`;
const IMAGE_CACHE_NAME = `tbz-image-cache-v${SW_CONFIG.cacheVersion}`;
const API_CACHE_NAME = `tbz-api-cache-v${SW_CONFIG.cacheVersion}`;
const MAX_CACHE_SIZE = SW_CONFIG.maxCacheSize || 100;

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Check if caching is enabled
    if (SW_CONFIG.cache === 'off') {
        // No caching - just fetch normally
        return;
    }

    // Handle image requests if image caching is enabled
    if (SW_CONFIG.cacheImages && isImageRequest(request)) {
        event.respondWith(handleImageRequest(request));
        return;
    }

    // Handle API requests if API caching is enabled
    if (SW_CONFIG.cache === 'full' && SW_CONFIG.cacheApi && isApiRequest(request)) {
        event.respondWith(handleApiRequest(request));
        return;
    }
});

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
    return request.destination === 'image' ||
        request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
        request.headers.get('accept')?.includes('image');
}

/**
 * Check if request is for an API endpoint
 */
function isApiRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/web-api/') ||
        request.headers.get('accept')?.includes('application/json');
}

/**
 * Handle API requests with caching
 */
async function handleApiRequest(request) {
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        // Return cached API response
        console.log('Serving cached API response:', request.url);
        return cachedResponse;
    }

    try {
        // Fetch from network
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Clone response for caching
            const responseToCache = networkResponse.clone();

            // Cache the API response
            await cache.put(request, responseToCache);

            // Clean up old cache entries
            await cleanupCache(cache);

            console.log('Cached new API response:', request.url);
        }

        return networkResponse;
    } catch (error) {
        console.error('Failed to fetch API:', request.url, error);

        // Return cached response if available, even if stale
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return error response
        return new Response(JSON.stringify({ error: 'Network error' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle image requests with caching
 */
async function handleImageRequest(request) {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        // Return cached image
        console.log('Serving cached image:', request.url);
        return cachedResponse;
    }

    try {
        // Fetch image from network
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Clone response for caching
            const responseToCache = networkResponse.clone();

            // Cache the image
            await cache.put(request, responseToCache);

            // Clean up old cache entries
            await cleanupCache(cache);

            console.log('Cached new image:', request.url);
        }

        return networkResponse;
    } catch (error) {
        console.error('Failed to fetch image:', request.url, error);

        // Return placeholder image for failed requests
        return new Response(
            '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">Image not available</text></svg>',
            {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=3600'
                }
            }
        );
    }
}

/**
 * Clean up old cache entries
 */
async function cleanupCache(cache) {
    const keys = await cache.keys();

    if (keys.length > MAX_CACHE_SIZE) {
        // Sort by date (oldest first)
        const sortedKeys = await Promise.all(
            keys.map(async (key) => {
                const response = await cache.match(key);
                const date = response?.headers.get('date') || new Date().toISOString();
                return { key, date: new Date(date) };
            })
        );

        sortedKeys.sort((a, b) => a.date - b.date);

        // Delete oldest entries
        const toDelete = sortedKeys.slice(0, keys.length - MAX_CACHE_SIZE);
        await Promise.all(toDelete.map(({ key }) => cache.delete(key)));

        console.log(`Cleaned up ${toDelete.length} old cache entries`);
    }
}

/**
 * Handle messages from main thread
 */
self.addEventListener('message', (event) => {
    // Update config
    if (event.data && event.data.type === 'UPDATE_CONFIG') {
        SW_CONFIG = { ...SW_CONFIG, ...event.data.config };
        console.log('Service Worker config updated:', SW_CONFIG);
        if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ success: true });
        }
        return;
    }

    // Clear image cache
    if (event.data && event.data.type === 'CLEAR_IMAGE_CACHE') {
        event.waitUntil(
            caches.delete(IMAGE_CACHE_NAME).then(() => {
                console.log('Image cache cleared');
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ success: true });
                }
            })
        );
        return;
    }

    // Clear API cache
    if (event.data && event.data.type === 'CLEAR_API_CACHE') {
        event.waitUntil(
            caches.delete(API_CACHE_NAME).then(() => {
                console.log('API cache cleared');
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ success: true });
                }
            })
        );
        return;
    }

    // Clear all caches
    if (event.data && event.data.type === 'CLEAR_ALL_CACHES') {
        event.waitUntil(
            Promise.all([
                caches.delete(IMAGE_CACHE_NAME),
                caches.delete(API_CACHE_NAME),
                caches.delete(CACHE_NAME),
            ]).then(() => {
                console.log('All caches cleared');
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ success: true });
                }
            })
        );
        return;
    }

    // Get cache statistics
    if (event.data && event.data.type === 'GET_CACHE_STATS') {
        event.waitUntil(
            Promise.all([
                caches.open(IMAGE_CACHE_NAME).then(cache => cache.keys()),
                caches.open(API_CACHE_NAME).then(cache => cache.keys()).catch(() => []),
            ]).then(([imageKeys, apiKeys]) => {
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({
                        success: true,
                        stats: {
                            images: {
                                size: imageKeys.length,
                                maxSize: MAX_CACHE_SIZE
                            },
                            api: {
                                size: apiKeys.length,
                                maxSize: MAX_CACHE_SIZE
                            },
                            total: imageKeys.length + apiKeys.length
                        }
                    });
                }
            })
        );
        return;
    }
});
