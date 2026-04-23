import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useGamificationStore } from '../store/gamificationStore'
import { isStreakMilestone } from '../lib/gamification'
import type { Habit, HabitWithStreak } from '../lib/types'

// Use local date (not UTC) everywhere
export function localDateStr(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Calculate current streak from sorted completion date strings (ascending)
function calcCurrentStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0
  const today = localDateStr()
  const yesterday = localDateStr(new Date(Date.now() - 86400000))
  const last = sortedDates[sortedDates.length - 1]
  if (last !== today && last !== yesterday) return 0
  let count = 1
  for (let i = sortedDates.length - 2; i >= 0; i--) {
    const curr = new Date(sortedDates[i] + 'T00:00:00')
    const next = new Date(sortedDates[i + 1] + 'T00:00:00')
    const diff = Math.round((next.getTime() - curr.getTime()) / 86400000)
    if (diff === 1) count++
    else break
  }
  return count
}

// Calculate longest streak from sorted completion date strings (ascending)
function calcLongestStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0
  let longest = 1, run = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1] + 'T00:00:00')
    const curr = new Date(sortedDates[i] + 'T00:00:00')
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000)
    if (diff === 1) { run++; longest = Math.max(longest, run) }
    else run = 1
  }
  return longest
}

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

      // Fetch ALL completions — no date cap — so streak & total count are always accurate
      const { data: completions } = await supabase
        .from('habit_completions')
        .select('habit_id, completed_date')
        .eq('user_id', userId!)
        .order('completed_date', { ascending: true })

      return (habits || []).map((h: Habit) => {
        const habitDates = (completions ?? [])
          .filter((c) => c.habit_id === h.id)
          .map((c) => c.completed_date as string)
          .filter((d, i, arr) => arr.indexOf(d) === i)

        const dynamicCurrent = calcCurrentStreak(habitDates)
        const dynamicLongest = calcLongestStreak(habitDates)

        return {
          ...h,
          streak: {
            habit_id: h.id,
            user_id: userId!,
            current_streak: dynamicCurrent,
            longest_streak: Math.max(dynamicLongest, dynamicCurrent),
            last_completed_date: habitDates.length > 0 ? habitDates[habitDates.length - 1] : undefined,
          },
          completions: habitDates,
        }
      })
    },
  })
}

export function useToggleCompletion() {
  const qc = useQueryClient()
  const { session } = useAuthStore()
  const { showCelebration } = useGamificationStore()

  return useMutation({
    // Optimistic update — flip the cell immediately, sync DB in background
    onMutate: async ({ habit, date }: { habit: HabitWithStreak; date: string }) => {
      const userId = session!.user.id
      await qc.cancelQueries({ queryKey: ['habits', userId] })
      const previous = qc.getQueryData<HabitWithStreak[]>(['habits', userId])

      qc.setQueryData<HabitWithStreak[]>(['habits', userId], (old = []) =>
        old.map((h) => {
          if (h.id !== habit.id) return h
          const exists = (h.completions ?? []).includes(date)
          const newCompletions = exists
            ? (h.completions ?? []).filter((d) => d !== date)
            : [...(h.completions ?? []), date].sort()
          const newStreak = calcCurrentStreak(newCompletions)
          const newLongest = Math.max(calcLongestStreak(newCompletions), h.streak?.longest_streak ?? 0)
          return {
            ...h,
            completions: newCompletions,
            streak: {
              habit_id: h.id,
              user_id: h.streak?.user_id ?? '',
              current_streak: newStreak,
              longest_streak: newLongest,
              last_completed_date: newCompletions.length > 0 ? newCompletions[newCompletions.length - 1] : undefined,
            },
          }
        })
      )
      return { previous }
    },

    mutationFn: async ({ habit, date }: { habit: HabitWithStreak; date: string }) => {
      const userId = session!.user.id
      const exists = habit.completions?.includes(date)

      if (exists) {
        await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habit.id)
          .eq('completed_date', date)

        const { data: remaining } = await supabase
          .from('habit_completions')
          .select('completed_date')
          .eq('habit_id', habit.id)
          .order('completed_date', { ascending: true })

        const dates = (remaining || []).map((r: any) => r.completed_date as string)
        const newStreak = calcCurrentStreak(dates)
        const newLongest = calcLongestStreak(dates)
        const lastDate = dates.length > 0 ? dates[dates.length - 1] : null
        const startDate = newStreak > 0 ? dates[dates.length - newStreak] : null

        await supabase.from('streaks').upsert({
          habit_id: habit.id,
          user_id: userId,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_completed_date: lastDate,
          streak_start_date: startDate,
        }, { onConflict: 'habit_id' })

      } else {
        await supabase
          .from('habit_completions')
          .insert({ habit_id: habit.id, user_id: userId, completed_date: date })

        const { data: allDates } = await supabase
          .from('habit_completions')
          .select('completed_date')
          .eq('habit_id', habit.id)
          .order('completed_date', { ascending: true })

        const dates = (allDates || []).map((r: any) => r.completed_date as string)
        const newStreak = calcCurrentStreak(dates)
        const newLongest = Math.max(calcLongestStreak(dates), habit.streak?.longest_streak ?? 0)
        const lastDate = dates.length > 0 ? dates[dates.length - 1] : null
        const startDate = newStreak > 0 ? dates[dates.length - newStreak] : null

        await supabase.from('streaks').upsert({
          habit_id: habit.id,
          user_id: userId,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_completed_date: lastDate,
          streak_start_date: startDate,
        }, { onConflict: 'habit_id' })

        if (isStreakMilestone(newStreak)) {
          showCelebration(newStreak)
        }
      }
    },

    onError: (_err, _vars, context: any) => {
      // Roll back optimistic update on failure
      if (context?.previous) {
        qc.setQueryData(['habits', session!.user.id], context.previous)
      }
    },

    onSettled: () => {
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      qc.invalidateQueries({ queryKey: ['archived-habits'] })
    },
  })
}

export function useArchivedHabits() {
  const { session } = useAuthStore()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['archived-habits', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Habit[]> => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId!)
        .eq('is_active', false)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Habit[]
    },
  })
}

export function useRestoreHabit() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habits').update({ is_active: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      qc.invalidateQueries({ queryKey: ['archived-habits'] })
    },
  })
}

export function usePermanentlyDeleteHabit() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error: compErr } = await supabase.from('habit_completions').delete().eq('habit_id', id)
      if (compErr) throw compErr
      const { error: streakErr } = await supabase.from('streaks').delete().eq('habit_id', id)
      if (streakErr) throw streakErr
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      qc.invalidateQueries({ queryKey: ['archived-habits'] })
    },
  })
}
