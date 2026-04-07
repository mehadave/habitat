import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useGamificationStore } from '../store/gamificationStore'
import { calculateXPGain, isStreakMilestone, shouldGetVariableReward } from '../lib/gamification'
import type { Habit, HabitWithStreak } from '../lib/types'

export function useHabits() {
  const { session } = useAuthStore()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['habits', userId],
    enabled: !!userId,
    queryFn: async (): Promise<HabitWithStreak[]> => {
      const { data: habits, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId!)
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error

      const { data: streaks } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId!)

      const { data: completions } = await supabase
        .from('habit_completions')
        .select('habit_id, completed_date')
        .eq('user_id', userId!)
        .gte('completed_date', new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

      return (habits || []).map((h: Habit) => ({
        ...h,
        streak: streaks?.find((s) => s.habit_id === h.id),
        completions: completions
          ?.filter((c) => c.habit_id === h.id)
          .map((c) => c.completed_date) ?? [],
      }))
    },
  })
}

export function useToggleCompletion() {
  const qc = useQueryClient()
  const { session } = useAuthStore()
  const { showToast, showCelebration } = useGamificationStore()

  return useMutation({
    mutationFn: async ({ habit, date }: { habit: HabitWithStreak; date: string }) => {
      const userId = session!.user.id
      const exists = habit.completions?.includes(date)

      if (exists) {
        await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habit.id)
          .eq('completed_date', date)
      } else {
        await supabase
          .from('habit_completions')
          .insert({ habit_id: habit.id, user_id: userId, completed_date: date })

        await supabase.rpc('upsert_streak', {
          p_habit_id: habit.id,
          p_user_id: userId,
          p_date: date,
        })

        const xp = calculateXPGain('habit_complete', habit.star_rating)
        await supabase.from('xp_events').insert({
          user_id: userId,
          habit_id: habit.id,
          event_type: 'habit_complete',
          xp_gained: xp,
        })
        await supabase.rpc('increment_user_xp', { uid: userId, amount: xp }).maybeSingle()

        const newStreak = (habit.streak?.current_streak ?? 0) + 1
        if (isStreakMilestone(newStreak)) {
          showCelebration(newStreak)
        }

        if (shouldGetVariableReward()) {
          showToast(25, true)
          await supabase.from('xp_events').insert({
            user_id: userId,
            habit_id: habit.id,
            event_type: 'bonus',
            xp_gained: 25,
          })
        } else {
          showToast(xp, false)
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}

export function useAddHabit() {
  const qc = useQueryClient()
  const { session } = useAuthStore()

  return useMutation({
    mutationFn: async (habit: Partial<Habit>) => {
      const { data, error } = await supabase
        .from('habits')
        .insert({ ...habit, user_id: session!.user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useUpdateHabit() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Habit> & { id: string }) => {
      const { error } = await supabase.from('habits').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useDeleteHabit() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habits').update({ is_active: false }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}
