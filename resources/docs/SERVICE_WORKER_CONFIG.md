# Service Worker & Cache Configuration

This document explains how to configure the Service Worker and caching system.

## Configuration File

The configuration is located at `config/service-worker.php` and can be controlled via environment variables in your `.env` file.

## Environment Variables

Add these to your `.env` file:

```env
# Service Worker - Enable/Disable
SERVICE_WORKER_ENABLED=true

# Cache Mode: 'full', 'partial', or 'off'
SERVICE_WORKER_CACHE=full

# Image Caching (only applies when cache is 'full' or 'partial')
SERVICE_WORKER_CACHE_IMAGES=true

# API Response Caching (only applies when cache is 'full')
SERVICE_WORKER_CACHE_API=false

# Maximum Cache Size (number of items)
SERVICE_WORKER_MAX_CACHE_SIZE=100

# Cache Version (increment to invalidate all caches)
SERVICE_WORKER_CACHE_VERSION=1
```

## Configuration Options

### Service Worker Enabled
- **`SERVICE_WORKER_ENABLED=true`**: Service worker is registered and active
- **`SERVICE_WORKER_ENABLED=false`**: Service worker is completely disabled, any existing service workers will be unregistered

### Cache Mode

#### `full` - Full Caching
- Images are cached (if `SERVICE_WORKER_CACHE_IMAGES=true`)
- API responses are cached (if `SERVICE_WORKER_CACHE_API=true`)
- Maximum performance, uses more storage

#### `partial` - Partial Caching
- Only images are cached (if `SERVICE_WORKER_CACHE_IMAGES=true`)
- API responses are NOT cached
- Balanced performance and storage usage

#### `off` - No Caching
- No caching at all
- Service worker still runs but doesn't cache anything
- Useful for development or when you want service worker features without caching

## Usage Examples

### Example 1: Disable Service Worker Completely
```env
SERVICE_WORKER_ENABLED=false
```

### Example 2: Service Worker On, But No Caching
```env
SERVICE_WORKER_ENABLED=true
SERVICE_WORKER_CACHE=off
```

### Example 3: Service Worker On, Only Image Caching
```env
SERVICE_WORKER_ENABLED=true
SERVICE_WORKER_CACHE=partial
SERVICE_WORKER_CACHE_IMAGES=true
```

### Example 4: Service Worker On, Full Caching (Default)
```env
SERVICE_WORKER_ENABLED=true
SERVICE_WORKER_CACHE=full
SERVICE_WORKER_CACHE_IMAGES=true
SERVICE_WORKER_CACHE_API=false
```

### Example 5: Full Caching Including API
```env
SERVICE_WORKER_ENABLED=true
SERVICE_WORKER_CACHE=full
SERVICE_WORKER_CACHE_IMAGES=true
SERVICE_WORKER_CACHE_API=true
```

## Cache Invalidation

To invalidate all caches, increment the `SERVICE_WORKER_CACHE_VERSION`:

```env
SERVICE_WORKER_CACHE_VERSION=2
```

This will create new cache names and old caches will be automatically cleaned up.

## Programmatic Control

The configuration is automatically passed to the frontend via Inertia.js props. You can also access it programmatically:

```javascript
import serviceWorkerConfig from '@/config/serviceWorker';

// Check if service worker is enabled
if (serviceWorkerConfig.isServiceWorkerEnabled()) {
    // Service worker is enabled
}

// Check if caching is enabled
if (serviceWorkerConfig.isCachingEnabled()) {
    // Caching is enabled
}

// Check if image caching is enabled
if (serviceWorkerConfig.isImageCachingEnabled()) {
    // Image caching is enabled
}

// Get cache mode
const cacheMode = serviceWorkerConfig.getCacheMode(); // 'full', 'partial', or 'off'
```

## Service Worker Manager

```javascript
import serviceWorkerManager from '@/utils/serviceWorker';

// Initialize with Inertia props
serviceWorkerManager.init(inertiaProps);

// Register service worker
await serviceWorkerManager.register();

// Unregister all service workers
await serviceWorkerManager.unregisterAll();

// Clear image cache
await serviceWorkerManager.clearImageCache();

// Get cache statistics
const stats = await serviceWorkerManager.getCacheStats();
```

## Notes

- Changes to `.env` require a server restart to take effect
- Cache version changes will invalidate all existing caches
- When service worker is disabled, all existing service workers are automatically unregistered
- The configuration is shared with the service worker via message passing

