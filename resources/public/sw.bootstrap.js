/**
 * Bootstrap for the modular service worker.
 * The actual implementation lives inside the ServiceWorker module so that
 * it can be packaged and reused across projects.
 */

(async () => {
    try {
        importScripts('/service-worker-module/sw.js');
    } catch (error) {
        console.error('Failed to load modular service worker', error);
    }
})();

