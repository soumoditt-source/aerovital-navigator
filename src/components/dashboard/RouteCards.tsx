'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Leaf, MapPin, CheckCircle2 } from 'lucide-react'

// Add geometry array to route typing for OSRM map plotting
export interface Route {
  id: string
  type: 'safest' | 'fastest' | 'greenest'
  exposure: number
  distance: number
  duration: number
  avgAqi: number
  geometry?: [number, number][]
}

interface RouteCardsProps {
  readonly onRouteSelect: (id: string) => void
  readonly routes: Route[]
  readonly selectedRouteId?: string | null
}

export default function RouteCards({ onRouteSelect, routes, selectedRouteId }: RouteCardsProps) {
  if (!routes || routes.length === 0) return null

  const getRouteConfig = (type: string) => {
    switch (type) {
      case 'safest': return { icon: Shield, color: 'blue', label: 'Maximum Safety' }
      case 'fastest': return { icon: Zap, color: 'orange', label: 'Fastest Arrival' }
      case 'greenest': return { icon: Leaf, color: 'green', label: 'Eco-Friendly' }
      default: return { icon: MapPin, color: 'gray', label: 'Standard Route' }
    }
  }

  return (
    <div className="space-y-3">
      {routes.map((route, i) => {
        const config = getRouteConfig(route.type)
        const Icon = config.icon
        const isSelected = selectedRouteId === route.id

        return (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02, x: -5 }}
            className={`
              relative overflow-hidden p-4 rounded-xl cursor-pointer border transition-all duration-300
              ${isSelected
                ? `bg-${config.color}-900/40 border-${config.color}-500/50 shadow-lg shadow-${config.color}-500/20`
                : `bg-gradient-to-r from-black/60 to-black/40 border-white/5 hover:border-${config.color}-500/30 hover:from-${config.color}-900/20`
              }
              group
            `}
            onClick={() => onRouteSelect(route.id)}
          >
            {/* Interactive selection line */}
            <div className={`absolute left-0 top-0 bottom-0 transition-all ${isSelected ? `w-2 bg-${config.color}-500` : `w-1 bg-${config.color}-500/50 group-hover:w-1.5`}`} />

            <div className="flex justify-between items-start mb-2 pl-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isSelected ? `bg-${config.color}-500 text-white` : `bg-${config.color}-500/20 text-${config.color}-400`}`}>
                  <Icon size={16} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-white' : `text-${config.color}-400`}`}>
                  {config.label}
                </span>
                {isSelected && (
                  <CheckCircle2 size={14} className={`text-${config.color}-400 ml-1`} />
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-white leading-none">{route.duration} <span className="text-[10px] font-normal text-white/50">min</span></div>
                <div className="text-[10px] text-white/40 mt-1">{route.distance.toFixed(1)} km</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pl-3 mt-3">
              <div className={`rounded p-2 border transition-colors ${isSelected ? `bg-${config.color}-500/20 border-${config.color}-500/30` : 'bg-white/5 border-white/5'}`}>
                <span className="block text-[10px] text-white/40 uppercase">Exposure</span>
                <span className="text-xs font-bold text-white">{route.exposure} <span className="text-[9px] text-white/50">AQI·m</span></span>
              </div>
              <div className={`rounded p-2 border transition-colors ${isSelected ? `bg-${config.color}-500/20 border-${config.color}-500/30` : 'bg-white/5 border-white/5'}`}>
                <span className="block text-[10px] text-white/40 uppercase">Avg AQI</span>
                <span className={`text-xs font-bold ${route.avgAqi > 150 ? 'text-red-400' : 'text-green-400'}`}>
                  {route.avgAqi}
                </span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
