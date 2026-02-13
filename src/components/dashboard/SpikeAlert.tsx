'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { detectSpike } from '@/lib/api/pathwayClient'
import { AlertTriangle, X } from 'lucide-react'

export default function SpikeAlert({ lat, lon }: { lat: number, lon: number }) {
    const [alert, setAlert] = useState<{ detected: boolean, severity: number } | null>(null)

    useEffect(() => {
        // Poll for spikes every 30s
        const poll = async () => {
            const res = await detectSpike(lat, lon)
            if (res.spike_detected) {
                setAlert({ detected: true, severity: res.severity })
            } else {
                setAlert(null)
            }
        }

        poll()
        const interval = setInterval(poll, 30000)
        return () => clearInterval(interval)
    }, [lat, lon])

    if (!alert) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative overflow-hidden rounded-xl border border-red-500/50 bg-red-900/40 p-4 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
            >
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.1)_10px,rgba(220,38,38,0.1)_20px)] animate-[pulse_2s_infinite]" />

                <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 bg-red-500 rounded-lg animate-pulse shadow-lg shadow-red-500/50">
                        <AlertTriangle className="text-white w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-red-400 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                            Critical Warning
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        </h3>
                        <p className="text-white text-xs mt-1 font-bold">
                            Sudden AQI Spike Detected (Severity: {alert.severity.toFixed(1)}x)
                        </p>
                        <p className="text-white/60 text-[10px] mt-2 font-mono">
                            Redirecting recommended. Minimize outdoor exposure immediately.
                        </p>
                    </div>
                    <button
                        onClick={() => setAlert(null)}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
