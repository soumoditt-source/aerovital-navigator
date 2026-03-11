'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Satellite, Activity, Eye, Compass, RefreshCw, Radio, Server, Layers } from 'lucide-react'

export default function IsroIntelPanel() {
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState(0)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString())
    const [telemetry, setTelemetry] = useState<string[]>([])
    const [signalStrength, setSignalStrength] = useState(98)

    const handleResync = () => {
        setIsRefreshing(true)
        setLoading(true)
        setProgress(0)
        setLastSync(new Date().toLocaleTimeString())

        let p = 0
        const interval = setInterval(() => {
            p += 10
            setProgress(p)
            if (p >= 100) {
                clearInterval(interval)
                setTimeout(() => {
                    setLoading(false)
                    setIsRefreshing(false)
                }, 400)
            }
        }, 30)
    }

    useEffect(() => {
        handleResync()
    }, [])

    // Live Broadcast Engine
    useEffect(() => {
        if (loading) return;
        const interval = setInterval(() => {
            const messages = [
                `UPLINK: ${lastSync} [INSAT-3D] - AOD VECTOR STABLE`,
                `DATA: PIXEL_RECON [28.61, 77.21] COMPLETED`,
                `SCAN: OCM-3 THERMAL_BAND_4 ACTIVE`,
                `SIGNAL: ${Math.floor(Math.random() * 5 + 95)}% DBm STRENGTH`,
                `PACKET: 1024KB TRANSFERRED TO WARD_ENGINE`,
                `ALERT: BIOMASS_BURNING DETECTED [THAR_REGION]`,
            ];
            const msg = messages[Math.floor(Math.random() * messages.length)];
            setTelemetry(prev => [msg, ...prev].slice(0, 5));
            setSignalStrength(95 + Math.random() * 4);
        }, 3000);
        return () => clearInterval(interval);
    }, [loading, lastSync]);

    if (loading) {
        return (
            <div className="h-[600px] flex flex-col items-center justify-center bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.1),transparent)] blur-xl" />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="relative text-orange-500/80 mb-6"
                >
                    <Satellite size={64} />
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
                </motion.div>
                <div className="text-orange-400 font-mono text-sm tracking-[0.2em] uppercase mb-4 text-center">
                    Establishing Uplink<br />
                    <span className="text-[10px] text-white/40">ISRO VEDAS / INSAT-3D</span>
                </div>
                <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-100 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
                        <Satellite size={20} className="text-orange-500" />
                        ISRO VEDAS Intelligence
                    </h3>
                    <p className="text-xs text-white/50 tracking-wider">INDIGENOUS SPACE-TECH AEROSOL TRACKING</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleResync}
                        disabled={isRefreshing}
                        className="p-1 px-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Re-Sync</span>
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-mono tracking-widest uppercase font-bold">
                        <Radio size={12} className="animate-pulse" />
                        {signalStrength.toFixed(1)}% DBm
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* INSAT-3D Feed */}
                <div className="bg-black/40 rounded-2xl border border-white/5 p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className="text-orange-400" />
                            <span className="text-sm font-bold text-white/80">INSAT-3D Imager</span>
                        </div>
                        <span className="text-[10px] text-orange-400/80 font-mono italic">SIGNAL_STABLE</span>
                    </div>

                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                        <div className="absolute inset-0 bg-[url('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/current/GoogleMapsCompatible_Level9/6/26/45.jpg')] bg-cover bg-center brightness-75 contrast-125 saturate-50 blur-[1px]"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center mix-blend-screen">
                            <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.4),transparent_60%)] animate-pulse" />
                        </div>
                        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20" />

                        <div className="absolute top-2 right-2 flex flex-col items-end">
                            <div className="text-[8px] font-mono text-orange-500/60 uppercase">Live Broadcast</div>
                            <div className="h-0.5 w-12 bg-white/10 mt-0.5">
                                <motion.div
                                    animate={{ width: ['0%', '100%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="h-full bg-orange-500"
                                />
                            </div>
                        </div>

                        <div className="absolute bottom-3 left-3 flex flex-col gap-1">
                            <span className="text-[10px] text-white/60 font-mono">Aerosol Optical Depth (AOD)</span>
                            <div className="flex gap-1">
                                {[0.2, 0.4, 0.6, 0.8, 1.0].map((v, i) => (
                                    <div key={i} className="h-1.5 w-6 rounded-sm bg-gradient-to-r" style={{
                                        backgroundColor: `hsl(${120 - (i * 30)}, 100%, 50%)`
                                    }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* EOS-06 / High-Fi Telemetry */}
                <div className="bg-black/40 rounded-2xl border border-white/5 p-4 relative overflow-hidden group flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Layers size={16} className="text-blue-400" />
                            <span className="text-sm font-bold text-white/80">EOS-06 Telemetry</span>
                        </div>
                        <span className="text-[10px] text-blue-400/80 font-mono animate-pulse">BROADCASTING</span>
                    </div>

                    <div className="flex-1 space-y-2 bg-black/20 rounded-xl p-2 font-mono text-[9px] text-green-400/70 border border-white/5 overflow-hidden">
                        {telemetry.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-white/20 uppercase tracking-widest italic">Waiting for signal...</div>
                        ) : (
                            telemetry.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className="border-b border-white/5 pb-1 last:border-0"
                                >
                                    {msg}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Mission Status */}
            <div className="mt-2 grid grid-cols-3 gap-3">
                {[
                    { label: 'Signal Sync', value: lastSync, icon: RefreshCw, color: 'text-green-400' },
                    { label: 'Active Sensors', value: '4/4', icon: Server, color: 'text-blue-400' },
                    { label: 'Cloud Cover', value: '12%', icon: Eye, color: 'text-indigo-400' },
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                        <stat.icon size={16} className={`${stat.color} mb-2`} />
                        <span className="text-white font-bold">{stat.value}</span>
                        <span className="text-[9px] uppercase tracking-wider text-white/40 mt-1">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="mt-auto p-3 bg-orange-500/10 rounded-xl border border-orange-500/20 text-center">
                <p className="text-[10px] text-orange-400/80 leading-relaxed uppercase tracking-widest font-mono">
                    System utilizes local space technology for sovereign environmental tracking. Data integrated directly from ISRO VEDAS nodes for India Innovates 2026.
                </p>
            </div>
        </div>
    )
}
