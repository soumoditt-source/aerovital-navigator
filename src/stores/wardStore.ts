/**
 * AEROVITAL v4.0 — Ward Intelligence Store
 * FullStack Shinobi · Soumoditya Das & Team
 *
 * Central Zustand store for all 272 MCD Delhi ward data objects,
 * selected ward drilldown state, AI policy simulations, and fire alerts.
 * All ward data flows through here after being hydrated by wardDataService.
 */
import { create } from 'zustand'
import type {
    WardData,
    PolicyRecommendation,
    EquityAuditEntry,
    FireAlert,
    ForecastPoint,
} from '@/types'

interface WardState {
    // ─── Ward Data ───────────────────────────────────────────────────────────
    wards: WardData[]
    setWards: (wards: WardData[]) => void

    /** Whether the first ward data fetch has completed */
    isLoaded: boolean
    setIsLoaded: (v: boolean) => void

    /** Timestamp of the most recent ward data refresh */
    lastRefreshedAt: number | null

    // ─── Selected Ward (drilldown panel) ─────────────────────────────────────
    selectedWardId: string | null
    setSelectedWardId: (id: string | null) => void
    getSelectedWard: () => WardData | undefined

    // ─── Dashboard Mode ───────────────────────────────────────────────────────
    /** 'citizen' shows health Advisory view; 'admin' shows PolicyGen + Equity */
    viewMode: 'citizen' | 'admin'
    setViewMode: (mode: 'citizen' | 'admin') => void

    // ─── AI Policy Simulations ────────────────────────────────────────────────
    policySimulations: PolicyRecommendation[]
    addPolicySimulation: (rec: PolicyRecommendation) => void
    clearPolicySimulations: () => void

    // ─── Equity Audit ─────────────────────────────────────────────────────────
    equityEntries: EquityAuditEntry[]
    setEquityEntries: (entries: EquityAuditEntry[]) => void

    // ─── NASA FIRMS Fire Alerts ───────────────────────────────────────────────
    fireAlerts: FireAlert[]
    setFireAlerts: (alerts: FireAlert[]) => void

    // ─── 7-Day Forecast (keyed by wardId) ────────────────────────────────────
    forecasts: Record<string, ForecastPoint[]>
    setForecast: (wardId: string, points: ForecastPoint[]) => void

    // ─── Convenience Selectors ────────────────────────────────────────────────
    /** Returns the top-N most polluted wards sorted descending by AQI */
    getTopPollutedWards: (n: number) => WardData[]
    /** Returns aggregate stats across all loaded wards */
    getCityStats: () => {
        avgAqi: number
        maxAqi: number
        severeCount: number
        totalWards: number
        activeFireCount: number
    }
}

export const useWardStore = create<WardState>((set, get) => ({
    // ─── Ward Data ───────────────────────────────────────────────────────────
    wards: [],
    isLoaded: false,
    lastRefreshedAt: null,

    setWards: (wards) =>
        set({ wards, isLoaded: true, lastRefreshedAt: Date.now() }),

    setIsLoaded: (v) => set({ isLoaded: v }),

    // ─── Selected Ward ────────────────────────────────────────────────────────
    selectedWardId: null,
    setSelectedWardId: (id) => set({ selectedWardId: id }),
    getSelectedWard: () => {
        const { wards, selectedWardId } = get()
        return wards.find((w) => w.wardId === selectedWardId)
    },

    // ─── Dashboard Mode ───────────────────────────────────────────────────────
    viewMode: 'citizen',
    setViewMode: (mode) => set({ viewMode: mode }),

    // ─── Policy Simulations ───────────────────────────────────────────────────
    policySimulations: [],
    addPolicySimulation: (rec) =>
        set((s) => ({ policySimulations: [rec, ...s.policySimulations].slice(0, 10) })),
    clearPolicySimulations: () => set({ policySimulations: [] }),

    // ─── Equity Audit ─────────────────────────────────────────────────────────
    equityEntries: [],
    setEquityEntries: (entries) => set({ equityEntries: entries }),

    // ─── Fire Alerts ──────────────────────────────────────────────────────────
    fireAlerts: [],
    setFireAlerts: (alerts) => set({ fireAlerts: alerts }),

    // ─── Forecasts ────────────────────────────────────────────────────────────
    forecasts: {},
    setForecast: (wardId, points) =>
        set((s) => ({ forecasts: { ...s.forecasts, [wardId]: points } })),

    // ─── Selectors ────────────────────────────────────────────────────────────
    getTopPollutedWards: (n) =>
        [...get().wards].sort((a, b) => b.aqi - a.aqi).slice(0, n),

    getCityStats: () => {
        const { wards, fireAlerts } = get()
        if (wards.length === 0) {
            return { avgAqi: 0, maxAqi: 0, severeCount: 0, totalWards: 0, activeFireCount: 0 }
        }
        const totalAqi = wards.reduce((s, w) => s + w.aqi, 0)
        return {
            avgAqi: Math.round(totalAqi / wards.length),
            maxAqi: Math.max(...wards.map((w) => w.aqi)),
            severeCount: wards.filter((w) => w.aqi > 300).length,
            totalWards: wards.length,
            activeFireCount: fireAlerts.length,
        }
    },
}))
