/**
 * AEROVITAL NAVIGATOR - Main Dashboard
 * 
 * This is the core control center of the application, integrating real-time
 * Pathway streaming data with the user's personal health profile.
 * 
 * @author Soumoditya Das <soumoditt@gmail.com>
 * @copyright 2026 Aerovital Navigator
 */

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useUserStore } from '@/stores/userStore'
import { usePathwayStream } from '@/hooks/usePathwayStream'
const RiskGauges = dynamic(() => import('@/components/dashboard/RiskGauges'), { ssr: false })
const MetricsPanel = dynamic(() => import('@/components/dashboard/MetricsPanel'), { ssr: false })
const RouteCards = dynamic(() => import('@/components/dashboard/RouteCards'), { ssr: false })
import FitnessTracker from '@/components/dashboard/FitnessTracker'
import SpikeAlert from '@/components/dashboard/SpikeAlert'
const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap'), { ssr: false })
import { User } from 'lucide-react'

export default function Dashboard() {
  const user = useUserStore(state => state.user)
  const [location] = useState({ lat: 20.5937, lon: 78.9629 }) // Default center India
  const [routePoints, setRoutePoints] = useState<{ start: [number, number] | null, end: [number, number] | null }>({ start: null, end: null })
  const [activeSelection, setActiveSelection] = useState<'start' | 'end' | null>(null)

  // REAL Pathway streaming!
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

  // Mock routes - in real app would come from routing API
  const routes = (routePoints.start && routePoints.end) ? [
    { id: '1', type: 'safest', exposure: 980, distance: 12.4, duration: 38, avgAqi: 142 },
    { id: '2', type: 'fastest', exposure: 1420, distance: 10.8, duration: 32, avgAqi: 201 },
    { id: '3', type: 'greenest', exposure: 2850, distance: 9.2, duration: 25, avgAqi: 387 },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row h-screen overflow-hidden">
      <SpikeAlert lat={location.lat} lon={location.lon} />

      {/* LEFT SIDEBAR */}
      <aside className="w-full md:w-1/4 bg-white border-r border-gray-200 overflow-y-auto p-4 flex flex-col gap-6">
        {/* User Card */}
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
          <div className="bg-blue-200 p-3 rounded-full text-blue-700">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{user?.name || 'Guest'}</h3>
            <p className="text-sm text-gray-500">{user?.age || '--'} yrs • BMI {user?.bmi?.toFixed(1) || '--'}</p>
          </div>
        </div>

        {/* Health Status */}
        <div>
          <h4 className="font-bold text-gray-700 mb-4 uppercase text-xs tracking-wider">Live Health Risks</h4>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-gray-200 rounded-full"></div>
            </div>
          ) : (
            <RiskGauges
              cardiacRisk={risks?.cardiac_risk || 4.2}
              asthmaRisk={risks?.asthma_risk || 3.5}
              exerciseSafety={risks?.exercise_safety || 65}
            />
          )}
        </div>

        {/* Live Metrics */}
        <div>
          <h4 className="font-bold text-gray-700 mb-4 uppercase text-xs tracking-wider">Atmosphere</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <span className="text-xs text-red-400 block">AQI</span>
              <span className="text-xl font-bold text-red-600">387</span>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
              <span className="text-xs text-orange-400 block">PM2.5</span>
              <span className="text-xl font-bold text-orange-600">152</span>
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER MAP AREA */}
      <main className="flex-1 relative h-full flex flex-col">
        <header className="absolute top-4 left-4 right-4 z-[400] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Navigator Active
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSelection('start')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeSelection === 'start' || routePoints.start ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              Start
            </button>
            <button
              onClick={() => setActiveSelection('end')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeSelection === 'end' || routePoints.end ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              End
            </button>
            <button
              disabled={!routePoints.start || !routePoints.end}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              Find Routes
            </button>
          </div>
        </header>

        <div className="flex-1 h-full w-full z-0">
          <InteractiveMap
            onStartSet={(lat, lng) => handleMapClick(lat, lng)}
            onEndSet={(lat, lng) => handleMapClick(lat, lng)}
            activeSelection={activeSelection}
          />
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="w-full md:w-1/4 bg-white border-l border-gray-200 overflow-y-auto p-4 flex flex-col gap-6">
        {/* Route Cards */}
        <div>
          <h4 className="font-bold text-gray-700 mb-4 uppercase text-xs tracking-wider">Suggested Routes</h4>
          {(routePoints.start && routePoints.end) ? (
            <RouteCards onRouteSelect={() => { }} routes={routes} />
          ) : (
            <div className="text-center p-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <p>Select start & end points on map</p>
            </div>
          )}
        </div>

        {/* Fitness */}
        <FitnessTracker />
      </aside>
    </div>
  )
}
