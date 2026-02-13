'use client'

import { motion } from 'framer-motion'
import { Heart, Activity, UserCheck, Wind } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

interface RiskGaugesProps {
  cardiacRisk: number // 1-10
  asthmaRisk: number // 1-10
  exerciseSafety: number // 0-100
}

function CircularGauge({ value, max, label, color, icon: Icon }: any) {
  const percentage = (value / max) * 100
  const circumference = 2 * Math.PI * 40 // r=40
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center relative group">
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-${color}-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/10"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            className={`text-${color}-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Icon size={20} className={`text-${color}-400 mb-1`} />
          <span className="text-2xl font-black font-mono">{Number(value).toFixed(1)}</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-bold uppercase tracking-widest text-white/70">{label}</span>
      <span className="text-[10px] text-white/30">RISK FACTOR</span>
    </div>
  )
}

export default function RiskGauges({ cardiacRisk, asthmaRisk, exerciseSafety }: RiskGaugesProps) {
  return (
    <GlassCard className="h-full flex flex-col justify-between border-white/10 bg-black/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-blue-400 animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">
            Bio-Markers
          </h3>
        </div>
        <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 shadow-[0_0_10px_rgba(0,255,0,0.2)]">
          LIVE STREAM
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-center">
        <CircularGauge
          value={cardiacRisk}
          max={10}
          label="Cardiac"
          color="red"
          icon={Heart}
        />
        <CircularGauge
          value={asthmaRisk}
          max={10}
          label="Respiratory"
          color="blue"
          icon={Wind}
        />
        <CircularGauge
          value={exerciseSafety}
          max={100}
          label="Safety"
          color="green"
          icon={UserCheck}
        />
      </div>

      <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 font-mono flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        AI Model Analysis: Environmental stress factors updated.
      </div>
    </GlassCard>
  )
}
