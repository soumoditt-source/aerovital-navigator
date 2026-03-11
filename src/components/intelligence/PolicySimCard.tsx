/**
 * AEROVITAL v4.0 — Policy Simulation Card
 * FullStack Shinobi · Soumoditya Das & Team
 *
 * Renders one AI-generated MCD policy recommendation as a premium card
 * with projected AQI delta visualization, health savings estimate,
 * color-coded confidence badge, and bylaw draft expandable section.
 */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, TrendingDown, IndianRupee, Shield, Clock } from 'lucide-react'
import type { PolicyRecommendation } from '@/types'

interface Props {
    policy: PolicyRecommendation
    index: number
}

const SOURCE_LABELS: Record<string, string> = {
    construction_dust: 'Construction Dust',
    biomass_burning: 'Biomass Burning',
    vehicular_traffic: 'Vehicular Traffic',
    industrial_emissions: 'Industrial Emissions',
    secondary_aerosol: 'Secondary Aerosol',
    unknown: 'Mixed Sources',
}

const CONFIDENCE_COLORS: Record<string, string> = {
    high: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function PolicySimCard({ policy, index }: Readonly<Props>) {
    const [expanded, setExpanded] = useState(false)

    const aqiImprovementPct = policy.projectedAqiDelta === 0
        ? 0
        : Math.abs(Math.round((policy.projectedAqiDelta / (policy.projectedAqiAfter - policy.projectedAqiDelta)) * 100))

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
        >
            {/* Header */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                {policy.wardName}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CONFIDENCE_COLORS[policy.confidenceLevel]}`}>
                                {policy.confidenceLevel} confidence
                            </span>
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug">{policy.intervention}</h3>
                    </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-3">
                    {/* AQI Delta */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingDown size={12} className="text-emerald-400" />
                            <span className="text-[10px] text-emerald-400/70 uppercase tracking-wider">AQI Drop</span>
                        </div>
                        <span className="text-xl font-black text-emerald-400">
                            {Math.abs(policy.projectedAqiDelta)}
                        </span>
                        <div className="text-[10px] text-emerald-400/60 mt-0.5">
                            {policy.projectedAqiAfter + Math.abs(policy.projectedAqiDelta)} → {policy.projectedAqiAfter}
                        </div>
                    </div>

                    {/* Health Savings */}
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <IndianRupee size={12} className="text-blue-400" />
                            <span className="text-[10px] text-blue-400/70 uppercase tracking-wider">Savings</span>
                        </div>
                        <span className="text-xl font-black text-blue-400">
                            ₹{policy.estimatedHealthSavingsCr}Cr
                        </span>
                        <div className="text-[10px] text-blue-400/60 mt-0.5">annual est.</div>
                    </div>

                    {/* % Improvement */}
                    <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Shield size={12} className="text-purple-400" />
                            <span className="text-[10px] text-purple-400/70 uppercase tracking-wider">Impact</span>
                        </div>
                        <span className="text-xl font-black text-purple-400">
                            {aqiImprovementPct}%
                        </span>
                        <div className="text-[10px] text-purple-400/60 mt-0.5">improvement</div>
                    </div>
                </div>

                {/* Enforcement summary */}
                <p className="mt-4 text-sm text-white/60 leading-relaxed border-l-2 border-blue-500/40 pl-3">
                    {policy.enforcementText.length > 160
                        ? policy.enforcementText.slice(0, 160) + '…'
                        : policy.enforcementText}
                </p>

                {/* Expand/collapse bylaw */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expanded ? 'Hide' : 'View'} MCD Bylaw Draft
                </button>
            </div>

            {/* Expandable bylaw section */}
            {expanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-white/10 bg-black/30 p-5"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={12} className="text-white/30" />
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">
                            Generated {new Date(policy.generatedAt).toLocaleTimeString()}
                        </span>
                    </div>
                    <pre className="text-xs text-white/60 whitespace-pre-wrap font-mono leading-relaxed">
                        {policy.bylawDraft}
                    </pre>
                </motion.div>
            )}
        </motion.div>
    )
}
