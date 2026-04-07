import { create } from 'zustand'

interface XPToastData {
  id: string
  xp: number
  bonus: boolean
}

interface CelebrationData {
  days: number
}

interface GamificationState {
  toasts: XPToastData[]
  celebration: CelebrationData | null
  showToast: (xp: number, bonus?: boolean) => void
  dismissToast: (id: string) => void
  showCelebration: (days: number) => void
  dismissCelebration: () => void
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  toasts: [],
  celebration: null,
  showToast: (xp, bonus = false) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, xp, bonus }] }))
    setTimeout(() => get().dismissToast(id), 3000)
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  showCelebration: (days) => set({ celebration: { days } }),
  dismissCelebration: () => set({ celebration: null }),
}))
