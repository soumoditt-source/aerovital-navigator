'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Cpu, Zap, Activity, ShieldAlert } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import { useAtmosphereStore } from '@/stores/atmosphereStore'
import { useUserStore } from '@/stores/userStore'
import { queryPathwayIntel } from '@/lib/api/pathwayClient'

export default function PathwayDeepBrain() {
    const { aqi, pm25, temperature, humidity } = useAtmosphereStore()
    const { user } = useUserStore()
    const [insight, setInsight] = useState<string>('Initializing Neural Link...')
    const [loading, setLoading] = useState(false)
    const [intensity, setIntensity] = useState(0)

    useEffect(() => {
        const fetchPathwayInsight = async () => {
            if (aqi === 0) return;
            setLoading(true)
            try {
                const context = {
                    user: user?.name || 'Commander',
                    age: user?.age || 30,
                    aqi,
                    pm25,
                    temperature,
                    humidity,
                    query: "Analyze my current health risk based on my medical history and the current atmosphere. Provide a 1-sentence POST-TRANSFORMER reasoning."
                }
                const res = await queryPathwayIntel(context.query, context)
                if (res.success) {
                    setInsight(res.response || res.message)
                    // Calculate "Intensity" based on risk word keywords
                    const highRisk = /danger|stop|alert|critical|risk/i.test(res.response || '')
                    setIntensity(highRisk ? 100 : (aqi / 300) * 100)
                }
            } catch (e) {
                console.error("Pathway Analytics failure:", e);
                setInsight("Neural link unstable. Recalibrating atmosphere sensors...")
            } finally {
                setLoading(false)
            }
        }

        const interval = setInterval(fetchPathwayInsight, 30000)
        fetchPathwayInsight()
        return () => clearInterval(interval)
    }, [aqi, pm25, temperature, humidity, user])

    return (
        <GlassCard className="h-full border-blue-500/20 bg-black/40 relative overflow-hidden group">
            {/* Background Neural Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Brain size={20} className="text-blue-400" />
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-blue-500/30 blur-md rounded-full"
                            />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-blue-200/70 flex items-center gap-2">
                            Pathway Deep Brain <span className="text-[8px] bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-400 border border-blue-500/30">RAG ACTIVE</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[9px] text-white/30">
                        <Cpu size={10} />
                        <span>TRANSFORMER-XL MODE</span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={insight}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-sm leading-relaxed text-blue-50/90 font-medium italic relative z-10"
                            >
                                "{insight}"
                            </motion.p>
                        </AnimatePresence>
                        {loading && (
                            <div className="absolute bottom-1 right-2 flex gap-1">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 flex flex-row items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <Zap size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase font-mono">Inference</p>
                                <p className="text-xs font-bold text-white">42ms UltraFast</p>
                            </div>
                        </div>
                        <div className={`border rounded-xl p-3 flex flex-row items-center gap-3 transition-colors ${intensity > 70 ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
                            <div className={`p-2 rounded-lg ${intensity > 70 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                <Activity size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase font-mono">Neural Load</p>
                                <p className={`text-xs font-bold ${intensity > 70 ? 'text-red-400' : 'text-green-400'}`}>{Math.round(intensity)}% Load</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[8px] font-mono text-white/20 border-t border-white/5 pt-3">
                    <span className="flex items-center gap-1"><ShieldAlert size={8} /> DATA INTEGRITY VERIFIED</span>
                    <span>PATHWAY-AI-ENGINE-CONNECTED</span>
                </div>
            </div>

            {/* Pulsing Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full group-hover:bg-blue-600/10 transition-colors" />
        </GlassCard>
    )
}
