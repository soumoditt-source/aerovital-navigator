import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

export interface UserStore {
  user: User | null
  location: { lat: number, lon: number } | null
  setUser: (user: User) => void
  setLocation: (location: { lat: number, lon: number } | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      location: null,
      setUser: (user) => set({ user }),
      setLocation: (location) => set({ location }),
      clearUser: () => set({ user: null, location: null })
    }),
    {
      name: 'aerovital-user',
      partialize: (state) => ({ user: state.user }) // Don't persist location as it changes
    }
  )
)
