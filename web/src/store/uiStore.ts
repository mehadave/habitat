import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  darkMode: boolean
  streakShields: number
  toggleDarkMode: () => void
  setDarkMode: (v: boolean) => void
  addShield: () => void
  useShield: () => boolean
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      darkMode: true,
      streakShields: 0,
      toggleDarkMode: () => {
        const next = !get().darkMode
        set({ darkMode: next })
        document.body.classList.toggle('light-mode', !next)
      },
      setDarkMode: (v) => {
        set({ darkMode: v })
        document.body.classList.toggle('light-mode', !v)
      },
      addShield: () => set((s) => ({ streakShields: Math.min(s.streakShields + 1, 3) })),
      useShield: () => {
        const shields = get().streakShields
        if (shields > 0) {
          set({ streakShields: shields - 1 })
          return true
        }
        return false
      },
    }),
    { name: 'habitat-ui' }
  )
)
