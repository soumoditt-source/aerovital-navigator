'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Info, Play } from 'lucide-react'

const TOUR_STEPS = [
    {
        target: 'metrics-panel',
        title: 'Atmospheric Vitals',
        description: 'Monitor AQI, PM2.5, and humidity in real-time. Values are streamed directly from Pathway sensor network.',
        page: '/dashboard'
    },
    {
        target: 'live-map',
        title: 'Interactive Intelligence Map',
        description: 'Set your route and destination. Our AI calculates the safest path based on local air pollution spikes.',
        page: '/dashboard'
    },
    {
        target: 'fitness-roadmap',
        title: 'Adaptive Fitness',
        description: 'Your 30-day program adjusts automatically based on current air quality. Stay safe while staying fit.',
        page: '/fitness'
    },
    {
        target: 'voice-intel',
        title: 'Neural Assistant',
        description: 'Tap the mic or chat icon for real-time health advice and environmental status checks.',
        page: 'all'
    }
]

export default function TutorialManager() {
    const [activeStep, setActiveStep] = useState<number | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('seen_aerovital_tour_v2')
        if (!hasSeenTour) {
            setTimeout(() => {
                setIsVisible(true)
                setActiveStep(0)
            }, 2000)
        }
    }, [])

    const handleComplete = () => {
        localStorage.setItem('seen_aerovital_tour_v2', 'true')
        setIsVisible(false)
    }

    const nextStep = () => {
        if (activeStep !== null && activeStep < TOUR_STEPS.length - 1) {
            setActiveStep(activeStep + 1)
        } else {
            handleComplete()
        }
    }

    if (!isVisible || activeStep === null) return null

    const step = TOUR_STEPS[activeStep]

    return (
        <div className="fixed inset-0 z-[1000] pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pointer-events-auto w-[90vw] max-w-md bg-slate-900 border border-blue-500/30 rounded-3xl p-6 shadow-2xl"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Info size={20} />
                        <span className="text-xs font-bold uppercase tracking-widest font-mono">System Orientation</span>
                    </div>
                    <button onClick={handleComplete} className="text-white/30 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">
                    {step.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                    {step.description}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {TOUR_STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all ${i === activeStep ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/10'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm transition-all"
                    >
                        {activeStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                        <ChevronRight size={16} />
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
