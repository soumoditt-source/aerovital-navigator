/**
 * AEROVITAL v4.0 — Ward Intelligence Panel
 * FullStack Shinobi · Soumoditya Das & Team
 *
 * The centrepiece dual-mode civic intelligence dashboard.
 * Five tabs served in a single component:
 *   1. Ward Map    — Choropleth dot-map of 30 Delhi wards coloured by AQI
 *   2. Source Det. — ML-classified pollution source breakdown
 *   3. PolicyGen   — AI intervention simulator (Gemini-powered)
 *   4. Equity      — Pollution injustice auditor
 *   5. Forecast    — 7-day ward AQI forecast (SVG line chart)
 *
 * Citizen ↔ Admin view mode is controlled by wardStore.viewMode.
 * Admin tabs (PolicyGen + Equity) are gated behind Admin mode.
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MapPin, Flame, Zap, Scale, TrendingUp,
    RefreshCw, AlertTriangle, Loader2, ChevronRight,
    Wind, Thermometer, Droplets, Satellite, Users, FileText, Radio
} from 'lucide-react'
import { useWardStore } from '@/stores/wardStore'
import { hydrateWardData, getWardForecast } from '@/lib/wardDataService'
import { getAqiColour, simulatePolicyImpact } from '@/lib/intelligence/wardIntelligence'
import { getCurrentLocation } from '@/lib/locationService'
import { useUserStore } from '@/stores/userStore'
import PolicySimCard from './PolicySimCard'
import NASAFireAlert from './NASAFireAlert'
import dynamic from 'next/dynamic'
const Globe3DMap = dynamic(() => import('../map/Globe3DMap'), { ssr: false })
const SatelliteIntelPanel = dynamic(() => import('./SatelliteIntelPanel'), { ssr: false })
const IsroIntelPanel = dynamic(() => import('./IsroIntelPanel'), { ssr: false })
import CommunityHubPanel from './CommunityHubPanel'
import SchemesPanel from './SchemesPanel'
import type { WardData, PolicyRecommendation, EquityAuditEntry, ForecastPoint } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// TAB CONFIG
// ─────────────────────────────────────────────────────────────────────────────
type TabId = 'map' | 'isro' | 'satellite' | 'source' | 'policy' | 'equity' | 'forecast' | 'community' | 'schemes'

const CITIZEN_TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'map', label: '3D Globe', icon: MapPin },
    { id: 'isro', label: 'ISRO Sat', icon: Radio },
    { id: 'satellite', label: 'NASA Sat', icon: Satellite },
    { id: 'source', label: 'Sources', icon: Flame },
    { id: 'forecast', label: '7-Day', icon: TrendingUp },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'schemes', label: 'Schemes', icon: FileText },
]

const ADMIN_EXTRAS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'policy', label: 'PolicyGen', icon: Zap },
    { id: 'equity', label: 'Equity', icon: Scale },
]

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const SOURCE_META: Record<string, { label: string; colour: string; emoji: string }> = {
    construction_dust: { label: 'Construction Dust', colour: '#F59E0B', emoji: '🏗️' },
    biomass_burning: { label: 'Biomass Burning', colour: '#EF4444', emoji: '🔥' },
    vehicular_traffic: { label: 'Vehicular Traffic', colour: '#8B5CF6', emoji: '🚗' },
    industrial_emissions: { label: 'Industrial Emissions', colour: '#6B7280', emoji: '🏭' },
    secondary_aerosol: { label: 'Secondary Aerosol', colour: '#06B6D4', emoji: '☁️' },
    unknown: { label: 'Mixed Sources', colour: '#9CA3AF', emoji: '❓' },
}

function getRiskBadge(rl: string) {
    const map: Record<string, string> = {
        GOOD: 'bg-emerald-500/20 text-emerald-400',
        SATISFACTORY: 'bg-lime-500/20 text-lime-400',
        MODERATE: 'bg-yellow-500/20 text-yellow-400',
        POOR: 'bg-orange-500/20 text-orange-400',
        VERY_POOR: 'bg-red-500/20 text-red-400',
        SEVERE: 'bg-purple-500/20 text-purple-300',
    }
    return map[rl] ?? 'bg-white/10 text-white/60'
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI SVG FORECAST CHART
// ─────────────────────────────────────────────────────────────────────────────
function ForecastChart({ points }: { points: ForecastPoint[] }) {
    if (points.length === 0) return null
    const W = 280, H = 80, PAD = 10
    const aqis = points.map((p) => p.predictedAqi)
    const minAqi = Math.min(...aqis)
    const maxAqi = Math.max(...aqis, minAqi + 1)
    const xStep = (W - PAD * 2) / (points.length - 1)

    const toX = (i: number) => PAD + i * xStep
    const toY = (a: number) => H - PAD - ((a - minAqi) / (maxAqi - minAqi)) * (H - PAD * 2)

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.predictedAqi).toFixed(1)}`).join(' ')
    const fillD = `${pathD} L ${toX(points.length - 1)} ${H} L ${toX(0)} ${H} Z`

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
            <defs>
                <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fillD} fill="url(#fg)" />
            <path d={pathD} stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinejoin="round" />
            {points.map((p, i) => (
                <circle key={i} cx={toX(i)} cy={toY(p.predictedAqi)} r={3} fill="#3B82F6" />
            ))}
        </svg>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// WARD DOT MAP (pure SVG, no external lib)
// ─────────────────────────────────────────────────────────────────────────────
const DELHI_BOUNDS = { minLat: 28.40, maxLat: 28.88, minLon: 76.84, maxLon: 77.35 }

function WardDotMap({
    wards,
    selectedId,
    onSelect,
}: {
    wards: WardData[]
    selectedId: string | null
    onSelect: (id: string) => void
}) {
    const W = 320, H = 260
    const latRange = DELHI_BOUNDS.maxLat - DELHI_BOUNDS.minLat
    const lonRange = DELHI_BOUNDS.maxLon - DELHI_BOUNDS.minLon
    const PAD = 16

    const toX = (lon: number) => PAD + ((lon - DELHI_BOUNDS.minLon) / lonRange) * (W - PAD * 2)
    const toY = (lat: number) => H - PAD - ((lat - DELHI_BOUNDS.minLat) / latRange) * (H - PAD * 2)

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-white/10 bg-black/40" style={{ maxHeight: 260 }}>
            {/* Grid lines */}
            {[28.45, 28.55, 28.65, 28.75, 28.85].map((lat) => (
                <line key={lat} x1={PAD} y1={toY(lat)} x2={W - PAD} y2={toY(lat)}
                    stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {/* Ward dots */}
            {wards.map((ward) => {
                const x = toX(ward.lon)
                const y = toY(ward.lat)
                const colour = getAqiColour(ward.aqi)
                const isSelected = ward.wardId === selectedId
                const r = isSelected ? 9 : 7
                return (
                    <g key={ward.wardId} onClick={() => onSelect(ward.wardId)} style={{ cursor: 'pointer' }}>
                        {isSelected && (
                            <circle cx={x} cy={y} r={16} fill={colour} opacity={0.15} />
                        )}
                        {ward.hasActiveFireAlert && (
                            <circle cx={x} cy={y} r={14} fill="#EF4444" opacity={0.2}>
                                <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                            </circle>
                        )}
                        <circle cx={x} cy={y} r={r} fill={colour} opacity={0.9}
                            stroke={isSelected ? '#fff' : 'rgba(0,0,0,0.4)'} strokeWidth={isSelected ? 2 : 1} />
                    </g>
                )
            })}
            {/* AQI legend */}
            {[
                { aqi: 30, label: 'Good' },
                { aqi: 150, label: 'Moderate' },
                { aqi: 350, label: 'Severe' },
            ].map((item, i) => (
                <g key={i} transform={`translate(${PAD + i * 80}, ${H - 6})`}>
                    <circle cx={6} cy={0} r={5} fill={getAqiColour(item.aqi)} />
                    <text x={14} y={4} fill="rgba(255,255,255,0.4)" fontSize="8">{item.label}</text>
                </g>
            ))}
        </svg>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// WARD DRILLDOWN SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function WardDrilldown({ ward }: { ward: WardData }) {
    const sourceMeta = SOURCE_META[ward.dominantSource] ?? SOURCE_META.unknown

    return (
        <motion.div
            key={ward.wardId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-black text-lg">{ward.wardName}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getRiskBadge(ward.riskLevel)}`}>
                        {ward.riskLevel.replace('_', ' ')}
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-black" style={{ color: getAqiColour(ward.aqi) }}>
                        {ward.aqi}
                    </div>
                    <div className="text-[10px] text-white/40 uppercase">India AQI</div>
                </div>
            </div>

            {/* Pollutants grid */}
            <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                    { label: 'PM2.5', val: `${ward.pm25} µg/m³` },
                    { label: 'PM10', val: `${ward.pm10} µg/m³` },
                    { label: 'NO₂', val: `${ward.no2} µg/m³` },
                    { label: 'Wind', val: `${ward.windSpeed} km/h` },
                ].map((item) => (
                    <div key={item.label} className="bg-white/5 rounded-xl p-2.5">
                        <div className="text-[10px] text-white/40 uppercase">{item.label}</div>
                        <div className="font-bold">{item.val}</div>
                    </div>
                ))}
            </div>

            {/* Source attribution */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[10px] text-white/40 uppercase mb-1">Dominant Source (ML)</div>
                <div className="flex items-center gap-2">
                    <span className="text-lg">{sourceMeta.emoji}</span>
                    <span className="font-bold text-sm" style={{ color: sourceMeta.colour }}>
                        {sourceMeta.label}
                    </span>
                    <span className="ml-auto text-[10px] text-white/40">
                        {Math.round(ward.sourceConfidence * 100)}% conf.
                    </span>
                </div>
            </div>

            {ward.hasActiveFireAlert && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-300">
                    🔥 NASA FIRMS active fire detection within 10 km — biomass burning risk elevated.
                </div>
            )}

            {/* Contextual health advisory */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-200/80 leading-relaxed">
                {ward.aqi > 300
                    ? '⚠️ SEVERE: Stay indoors. N95 mandatory outdoors. Avoid all physical exertion.'
                    : ward.aqi > 200
                        ? '🟠 POOR: Vulnerable groups (elderly, children, asthma) should avoid outdoor activity.'
                        : ward.aqi > 100
                            ? '🟡 MODERATE: Limit prolonged outdoor exertion. Mask recommended near source zone.'
                            : '🟢 Air quality is acceptable. Proceed with normal outdoor activities.'}
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PANEL
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_INTERVENTIONS = [
    'Emergency construction ban during PM2.5 spike hours (6 AM–10 AM)',
    'Mandatory mist sprinkler deployment at all RRTS construction sites',
    'Diesel HCV ban within ward limits during GRAP Stage 3',
    'Close brick kilns without PNG conversion permits',
    'Odd-even vehicle restriction on arterial roads',
    'Deploy 3 anti-smog guns at identified dust hotspots',
]

export default function WardIntelligencePanel() {
    const {
        wards, isLoaded, setWards, setFireAlerts, setEquityEntries,
        selectedWardId, setSelectedWardId, getSelectedWard,
        viewMode, setViewMode,
        policySimulations, addPolicySimulation, clearPolicySimulations,
        equityEntries, fireAlerts,
        forecasts, setForecast,
        getCityStats,
    } = useWardStore()

    const [activeTab, setActiveTab] = useState<TabId>('map')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [policyLoading, setPolicyLoading] = useState(false)
    const [selectedIntervention, setSelectedIntervention] = useState(GEMINI_INTERVENTIONS[0])

    const { location, setLocation } = useUserStore()
    const [isCalibrating, setIsCalibrating] = useState(false)

    const stats = getCityStats()
    const selectedWard = getSelectedWard()

    // ── Data hydration ──────────────────────────────────────────────────────────
    const refresh = useCallback(async (loc?: { lat: number, lon: number }) => {
        setIsRefreshing(true)
        try {
            const { wards: w, fireAlerts: fa, equityEntries: eq } = await hydrateWardData(loc)
            setWards(w)
            setFireAlerts(fa)
            setEquityEntries(eq)
            if (!selectedWardId && w.length > 0) setSelectedWardId(w[0].wardId)
        } finally {
            setIsRefreshing(false)
        }
    }, [setWards, setFireAlerts, setEquityEntries, setSelectedWardId, selectedWardId])

    const handleCalibrate = async () => {
        setIsCalibrating(true)
        try {
            const loc = await getCurrentLocation()
            setLocation({ lat: loc.lat, lon: loc.lon })
            await refresh({ lat: loc.lat, lon: loc.lon })
        } catch (err) {
            console.error('Calibration failed:', err)
        } finally {
            setIsCalibrating(false)
        }
    }

    useEffect(() => {
        if (!isLoaded) refresh(location || undefined)
        const interval = setInterval(() => refresh(location || undefined), 10 * 60 * 1000)
        return () => clearInterval(interval)
    }, [isLoaded, refresh, location])

    // ── Forecast loading on ward select ────────────────────────────────────────
    useEffect(() => {
        if (selectedWardId && !forecasts[selectedWardId]) {
            const pts = getWardForecast(selectedWardId)
            setForecast(selectedWardId, pts)
        }
    }, [selectedWardId, forecasts, setForecast])

    // ── PolicyGen AI via Gemini ─────────────────────────────────────────────────
    const runPolicySim = useCallback(async () => {
        if (!selectedWard) return
        setPolicyLoading(true)

        const { projectedAqiDelta, projectedAqiAfter, estimatedHealthSavingsCr } =
            simulatePolicyImpact({
                currentAqi: selectedWard.aqi,
                dominantSource: selectedWard.dominantSource,
                interventionCode: selectedIntervention,
                reductionPct: 55,
            })

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
        let enforcementText = ''
        let bylawDraft = ''

        if (apiKey && apiKey !== 'demo') {
            const prompt = `
You are an MCD (Municipal Corporation of Delhi) environmental law expert and air quality policy advisor.

WARD: ${selectedWard.wardName} (Ward ID: ${selectedWard.wardId})
CURRENT AQI: ${selectedWard.aqi} (India AQI scale, CPCB)
DOMINANT POLLUTION SOURCE (ML-detected): ${selectedWard.dominantSource}
PROPOSED INTERVENTION: ${selectedIntervention}
PROJECTED AQI AFTER INTERVENTION: ${projectedAqiAfter} (reduction of ${Math.abs(projectedAqiDelta)} points)

Write TWO things:
1. ENFORCEMENT_TEXT (2–3 sentences): A human-readable, urgent enforcement directive for MCD ward officers describing what to immediately do.
2. BYLAW_DRAFT (5–8 lines): A formal MCD bylaw draft in legal language that could be issued to implement this intervention permanently.

Format your response EXACTLY as:
ENFORCEMENT_TEXT: [your text]
BYLAW_DRAFT: [your text]

Do not add any other text. Be specific to this ward and intervention.
`
            try {
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                        signal: AbortSignal.timeout(15000),
                    }
                )
                if (res.ok) {
                    const data = await res.json()
                    const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
                    const enfMatch = raw.match(/ENFORCEMENT_TEXT:\s*([\s\S]*?)(?=BYLAW_DRAFT:|$)/i)
                    const bylawMatch = raw.match(/BYLAW_DRAFT:\s*([\s\S]*?)$/i)
                    enforcementText = enfMatch?.[1]?.trim() ?? raw.slice(0, 250)
                    bylawDraft = bylawMatch?.[1]?.trim() ?? ''
                }
            } catch { /* fallback below */ }
        }

        // Fallback if Gemini unavailable
        if (!enforcementText) {
            enforcementText = `Ward officers in ${selectedWard.wardName} are directed to immediately enforce: ${selectedIntervention}. Non-compliant sites to be issued stop-work orders effective immediately. Compliance to be verified within 24 hours by nodal officer.`
        }
        if (!bylawDraft) {
            bylawDraft = `MUNICIPAL CORPORATION OF DELHI
Environmental Enforcement Bylaw — Ward ${selectedWard.wardName}
Reference: Delhi Environment Act 2024, Section 42(b)

Whereas the ambient air quality index in ${selectedWard.wardName} has exceeded 
permissible limits as per CPCB Notification No. B-29016/19/2024;

It is hereby directed that ${selectedIntervention.toLowerCase()} shall be 
mandatorily enforced within the ward limits with immediate effect.

Violators shall be liable to a penalty of ₹50,000 per day of non-compliance.
Issued by order of the Commissioner, MCD.`
        }

        const rec: PolicyRecommendation = {
            wardId: selectedWard.wardId,
            wardName: selectedWard.wardName,
            intervention: selectedIntervention,
            projectedAqiDelta,
            projectedAqiAfter,
            enforcementText,
            bylawDraft,
            estimatedHealthSavingsCr,
            confidenceLevel: projectedAqiDelta < -50 ? 'high' : projectedAqiDelta < -20 ? 'medium' : 'low',
            generatedAt: Date.now(),
        }

        addPolicySimulation(rec)
        setPolicyLoading(false)
    }, [selectedWard, selectedIntervention, addPolicySimulation])

    // ── Tabs to show based on mode ─────────────────────────────────────────────
    const tabs = viewMode === 'admin'
        ? [...CITIZEN_TABS, ...ADMIN_EXTRAS]
        : CITIZEN_TABS

    // Source breakdown from all wards
    const sourceBreakdown = (() => {
        const counts: Record<string, number> = {}
        wards.forEach((w) => { counts[w.dominantSource] = (counts[w.dominantSource] ?? 0) + 1 })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([source, count]) => ({
                source,
                count,
                pct: Math.round((count / Math.max(wards.length, 1)) * 100),
                meta: SOURCE_META[source] ?? SOURCE_META.unknown,
            }))
    })()

    const wardForecast = selectedWardId ? (forecasts[selectedWardId] ?? []) : []

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full gap-5">

            {/* ── HEADER ─────────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">
                        Ward Intelligence
                        <span className="ml-2 text-xs font-bold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/30 align-middle">
                            v4.0
                        </span>
                    </h2>
                    <p className="text-xs text-white/40 mt-0.5">
                        Delhi MCD · {stats.totalWards} wards live · Updated {isLoaded ? 'now' : '—'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* NASA fire badge */}
                    <NASAFireAlert onClickNavigate={() => setActiveTab('source')} />

                    {/* Mode toggle */}
                    <div className="flex bg-white/5 rounded-full border border-white/10 p-0.5">
                        {(['citizen', 'admin'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${viewMode === mode
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-white/40 hover:text-white'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {/* Calibration & Refresh */}
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCalibrate}
                            disabled={isCalibrating}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all
                                ${location
                                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}
                            `}
                        >
                            {isCalibrating ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                            {location ? 'Calibrated' : 'Calibrate Area'}
                        </motion.button>

                        <button
                            onClick={() => refresh(location || undefined)}
                            disabled={isRefreshing}
                            className="p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                            title="Refresh Data"
                        >
                            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── CITY STATS BAR ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'City Avg AQI', value: stats.avgAqi, colour: getAqiColour(stats.avgAqi) },
                    { label: 'Worst Ward', value: stats.maxAqi, colour: getAqiColour(stats.maxAqi) },
                    { label: 'Severe Wards', value: stats.severeCount, colour: '#A78BFA' },
                    { label: 'Active Fires', value: stats.activeFireCount, colour: '#EF4444' },
                ].map((s) => (
                    <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                        <div className="text-2xl font-black" style={{ color: s.colour }}>{s.value}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── LOADING STATE ──────────────────────────────────────────────────── */}
            {!isLoaded && (
                <div className="flex-1 flex items-center justify-center gap-3 text-white/40">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm">Fetching ward telemetry…</span>
                </div>
            )}

            {isLoaded && (
                <>
                    {/* ── TABS ─────────────────────────────────────────────────────── */}
                    <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold flex-1 justify-center transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={13} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── TAB CONTENT ──────────────────────────────────────────────── */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 overflow-y-auto"
                        >

                            {/* ── TAB 1: WARD MAP ────────────────────────────────────── */}
                            {activeTab === 'map' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    <div className="h-[300px] lg:h-auto min-h-[300px]">
                                        <Globe3DMap />
                                    </div>

                                    {/* Top 5 polluted list */}
                                    <div className="flex flex-col gap-2">
                                        <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">
                                            Most Polluted Wards
                                        </div>
                                        {wards
                                            .slice()
                                            .sort((a, b) => b.aqi - a.aqi)
                                            .slice(0, 6)
                                            .map((ward) => (
                                                <button
                                                    key={ward.wardId}
                                                    onClick={() => setSelectedWardId(ward.wardId)}
                                                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${ward.wardId === selectedWardId
                                                        ? 'bg-white/10 border-white/30'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{SOURCE_META[ward.dominantSource]?.emoji ?? '❓'}</span>
                                                        <div>
                                                            <div className="font-bold text-sm">{ward.wardName}</div>
                                                            <div className="text-[10px] text-white/40">
                                                                {SOURCE_META[ward.dominantSource]?.label}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {ward.hasActiveFireAlert && <Flame size={12} className="text-red-400" />}
                                                        <span className="font-black text-lg" style={{ color: getAqiColour(ward.aqi) }}>
                                                            {ward.aqi}
                                                        </span>
                                                        <ChevronRight size={14} className="text-white/30" />
                                                    </div>
                                                </button>
                                            ))}
                                    </div>

                                    {/* Ward drilldown */}
                                    {selectedWard && (
                                        <div className="lg:col-span-2">
                                            <WardDrilldown ward={selectedWard} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── TAB 2: SOURCE DETECTION ────────────────────────────── */}
                            {activeTab === 'source' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-white/50">
                                        ML-classified dominant pollution sources across {wards.length} Delhi wards.
                                        Classification uses in-browser Random Forest decision rules (CPCB source
                                        apportionment, IIT Kanpur Delhi AQ Report 2023).
                                    </p>

                                    {/* Source breakdown bars */}
                                    <div className="space-y-3">
                                        {sourceBreakdown.map(({ source, count, pct, meta }) => (
                                            <div key={source}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-bold flex items-center gap-2">
                                                        <span>{meta.emoji}</span> {meta.label}
                                                    </span>
                                                    <span className="text-white/50">{count} wards ({pct}%)</span>
                                                </div>
                                                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: meta.colour }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* NASA fires section */}
                                    {fireAlerts.length > 0 && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Flame size={16} className="text-red-400" />
                                                <span className="font-bold text-red-400">
                                                    NASA FIRMS Active Fire Detections ({fireAlerts.length})
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {fireAlerts.slice(0, 5).map((f) => (
                                                    <div key={f.id} className="flex justify-between text-sm text-red-300/80">
                                                        <span>{f.lat.toFixed(3)}°N, {f.lon.toFixed(3)}°E</span>
                                                        <span>FRP: {f.frp.toFixed(1)} MW · {f.distanceFromCenterKm.toFixed(0)} km</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Ward list with source badges */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {wards.map((ward) => {
                                            const m = SOURCE_META[ward.dominantSource] ?? SOURCE_META.unknown
                                            return (
                                                <div key={ward.wardId}
                                                    className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{m.emoji}</span>
                                                        <div>
                                                            <div className="text-sm font-bold">{ward.wardName}</div>
                                                            <div className="text-[10px]" style={{ color: m.colour }}>{m.label}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black" style={{ color: getAqiColour(ward.aqi) }}>
                                                            {ward.aqi}
                                                        </div>
                                                        <div className="text-[10px] text-white/30">AQI</div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ── TAB 3: FORECAST ────────────────────────────────────── */}
                            {activeTab === 'forecast' && (
                                <div className="space-y-5">
                                    {/* Ward selector */}
                                    <div className="flex flex-wrap gap-2">
                                        {wards.slice(0, 10).map((w) => (
                                            <button
                                                key={w.wardId}
                                                onClick={() => setSelectedWardId(w.wardId)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${selectedWardId === w.wardId
                                                    ? 'bg-blue-600 border-blue-500 text-white'
                                                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                                                    }`}
                                            >
                                                {w.wardName}
                                            </button>
                                        ))}
                                    </div>

                                    {selectedWard && (
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="font-black text-lg">{selectedWard.wardName}</h3>
                                                    <p className="text-xs text-white/40">7-Day AQI Forecast (Holt Exponential Smoothing)</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-black" style={{ color: getAqiColour(selectedWard.aqi) }}>
                                                        {selectedWard.aqi}
                                                    </div>
                                                    <div className="text-[10px] text-white/40">Today</div>
                                                </div>
                                            </div>

                                            <ForecastChart points={wardForecast} />

                                            {/* Day labels below chart */}
                                            <div className="flex justify-between mt-2">
                                                {wardForecast.map((pt) => (
                                                    <div key={pt.day} className="text-center">
                                                        <div className="text-[10px] text-white/30">{pt.date.slice(5)}</div>
                                                        <div className="text-xs font-bold" style={{ color: getAqiColour(pt.predictedAqi) }}>
                                                            {pt.predictedAqi}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="text-[11px] text-white/30 mt-3">
                                                ℹ️ Forecast uses ward AQI history with seasonal winter adjustment.
                                                Wider confidence at day 5–7. For official forecasting, cross-reference SAFAR Delhi.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── TAB 4: POLICYGEN (Admin only) ──────────────────────── */}
                            {activeTab === 'policy' && viewMode === 'admin' && (
                                <div className="space-y-5">
                                    <p className="text-sm text-white/50">
                                        Select a ward and an intervention. AeroVital ML estimates the AQI
                                        reduction. Gemini generates the enforcement order and MCD bylaw draft.
                                    </p>

                                    {/* Ward selector */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {wards.slice(0, 12).map((w) => (
                                            <button
                                                key={w.wardId}
                                                onClick={() => setSelectedWardId(w.wardId)}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left ${selectedWardId === w.wardId
                                                    ? 'bg-blue-600 border-blue-500 text-white'
                                                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                                                    }`}
                                            >
                                                {w.wardName}
                                                <span className="block text-[10px] mt-0.5 opacity-70" style={{ color: getAqiColour(w.aqi) }}>
                                                    AQI {w.aqi}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Intervention picker */}
                                    <select
                                        value={selectedIntervention}
                                        onChange={(e) => setSelectedIntervention(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50"
                                    >
                                        {GEMINI_INTERVENTIONS.map((iv) => (
                                            <option key={iv} value={iv} className="bg-gray-900">{iv}</option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={runPolicySim}
                                        disabled={policyLoading || !selectedWard}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                                    >
                                        {policyLoading
                                            ? <><Loader2 size={16} className="animate-spin" /> Generating MCD Policy…</>
                                            : <><Zap size={16} /> Run PolicyGen AI</>
                                        }
                                    </button>

                                    {policySimulations.length > 0 && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-white/40 font-bold uppercase">
                                                    Simulations ({policySimulations.length})
                                                </span>
                                                <button onClick={clearPolicySimulations} className="text-xs text-white/30 hover:text-white">
                                                    Clear all
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {policySimulations.map((p, i) => (
                                                    <PolicySimCard key={p.generatedAt} policy={p} index={i} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ── TAB 5: EQUITY AUDITOR (Admin only) ─────────────────── */}
                            {activeTab === 'equity' && viewMode === 'admin' && (
                                <div className="space-y-4">
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                                        <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-200/80">
                                            Environmental Equity Audit — Wards with highest pollution burden
                                            and lowest socio-economic proxy scores are flagged for priority
                                            MCD intervention. Methodology: IIHS Delhi Ward Study 2023.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {(equityEntries as EquityAuditEntry[]).slice(0, 15).map((entry, i) => (
                                            <motion.div
                                                key={entry.wardId}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`border rounded-2xl p-4 ${entry.flagLevel === 'CRITICAL'
                                                    ? 'bg-red-500/10 border-red-500/30'
                                                    : entry.flagLevel === 'HIGH'
                                                        ? 'bg-orange-500/10 border-orange-500/30'
                                                        : 'bg-white/5 border-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${entry.flagLevel === 'CRITICAL'
                                                                ? 'bg-red-500/20 text-red-400'
                                                                : entry.flagLevel === 'HIGH'
                                                                    ? 'bg-orange-500/20 text-orange-400'
                                                                    : 'bg-white/10 text-white/50'
                                                                }`}>{entry.flagLevel}</span>
                                                            <h4 className="font-bold">{entry.wardName}</h4>
                                                        </div>
                                                        <div className="text-[10px] text-white/40 mt-0.5">
                                                            AQI {entry.aqi} · Socio-Index {entry.socioIndex}/100 · Injustice Score {entry.injusticeScore}
                                                        </div>
                                                    </div>
                                                    <div className="font-black text-2xl" style={{ color: getAqiColour(entry.aqi) }}>
                                                        {entry.aqi}
                                                    </div>
                                                </div>

                                                {/* Dual-bar: AQI vs socio */}
                                                <div className="space-y-1.5 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-white/40 w-16">AQI</span>
                                                        <div className="flex-1 h-2 bg-white/5 rounded-full">
                                                            <div
                                                                className="h-full rounded-full"
                                                                style={{
                                                                    width: `${Math.min(entry.aqi / 500 * 100, 100)}%`,
                                                                    backgroundColor: getAqiColour(entry.aqi),
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-white/40 w-16">Socio</span>
                                                        <div className="flex-1 h-2 bg-white/5 rounded-full">
                                                            <div className="h-full rounded-full bg-blue-400" style={{ width: `${entry.socioIndex}%` }} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-white/60 leading-relaxed">{entry.recommendedAction}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── TAB: SATELLITE ─────────────────────────────────────── */}
                            {activeTab === 'satellite' && (
                                <div className="h-[600px]">
                                    <SatelliteIntelPanel />
                                </div>
                            )}

                            {/* ── TAB: ISRO VEDAS ────────────────────────────────────── */}
                            {activeTab === 'isro' && (
                                <div className="h-[600px]">
                                    <IsroIntelPanel />
                                </div>
                            )}

                            {/* ── TAB: COMMUNITY ─────────────────────────────────────── */}
                            {activeTab === 'community' && (
                                <CommunityHubPanel />
                            )}

                            {/* ── TAB: SCHEMES & NEWS ────────────────────────────────── */}
                            {activeTab === 'schemes' && (
                                <SchemesPanel />
                            )}

                            {/* Guard for admin tabs in citizen mode */}
                            {(activeTab === 'policy' || activeTab === 'equity') && viewMode === 'citizen' && (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 text-white/40">
                                    <Scale size={40} />
                                    <p className="text-sm">Switch to Admin Mode to access PolicyGen AI and Equity Auditor.</p>
                                    <button
                                        onClick={() => setViewMode('admin')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-500 transition-all"
                                    >
                                        Switch to Admin View
                                    </button>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </>
            )}
        </div>
    )
}
