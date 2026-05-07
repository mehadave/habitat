import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MANUAL_OVERRIDE_MS = 60 * 60 * 1000 // 1 hour

interface UIState {
  darkMode: boolean
  manualModeSetAt: number | null   // timestamp of last manual toggle
  toggleDarkMode: () => void
  setDarkMode: (v: boolean) => void
  isManualOverrideActive: () => boolean
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      darkMode: true,
      manualModeSetAt: null,
      toggleDarkMode: () => {
        const next = !get().darkMode
        set({ darkMode: next, manualModeSetAt: Date.now() })
        document.body.classList.toggle('light-mode', !next)
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next ? '#0B1120' : '#F0F4FF')
      },
      setDarkMode: (v) => {
        set({ darkMode: v })
        document.body.classList.toggle('light-mode', !v)
      },
      isManualOverrideActive: () => {
        const ts = get().manualModeSetAt
        return ts !== null && Date.now() - ts < MANUAL_OVERRIDE_MS
      },
    }),
    { name: 'habitat-ui' }
  )
)
