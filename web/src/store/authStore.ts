import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import type { User } from '../lib/types'

interface AuthState {
  session: Session | null
  supabaseUser: SupabaseUser | null
  profile: User | null
  isLoading: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      supabaseUser: null,
      profile: null,
      isLoading: true,
      setSession: (session) =>
        set({ session, supabaseUser: session?.user ?? null }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ session: null, supabaseUser: null, profile: null }),
    }),
    {
      name: 'habitat-auth',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)
