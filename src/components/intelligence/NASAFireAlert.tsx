/**
 * AEROVITAL v4.0 — NASA FIRMS Fire Alert Badge
 * FullStack Shinobi · Soumoditya Das & Team
 *
 * Displays a compact, real-time badge showing active NASA FIRMS fire
 * detections near Delhi-NCR. Pulsates red when fires are active.
 * Click-through opens the Ward Intel panel's Source Detection tab.
 */
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useWardStore } from '@/stores/wardStore'

interface NASAFireAlertProps {
    onClickNavigate?: () => void
}

export default function NASAFireAlert({ onClickNavigate }: NASAFireAlertProps) {
    const fireAlerts = useWardStore((s) => s.fireAlerts)
    const count = fireAlerts.length

    if (count === 0) return null

    return (
        <AnimatePresence>
            <motion.button
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                onClick={onClickNavigate}
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors cursor-pointer"
                title={`${count} active NASA FIRMS fire detection${count > 1 ? 's' : ''} near Delhi-NCR`}
            >
                {/* Pulse ring animation indicating live alert */}
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>

                <Flame size={12} />
                <span>{count} Active Fire{count > 1 ? 's' : ''}</span>

                {/* Nearest fire distance badge */}
                {fireAlerts[0] && (
                    <span className="ml-1 text-red-300/60 font-normal">
                        ~{Math.round(fireAlerts[0].distanceFromCenterKm)} km
                    </span>
                )}
            </motion.button>
        </AnimatePresence>
    )
}
