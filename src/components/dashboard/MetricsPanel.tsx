'use client'

import { motion } from 'framer-motion'
import { Wind, Activity, Droplets, Thermometer, Database } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

interface MetricsPanelProps {
  aqi: number
  pm25: number
  temperature: number
  humidity: number
}

function MetricItem({
  icon: Icon,
  label,
  value,
  unit,
  color,
  trend = 'stable'
}: {
  icon: any,
  label: string,
  value: number | string,
  unit: string,
  color: string,
  trend?: 'up' | 'down' | 'stable'
}) {
  return (
    <GlassCard className="relative overflow-hidden group border border-white/5 bg-black/40 hover:bg-white/5 transition-all duration-500">
      <div className={`absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity duration-500 text-${color}-400`}>
        <Icon size={48} strokeWidth={1} />
      </div>

      <div className="relative z-10">
        <div className={`flex items-center gap-2 text-${color}-400 mb-2`}>
          <Icon size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-4xl font-black text-white font-mono tracking-tighter">
            {value}
          </span>
          <span className="text-sm font-medium text-white/50 mb-1">{unit}</span>
        </div>

        <div className="mt-2 text-xs font-medium text-white/30 truncate">
          Streaming Live Updates
        </div>
      </div>

      {/* Animated glow */}
      <div className={`absolute -bottom-4 -left-4 w-24 h-24 bg-${color}-500/20 rounded-full blur-2xl group-hover:bg-${color}-500/40 transition-all duration-500`} />
    </GlassCard>
  )
}

export default function MetricsPanel({ aqi, pm25, temperature, humidity }: MetricsPanelProps) {
  return (
    <div id="metrics-panel" className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      <MetricItem
        icon={Database}
        label="Real-Time AQI"
        value={aqi}
        unit=""
        color={aqi > 100 ? "red" : "green"}
      />
      <MetricItem
        icon={Wind}
        label="PM2.5 Conc."
        value={pm25}
        unit="µg/m³"
        color="purple"
      />
      <MetricItem
        icon={Thermometer}
        label="Temperature"
        value={temperature}
        unit="°C"
        color="orange"
      />
      <MetricItem
        icon={Droplets}
        label="Humidity"
        value={humidity}
        unit="%"
        color="blue"
      />
    </div>
  )
}
