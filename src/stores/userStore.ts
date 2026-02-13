import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface UserStore {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null })
    }),
    { name: 'aerovital-user' }
  )
)
