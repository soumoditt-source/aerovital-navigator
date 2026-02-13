'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, X, MapPin, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAtmosphereStore } from '@/stores/atmosphereStore';

interface EmergencyContact {
    name: string;
    phone: string;
}

export default function EmergencySOS() {
    const [showModal, setShowModal] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [contacts, setContacts] = useState<EmergencyContact[]>([
        { name: 'Emergency Services', phone: '112' }
    ]);
    const { aqi, pm25, temperature } = useAtmosphereStore();

    const sendSOS = async () => {
        setIsSending(true);

        try {
            // Get current location
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000
                });
            });

            const { latitude, longitude } = position.coords;
            const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

            // Prepare emergency message
            const message = `🚨 AEROVITAL EMERGENCY ALERT 🚨

Medical Emergency Detected!

📍 Location: ${locationUrl}
🌬️ Current AQI: ${aqi}
💨 PM2.5: ${pm25} µg/m³
🌡️ Temperature: ${temperature}°C

⚠️ This person may be experiencing respiratory distress or cardiac symptoms due to severe air pollution.

Time: ${new Date().toLocaleString()}

Please respond immediately or call emergency services.`;

            // In a real app, this would send SMS via Twilio or similar
            // For now, we'll use Web Share API or copy to clipboard

            if (navigator.share) {
                await navigator.share({
                    title: '🚨 AeroVital Emergency Alert',
                    text: message
                });
                toast.success('Emergency alert sent!');
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(message);
                toast.success('Emergency message copied to clipboard! Share it with your contacts.');
            }

            // Also try to make a phone call to emergency services
            if (confirm('Call emergency services (112)?')) {
                window.location.href = 'tel:112';
            }

            setShowModal(false);
        } catch (error) {
            console.error('SOS error:', error);
            toast.error('Failed to send SOS. Please call emergency services directly.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            {/* SOS Button - Always visible */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="fixed bottom-24 right-6 z-[60] h-16 w-16 rounded-full bg-red-600 text-white shadow-2xl flex items-center justify-center border-4 border-white/20 hover:bg-red-700 transition-colors"
                title="Emergency SOS"
            >
                <AlertTriangle size={28} className="animate-pulse" />
            </motion.button>

            {/* SOS Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => !isSending && setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20"
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                                disabled={isSending}
                            >
                                <X size={24} className="text-white" />
                            </button>

                            <div className="text-center mb-6">
                                <div className="inline-flex p-4 bg-white/10 rounded-full mb-4">
                                    <AlertTriangle size={48} className="text-white animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2">
                                    EMERGENCY SOS
                                </h2>
                                <p className="text-white/80">
                                    Send immediate alert to emergency contacts with your location and health status
                                </p>
                            </div>

                            {/* Current Status */}
                            <div className="bg-white/10 rounded-2xl p-4 mb-6 space-y-2">
                                <div className="flex items-center justify-between text-white">
                                    <span className="flex items-center gap-2">
                                        <MapPin size={18} />
                                        Location
                                    </span>
                                    <span className="font-mono">GPS Active</span>
                                </div>
                                <div className="flex items-center justify-between text-white">
                                    <span className="flex items-center gap-2">
                                        <Heart size={18} />
                                        AQI Level
                                    </span>
                                    <span className="font-mono font-bold">{aqi}</span>
                                </div>
                                <div className="flex items-center justify-between text-white">
                                    <span className="flex items-center gap-2">
                                        <Phone size={18} />
                                        Emergency Line
                                    </span>
                                    <span className="font-mono">112</span>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
                                <p className="text-yellow-100 text-sm">
                                    ⚠️ This will share your exact location and health data with emergency contacts. Only use in genuine emergencies.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={sendSOS}
                                    disabled={isSending}
                                    className="w-full bg-white text-red-600 font-black py-4 px-6 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                >
                                    {isSending ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                            Sending Alert...
                                        </span>
                                    ) : (
                                        'SEND EMERGENCY ALERT'
                                    )}
                                </button>

                                <button
                                    onClick={() => window.location.href = 'tel:112'}
                                    className="w-full bg-white/10 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <Phone size={18} />
                                        Call 112 Directly
                                    </span>
                                </button>
                            </div>

                            <p className="text-white/60 text-xs text-center mt-4">
                                For medical emergencies, always call professional emergency services
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
