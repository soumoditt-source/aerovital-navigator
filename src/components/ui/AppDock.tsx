'use client'

import { LayoutDashboard, Dumbbell, Newspaper, Settings, Map, Flame, Camera } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAtmosphereStore } from '@/stores/atmosphereStore'
import { useWardStore } from '@/stores/wardStore'

export default function AppDock() {
    const router = useRouter()
    const pathname = usePathname()

    const tabs = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Command', path: '/dashboard' },
        { id: 'ward-intel', icon: Map, label: 'Wards', path: '/ward-intel' },
        { id: 'camera-scan', icon: Camera, label: 'Scan', path: '/camera-scan' },
        { id: 'fitness', icon: Dumbbell, label: 'Fitness', path: '/fitness' },
        { id: 'news', icon: Newspaper, label: 'Intel', path: '/news' },
    ]

    const { aqi } = useAtmosphereStore()
    const fireCount = useWardStore((s) => s.fireAlerts.length)

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
            {/* Live Status Ticker */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2 shadow-xl"
            >
                <div className={`w-1.5 h-1.5 rounded-full ${aqi > 150 ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                <span className="text-[9px] font-mono text-white/50 uppercase tracking-tighter">
                    Live: <span className="text-white font-bold">{aqi} AQI</span>
                </span>
                {fireCount > 0 && (
                    <span className="flex items-center gap-1 text-[9px] text-red-400 font-bold">
                        <Flame size={9} /> {fireCount} Fire{fireCount > 1 ? 's' : ''}
                    </span>
                )}
            </motion.div>

            <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-blue-900/20">

                {tabs.map((tab) => {
                    const isActive = pathname === tab.path
                    return (
                        <button
                            key={tab.id}
                            onClick={() => router.push(tab.path)}
                            className={`relative group px-4 py-3 rounded-xl transition-all duration-300 flex flex-col items-center gap-1 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-white/10 text-white/50 hover:text-white'
                                }`}
                        >
                            <tab.icon size={20} className={isActive ? 'animate-pulse' : ''} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>

                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                                />
                            )}
                        </button>
                    )
                })}

                <div className="w-px h-8 bg-white/10 mx-1" />

                <button title="Settings" aria-label="Settings" className="p-3 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                    <Settings size={20} />
                </button>

            </div>
        </div>
    )
}
