'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (globalThis.window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Listen for install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show prompt after 10 seconds (don't be annoying immediately)
            setTimeout(() => {
                setShowPrompt(true);
            }, 10000);
        };

        globalThis.window.addEventListener('beforeinstallprompt', handler);

        // Listen for successful install
        globalThis.window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
        });

        return () => {
            globalThis.window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show install prompt
        deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted install');
        }

        // Clear prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Don't show again for 7 days
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    // Don't show if already installed or dismissed recently
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedTime = Number.parseInt(dismissed, 10);
            const daysSince = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) {
                setShowPrompt(false);
            }
        }
    }, []);

    if (isInstalled || !deferredPrompt) return null;

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[70]"
                >
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-2xl border border-white/20">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={18} className="text-white" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <Smartphone size={24} className="text-white" />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg mb-1">
                                    Install AeroVital
                                </h3>
                                <p className="text-white/80 text-sm mb-4">
                                    Get instant pollution alerts, work offline, and access the app faster from your home screen.
                                </p>

                                <button
                                    onClick={handleInstall}
                                    className="w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    Install App
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
