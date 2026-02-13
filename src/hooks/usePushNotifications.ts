/**
 * AEROVITAL NAVIGATOR - Push Notification Manager
 * Handles browser push notification permissions and subscriptions
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if push notifications are supported
        if ('Notification' in globalThis && 'serviceWorker' in navigator && 'PushManager' in globalThis) {
            setIsSupported(true);
            setPermission(Notification.permission);

            // Get existing subscription
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(sub => {
                    setSubscription(sub);
                });
            });
        }
    }, []);

    const requestPermission = async () => {
        if (!isSupported) {
            toast.error('Push notifications not supported in this browser');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                toast.success('Notifications enabled! You\'ll receive pollution alerts.');
                await subscribe();
                return true;
            } else if (result === 'denied') {
                toast.error('Notification permission denied');
                return false;
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            toast.error('Failed to enable notifications');
            return false;
        }
        return false;
    };

    const subscribe = async () => {
        if (!isSupported || permission !== 'granted') {
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            // VAPID public key (you would generate this for production)
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
                'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrEcxaEPOTbKWm1kJOg6UOpZRsu-a8mnNcNJGxJmGMxJXqLCCBU';

            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey as any
            });

            setSubscription(sub);

            // Send subscription to your backend (if you have one)
            // await fetch('/api/push/subscribe', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(sub)
            // });

            console.log('Push subscription successful:', sub);
            return sub;
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            toast.error('Failed to subscribe to notifications');
            return null;
        }
    };

    const unsubscribe = async () => {
        if (!subscription) return;

        try {
            await subscription.unsubscribe();
            setSubscription(null);
            toast.success('Notifications disabled');
        } catch (error) {
            console.error('Error unsubscribing:', error);
            toast.error('Failed to unsubscribe');
        }
    };

    const sendTestNotification = async (title: string, body: string, data?: any) => {
        if (permission !== 'granted') {
            toast.error('Please enable notifications first');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await (registration as any).showNotification(title, {
                body,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                vibrate: [200, 100, 200],
                data: data || {},
                actions: [
                    { action: 'view', title: 'View' },
                    { action: 'dismiss', title: 'Dismiss' }
                ]
            } as any);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    };

    return {
        isSupported,
        permission,
        subscription,
        requestPermission,
        subscribe,
        unsubscribe,
        sendTestNotification
    };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replaceAll('-', '+')
        .replaceAll('_', '/');

    const rawData = globalThis.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.codePointAt(i) || 0;
    }
    return outputArray;
}
