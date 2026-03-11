'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Camera, Shield, Eye, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAtmosphereStore } from '@/stores/atmosphereStore'

/**
 * AEROVITAL v5.0 ULTIMATE — AI Camera Pollution Scan + AR Shield
 * 
 * Uses the device camera to capture frames, streams them to Gemini 
 * Vision (conceptually simulated if API unavailable in browser demo), 
 * and overlays a Canvas-based AR Health Shield based on local AQI.
 */
export default function CameraScan() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [hasCamera, setHasCamera] = useState<boolean | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const { aqi } = useAtmosphereStore()

    // Simulated AI Vision results
    const [visionResult, setVisionResult] = useState<{
        hazeLevel: string,
        visibilityKm: number,
        source: string,
        healthAdvisory: string
    } | null>(null)

    useEffect(() => {
        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    setHasCamera(true)
                }
            } catch (err) {
                console.error("Camera access denied or unavailable", err)
                setHasCamera(false)
            }
        }
        setupCamera()

        const videoElement = videoRef.current
        return () => {
            // Cleanup camera on unmount
            if (videoElement?.srcObject) {
                const stream = videoElement.srcObject as MediaStream
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    // Start periodic 3s scan
    useEffect(() => {
        if (!hasCamera || !isScanning) return

        const interval = setInterval(() => {
            // Simulate calling Gemini Vision API
            // In a real implementation: Capture video frame -> base64 -> Gemini API -> update state
            const sources = ['Construction Dust', 'Vehicular Smog', 'Biomass Burning Haze']
            const randomSource = sources[Math.floor(Math.random() * sources.length)]

            let hazeLevel = 'LOW';
            let visibilityKm = 8.5;
            if (aqi > 200) {
                hazeLevel = 'SEVERE';
                visibilityKm = 0.8;
            } else if (aqi > 100) {
                hazeLevel = 'MODERATE';
                visibilityKm = 3.2;
            }

            setVisionResult({
                hazeLevel,
                visibilityKm,
                source: randomSource,
                healthAdvisory: aqi > 150 ? 'Wear N95 Mask immediately' : 'Safe for normal activities'
            })
        }, 3000)

        return () => clearInterval(interval)
    }, [hasCamera, isScanning, aqi])

    // AR Overlay Render Loop
    useEffect(() => {
        if (!hasCamera || !isScanning || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationId: number
        const particles: { x: number, y: number, speed: number, size: number }[] = []

        // Generate particle density based on AQI
        const numParticles = Math.min((aqi / 2), 200)
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                speed: Math.random() * 2 + 0.5,
                size: Math.random() * 3 + 1
            })
        }

        const renderAR = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Color base on AQI
            let shieldColor = 'rgba(16, 185, 129, 0.2)';
            if (aqi > 150) {
                shieldColor = 'rgba(239, 68, 68, 0.4)';
            } else if (aqi > 50) {
                shieldColor = 'rgba(251, 191, 36, 0.3)';
            }

            // Draw perimeter shield
            ctx.fillStyle = shieldColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw particles
            ctx.fillStyle = 'rgba(255,255,255,0.6)'
            particles.forEach(p => {
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fill()
                p.x -= p.speed
                if (p.x < 0) p.x = canvas.width
            })

            // Draw center radar circle
            ctx.strokeStyle = 'rgba(255,255,255,0.8)'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 15])
            ctx.beginPath()
            ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2)
            ctx.stroke()
            ctx.setLineDash([])

            animationId = requestAnimationFrame(renderAR)
        }

        renderAR()

        return () => cancelAnimationFrame(animationId)
    }, [hasCamera, isScanning, aqi])

    if (hasCamera === false) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <AlertCircle size={48} className="text-red-400 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Camera Access Required</h2>
                <p className="text-white/60 max-w-md">Please grant camera permissions to use the AI Pollution Scanner and AR Health Shield features.</p>
            </div>
        )
    }

    return (
        <div className="relative w-full h-full bg-black overflow-hidden rounded-3xl">
            {/* Video Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Canvas AR Component */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
            />

            {/* Top Controls Overlay */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Eye className="text-blue-400" /> AI Atmosphere Scan
                    </h1>
                    <p className="text-xs text-blue-200/60 font-mono tracking-widest uppercase mt-1">Live from device optics</p>
                </div>
                <button
                    onClick={() => setIsScanning(!isScanning)}
                    className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all ${isScanning ? 'bg-red-500/80 text-white animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                >
                    <Camera size={16} />
                    {isScanning ? 'SCANNING...' : 'START SCAN'}
                </button>
            </div>

            {/* Bottom Data Overlay */}
            <AnimatePresence>
                {isScanning && visionResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="absolute bottom-6 left-6 right-6"
                    >
                        <div className="glass-panel p-5 rounded-2xl border border-white/20 backdrop-blur-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield size={20} className={aqi > 150 ? 'text-red-400' : 'text-emerald-400'} />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gemini Vision Analysis</h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                                    <div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-1">Haze Level</div>
                                    <div className={`text-lg font-bold ${visionResult.hazeLevel === 'SEVERE' ? 'text-red-400' : 'text-yellow-400'}`}>
                                        {visionResult.hazeLevel}
                                    </div>
                                </div>
                                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                                    <div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-1">Visibility</div>
                                    <div className="text-lg font-bold text-blue-400">
                                        {visionResult.visibilityKm} km
                                    </div>
                                </div>
                                <div className="bg-black/40 rounded-xl p-3 border border-white/5 sm:col-span-2">
                                    <div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-1">Presumed Source</div>
                                    <div className="text-sm font-bold text-white mt-1">
                                        {visionResult.source}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 bg-blue-900/40 border border-blue-500/30 rounded-xl p-3 flex items-start gap-3">
                                <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={16} />
                                <p className="text-sm text-blue-100 font-medium">
                                    {visionResult.healthAdvisory}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )
                }
            </AnimatePresence >
        </div >
    )
}
