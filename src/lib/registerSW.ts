/**
 * AEROVITAL NAVIGATOR - Service Worker Registration
 * Registers the PWA service worker for offline support and push notifications
 */

export function registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.log('Service Workers not supported');
        return;
    }

    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('✅ Service Worker registered:', registration.scope);

            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60000); // Check every minute

            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker available
                        console.log('🔄 New version available! Reload to update.');

                        // Optionally show a toast notification
                        if (confirm('New version available! Reload to update?')) {
                            window.location.reload();
                        }
                    }
                });
            });

        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    });
}

// Auto-register on import
if (typeof window !== 'undefined') {
    registerServiceWorker();
}
