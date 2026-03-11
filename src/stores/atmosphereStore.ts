import { create } from 'zustand'

export interface AtmosphereState {
    aqi: number
    pm25: number
    temperature: number
    humidity: number
    loading: boolean
    pinnedLocation: { lat: number; lon: number } | null
    setReadings: (readings: { aqi: number; pm25: number; temperature: number; humidity: number }) => void
    setLoading: (loading: boolean) => void
    setPinnedLocation: (loc: { lat: number; lon: number } | null) => void
}

export const useAtmosphereStore = create<AtmosphereState>((set) => ({
    aqi: 0,
    pm25: 0,
    temperature: 0,
    humidity: 0,
    loading: true,
    pinnedLocation: null,
    setReadings: (readings) => set({ ...readings, loading: false }),
    setLoading: (loading) => set({ loading }),
    setPinnedLocation: (loc) => set({ pinnedLocation: loc }),
}))
