import { create } from 'zustand'

interface LocationStore {
    lat: number
    lon: number
    setLocation: (lat: number, lon: number) => void
}

export const useLocationStore = create<LocationStore>((set) => ({
    lat: 28.6139, // Default Delhi
    lon: 77.2090,
    setLocation: (lat, lon) => set({ lat, lon })
}))
