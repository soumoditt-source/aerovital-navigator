'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { detectSpike } from '@/lib/api/pathwayClient'

export default function SpikeAlert({ lat, lon }: { lat: number, lon: number }) {
    const [spike, setSpike] = useState<{ detected: boolean, severity: number } | null>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Poll for spikes every 5 minutes
        const checkSpike = async () => {
            const result = await detectSpike(lat, lon)
            if (result?.success && result.spike_detected) {
                setSpike({ detected: true, severity: result.severity })
                setVisible(true)
            }
        }

        checkSpike()
        const interval = setInterval(checkSpike, 300000) // 5 mins
        return () => clearInterval(interval)
    }, [lat, lon])

    if (!visible || !spike) return null

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
            <div className="bg-red-600 text-white p-4 rounded-xl shadow-2xl flex items-start gap-4 animate-bounce-in">
                <AlertTriangle className="shrink-0 animate-pulse" size={24} />
                <div className="flex-1">
                    <h4 className="font-bold text-lg">POLLUTION SPIKE DETECTED!</h4>
                    <p className="text-red-100 text-sm mt-1">
                        Sudden increase in PM2.5 levels. Severity: {spike.severity.toFixed(1)}.
                        Recommended: Stay indoors and close windows immediately.
                    </p>
                </div>
                <button onClick={() => setVisible(false)} className="text-red-200 hover:text-white">
                    <X size={20} />
                </button>
            </div>
        </div>
    )
}
