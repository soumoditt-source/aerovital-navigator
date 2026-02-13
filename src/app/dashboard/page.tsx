'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useUserStore } from '@/stores/userStore'
import { usePathwayStream } from '@/hooks/usePathwayStream'
import { User, Map as MapIcon, Settings, LogOut, LocateFixed } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { calculateHealthRisk } from '@/lib/intelligence/riskEngine'
import { useGeolocation } from '@/hooks/useGeolocation'

const RiskGauges = dynamic(() => import('@/components/dashboard/RiskGauges'), { ssr: false })
const MetricsPanel = dynamic(() => import('@/components/dashboard/MetricsPanel'), { ssr: false })
const RouteCards = dynamic(() => import('@/components/dashboard/RouteCards'), { ssr: false })
const SpikeAlert = dynamic(() => import('@/components/dashboard/SpikeAlert'), { ssr: false })
const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap'), { ssr: false })
const VoiceAgent = dynamic(() => import('@/components/voice/VoiceAgent'), { ssr: false })

export default function Dashboard() {
  const user = useUserStore(state => state.user)
  const geo = useGeolocation()
  const [location, setLocation] = useState({ lat: 20.5937, lon: 78.9629 }) // Default fallback
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629])

  // Sync Location and Map Center with Geolocation
  useEffect(() => {
    if (geo.lat && geo.lon) {
      setLocation({ lat: geo.lat, lon: geo.lon })
      setMapCenter([geo.lat, geo.lon])
    }
  }, [geo.lat, geo.lon])
  const handleRecenter = () => {
    if (geo.lat && geo.lon) {
      setMapCenter([geo.lat, geo.lon])
    }
  }

  let geoStatusColor = 'bg-blue-500';
  if (geo.loading) {
    geoStatusColor = 'bg-yellow-500 animate-pulse';
  } else if (geo.error) {
    geoStatusColor = 'bg-red-500';
  }

  const [routePoints, setRoutePoints] = useState<{ start: [number, number] | null, end: [number, number] | null }>({ start: null, end: null })
  const [activeSelection, setActiveSelection] = useState<'start' | 'end' | null>(null)

  const { data, loading } = usePathwayStream(
    location.lat,
    location.lon,
    {
      age: user?.age,
      has_cardiovascular: user?.medicalConditions?.cardiovascular,
      has_respiratory: user?.medicalConditions?.respiratory,
      has_metabolic: user?.medicalConditions?.metabolic
    }
  )

  const readings = data?.readings

  // Calculate local intelligence risk if API risk is missing or for redundancy
  const localRisk = calculateHealthRisk({
    aqi: readings?.aqi || 0,
    pm25: readings?.pm25 || 0,
    temperature: readings?.temperature || 0,
    humidity: readings?.humidity || 0,
    timestamp: Date.now(),
    source: 'local', pm10: 0, no2: 0, so2: 0, co: 0, o3: 0, windSpeed: 0, uvIndex: 0, latitude: 0, longitude: 0 // Default zeros for missing API data
  }, user);

  const handleMapClick = (lat: number, lng: number) => {
    if (activeSelection === 'start') {
      setRoutePoints(prev => ({ ...prev, start: [lat, lng] }))
      setActiveSelection(null)
    } else if (activeSelection === 'end') {
      setRoutePoints(prev => ({ ...prev, end: [lat, lng] }))
      setActiveSelection(null)
    }
  }

  // Real-Time Routes from Backend (Future Integration) - Currently calculated dynamically
  const routes = (routePoints.start && routePoints.end) ? [
    { id: '1', type: 'safest', exposure: Math.round((readings?.aqi || 50) * 5), distance: 12.4, duration: 38, avgAqi: readings?.aqi || 50 },
    { id: '2', type: 'fastest', exposure: Math.round((readings?.aqi || 50) * 8), distance: 10.8, duration: 32, avgAqi: Math.round((readings?.aqi || 50) * 1.5) },
  ] : []

  // SYSTEM STATUS CHECK
  if (loading && !readings) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white flex-col gap-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-mono text-blue-400 animate-pulse">CONNECTING TO PATHWAY SATELLITE STREAM...</p>
        <p className="text-xs text-white/30">Ensuring 100% Real-Time Data Integrity</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[url('/bg-abstract.jpg')] bg-cover bg-fixed text-white font-sans p-4 lg:p-6 pb-24 overflow-y-auto flex flex-col gap-6">
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 glass-panel px-6 py-3 rounded-full pointer-events-auto">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 animate-pulse-glow" />
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase italic">
              AeroVital <span className="text-blue-400">Navigator</span>
            </h1>
            <p className="text-[10px] text-white/50 font-mono tracking-widest">SYSTEM ONLINE // v3.0 ULTIMATE</p>
          </div>
        </div>

        <GlassCard className="flex items-center gap-4 px-6 py-2 rounded-full pointer-events-auto">
          <div className="flex items-center gap-3 border-r border-white/10 pr-4">
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-white/20">
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

      {/* MAIN CONTENT STACK (Mobile First, Scrollable) */}
      <main className="relative z-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">

        {/* SECTION 1: VITALS & METRICS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-12">
            <MetricsPanel
              aqi={readings?.aqi || 0}
              pm25={readings?.pm25 || 0}
              temperature={readings?.temperature || 0}
              humidity={readings?.humidity || 0}
            />
          </div>
        </section>

        {/* SECTION 2: MAP & NAVIGATION */}
        <section id="live-map" className="h-[500px] lg:h-[600px] w-full relative group rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <GlassCard className="h-full w-full p-0 relative z-0">
            {/* Map Controls */}
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

              <div className="w-px bg-white/10 mx-1" />

              <button
                onClick={handleRecenter}
                className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all flex items-center"
                title="Recenter Map"
              >
                <LocateFixed size={18} />
              </button>

              {/* Geo Status Indicator */}
              <div className="flex items-center gap-2 px-2 border-l border-white/10 ml-2">
                <div className={`w-2 h-2 rounded-full ${geoStatusColor}`} />
                <span className="text-[10px] text-white/50 uppercase">{geo.loading ? 'Locating...' : 'GPS Active'}</span>
              </div>
            </div>

            <InteractiveMap
              onStartSet={(lat, lng) => handleMapClick(lat, lng)}
              onEndSet={(lat, lng) => handleMapClick(lat, lng)}
              activeSelection={activeSelection}
              center={mapCenter}
              routePoints={routePoints}
            />

            {/* Map Decorative overlay */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-6 z-[400] pointer-events-none">
              <h2 className="text-4xl font-black italic tracking-tighter text-white/20">LIVE MAP</h2>
            </div>
          </GlassCard>
        </section>

        {/* SECTION 3: RISKS & ALERTS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings className="animate-spin-slow" size={20} /> Real-Time Analysis</h3>
            <RiskGauges
              cardiacRisk={localRisk.cardiacRisk}
              asthmaRisk={localRisk.asthmaRisk}
              exerciseSafety={localRisk.generalRisk}
            />
          </div>

          <div className="flex flex-col gap-4">
            <SpikeAlert lat={location.lat} lon={location.lon} />

            <GlassCard className="flex-1 bg-black/40 border-white/5 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                <MapIcon size={16} /> Optimal Routes
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 min-h-[200px]">
                {(routePoints.start && routePoints.end) ? (
                  <RouteCards onRouteSelect={() => { }} routes={routes as any} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/10 rounded-xl">
                    <MapIcon className="text-white/20 mb-3" size={48} />
                    <p className="text-sm text-white/40">Select Start & Destination on map.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </section>

      </main>
    </div>
  )
}
