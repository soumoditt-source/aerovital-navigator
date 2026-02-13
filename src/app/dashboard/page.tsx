/**
 * AEROVITAL NAVIGATOR - Ultimate Dashboard
 * @author Soumoditya Das <soumoditt@gmail.com>
 */
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { usePathwayStream } from '@/hooks/usePathwayStream'
import { User, Activity, Map as MapIcon, Settings, LogOut, Menu } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'

const RiskGauges = dynamic(() => import('@/components/dashboard/RiskGauges'), { ssr: false })
const MetricsPanel = dynamic(() => import('@/components/dashboard/MetricsPanel'), { ssr: false })
const RouteCards = dynamic(() => import('@/components/dashboard/RouteCards'), { ssr: false })
const FitnessTracker = dynamic(() => import('@/components/dashboard/FitnessTracker'), { ssr: false })
const SpikeAlert = dynamic(() => import('@/components/dashboard/SpikeAlert'), { ssr: false })
const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap'), { ssr: false })

export default function Dashboard() {
  const user = useUserStore(state => state.user)
  const [location] = useState({ lat: 20.5937, lon: 78.9629 })
  const [routePoints, setRoutePoints] = useState<{ start: [number, number] | null, end: [number, number] | null }>({ start: null, end: null })
  const [activeSelection, setActiveSelection] = useState<'start' | 'end' | null>(null)

  const { data: risks, loading } = usePathwayStream(
    location.lat,
    location.lon,
    {
      age: user?.age,
      has_cardiovascular: user?.medicalConditions?.cardiovascular,
      has_respiratory: user?.medicalConditions?.respiratory,
      has_metabolic: user?.medicalConditions?.metabolic
    }
  )

  const handleMapClick = (lat: number, lng: number) => {
    if (activeSelection === 'start') {
      setRoutePoints(prev => ({ ...prev, start: [lat, lng] }))
      setActiveSelection(null)
    } else if (activeSelection === 'end') {
      setRoutePoints(prev => ({ ...prev, end: [lat, lng] }))
      setActiveSelection(null)
    }
  }

  // Mock routes
  const routes = (routePoints.start && routePoints.end) ? [
    { id: '1', type: 'safest', exposure: 980, distance: 12.4, duration: 38, avgAqi: 142 },
    { id: '2', type: 'fastest', exposure: 1420, distance: 10.8, duration: 32, avgAqi: 201 },
    { id: '3', type: 'greenest', exposure: 2850, distance: 9.2, duration: 25, avgAqi: 387 },
  ] : []

  return (
    <div className="min-h-screen bg-[url('/bg-abstract.jpg')] bg-cover bg-fixed text-white font-sans p-4 lg:p-6 overflow-hidden flex flex-col gap-4">
      {/* GLOBAL BACKGROUND - using CSS gradient in globals.css, this adds texture if needed */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 glass-panel px-6 py-3 rounded-full pointer-events-auto">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 animate-pulse-glow" />
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase italic">
              AeroVital <span className="text-blue-400">Navigator</span>
            </h1>
            <p className="text-[10px] text-white/50 font-mono tracking-widest">SYSTEM ONLINE // v2.0</p>
          </div>
        </div>

        <GlassCard className="flex items-center gap-4 px-6 py-2 rounded-full pointer-events-auto">
          <div className="flex items-center gap-3 border-r border-white/10 pr-4">
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-white/20">
              {/* User Avatar Placeholder */}
              <User className="w-full h-full p-1 text-white/50" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-white">{user?.name || 'Commander'}</div>
              <div className="text-[10px] text-green-400 font-mono">ID: AV-8842</div>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
            <Settings size={18} />
          </button>
          <button className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-white/70 hover:text-red-400">
            <LogOut size={18} />
          </button>
        </GlassCard>
      </header>

      {/* MAIN BENTO GRID */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 grid-rows-[auto_1fr] gap-4 lg:gap-6 min-h-0">

        {/* ROW 1: METRICS (Spans Full Width) */}
        <div className="lg:col-span-12 h-32 lg:h-40">
          <MetricsPanel aqi={152} pm25={84} temperature={28} humidity={65} />
        </div>

        {/* ROW 2: MAIN CONTENT */}

        {/* COL 1: LEFT SIDEBAR (Risks & Fitness) */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
          <div className="flex-1 min-h-[300px]">
            <RiskGauges
              cardiacRisk={risks?.cardiac_risk || 4.2}
              asthmaRisk={risks?.asthma_risk || 3.5}
              exerciseSafety={risks?.exercise_safety || 65}
            />
          </div>
          <div className="h-64 lg:h-auto lg:flex-1">
            <FitnessTracker />
          </div>
        </div>

        {/* COL 2: CENTER MAP (Dominant) */}
        <div className="lg:col-span-6 h-[500px] lg:h-auto min-h-0 relative group">
          <GlassCard className="h-full w-full p-0 overflow-hidden border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.1)] relative z-0">

            {/* Map Controls Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] flex gap-2 p-1 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
              <button
                onClick={() => setActiveSelection('start')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeSelection === 'start' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'hover:bg-white/10 text-white/70'}`}
              >
                Set Start
              </button>
              <div className="w-px bg-white/10 mx-1" />
              <button
                onClick={() => setActiveSelection('end')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeSelection === 'end' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'hover:bg-white/10 text-white/70'}`}
              >
                Set Dest
              </button>
            </div>

            <InteractiveMap
              onStartSet={(lat, lng) => handleMapClick(lat, lng)}
              onEndSet={(lat, lng) => handleMapClick(lat, lng)}
              activeSelection={activeSelection}
            />

            {/* Map Decorative overlay */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-6 z-[400] pointer-events-none">
              <h2 className="text-4xl font-black italic tracking-tighter text-white/20">LIVE MAP</h2>
            </div>
          </GlassCard>
        </div>

        {/* COL 3: RIGHT SIDEBAR (Routes & Alerts) */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
          <div className="h-auto">
            <SpikeAlert lat={location.lat} lon={location.lon} />
          </div>

          <GlassCard className="flex-1 bg-black/40 border-white/5 flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
              <MapIcon size={16} /> Route Optimization
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {(routePoints.start && routePoints.end) ? (
                <RouteCards onRouteSelect={() => { }} routes={routes as any} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/10 rounded-xl">
                  <MapIcon className="text-white/20 mb-3" size={48} />
                  <p className="text-sm text-white/40">Select Start & Destination points on the map to calculate optimal paths.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

      </main>
    </div>
  )
}
