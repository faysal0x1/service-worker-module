/**
 * Service Worker Registration and Management
 */

import serviceWorkerConfig from '@modules/ServiceWorker/Resources/js/config/serviceWorker.js';

class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.isSupported = 'serviceWorker' in navigator;
        this.config = null;
    }

    /**
     * Initialize with config
     */
    init(inertiaProps = null) {
        this.config = serviceWorkerConfig.initConfig(inertiaProps);
        return this.config;
    }

    /**
     * Register service worker
     */
    async register() {
        // Check if service worker is enabled
        if (!serviceWorkerConfig.isServiceWorkerEnabled()) {
            console.log('Service Worker is disabled in configuration');
            // Unregister any existing service workers
            await this.unregisterAll();
            return false;
        }

        if (!this.isSupported) {
            console.warn('Service Worker not supported');
            return false;
        }

        try {
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('Service Worker registered successfully:', this.registration);

            // Listen for updates
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content is available, notify user
                        this.notifyUpdate();
                    }
                });
            });

            return true;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return false;
        }
    }

    /**
     * Unregister all service workers
     */
    async unregisterAll() {
        if (!this.isSupported) return false;

        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
            console.log('All service workers unregistered');
            return true;
        } catch (error) {
            console.error('Failed to unregister service workers:', error);
            return false;
        }
    }

    /**
     * Unregister service worker
     */
    async unregister() {
        if (!this.registration) return false;

        try {
            const result = await this.registration.unregister();
            console.log('Service Worker unregistered:', result);
            return result;
        } catch (error) {
            console.error('Service Worker unregistration failed:', error);
            return false;
        }
    }

    /**
     * Clear image cache
     */
    async clearImageCache() {
        if (!this.registration || !this.registration.active) {
            console.warn('Service Worker not active');
            return false;
        }

        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data.success);
            };

            this.registration.active.postMessage(
                { type: 'CLEAR_IMAGE_CACHE' },
                [messageChannel.port2]
            );
        });
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        if (!this.registration || !this.registration.active) {
            return { size: 0, maxSize: 0 };
        }

        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data.success ? event.data.stats : { size: 0, maxSize: 0 });
            };

            this.registration.active.postMessage(
                { type: 'GET_CACHE_STATS' },
                [messageChannel.port2]
            );
        });
    }

    /**
     * Notify user about update
     */
    notifyUpdate() {
        // You can customize this notification
        if (confirm('New version available! Reload to update?')) {
            window.location.reload();
        }
    }

    /**
     * Check if service worker is controlling the page
     */
    isControlling() {
        return navigator.serviceWorker.controller !== null;
    }

    /**
     * Wait for service worker to be ready
     */
    async waitForReady() {
        if (!this.isSupported) return false;

        return new Promise((resolve) => {
            if (navigator.serviceWorker.controller) {
                resolve(true);
            } else {
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    resolve(true);
                });
            }
        });
    }

    /**
     * Send config to service worker
     */
    async sendConfigToWorker() {
        if (!this.registration || !this.registration.active) {
            console.warn('Service Worker not active, cannot send config');
            return false;
        }

        const config = serviceWorkerConfig.getConfig();

        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                if (event.data.success) {
                    console.log('Config sent to service worker:', config);
                }
                resolve(event.data.success);
            };

            this.registration.active.postMessage(
                {
                    type: 'UPDATE_CONFIG',
                    config: {
                        cache: config.cache,
                        cacheImages: config.cacheImages,
                        cacheApi: config.cacheApi,
                        maxCacheSize: config.maxCacheSize,
                        cacheVersion: config.cacheVersion,
                    }
                },
                [messageChannel.port2]
            );
        });
    }
}

// Create singleton instance
const serviceWorkerManager = new ServiceWorkerManager();

export default serviceWorkerManager;

// Auto-register on page load (after Inertia app is initialized)
if (typeof window !== 'undefined') {
    // Wait for Inertia to be ready
    window.addEventListener('load', () => {
        // Try to get config from Inertia props if available
        if (window.__inertia?.page?.props?.serviceWorker) {
            serviceWorkerManager.init(window.__inertia.page.props);
        }

        // Register service worker if enabled
        serviceWorkerManager.register();
    });
}
