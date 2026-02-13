import { create } from 'zustand'

interface AtmosphereState {
    aqi: number
    pm25: number
    temperature: number
    humidity: number
    loading: boolean
    setReadings: (readings: { aqi: number; pm25: number; temperature: number; humidity: number }) => void
    setLoading: (loading: boolean) => void
}

export const useAtmosphereStore = create<AtmosphereState>((set) => ({
    aqi: 152,
    pm25: 84,
    temperature: 28,
    humidity: 65,
    loading: true,
    setReadings: (readings) => set({ ...readings, loading: false }),
    setLoading: (loading) => set({ loading }),
}))
