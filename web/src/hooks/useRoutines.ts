import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Routine } from '../lib/types'

export function useRoutines() {
  const { session } = useAuthStore()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['routines', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Routine[]> => {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', userId!)
        .order('sort_order')
      if (error) throw error
      return data as Routine[]
    },
  })
}

export function useAddRoutine() {
  const qc = useQueryClient()
  const { session } = useAuthStore()

  return useMutation({
    mutationFn: async (routine: Partial<Routine>) => {
      const { data, error } = await supabase
        .from('routines')
        .insert({ ...routine, user_id: session!.user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  })
}

export function useUpdateRoutine() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Routine> & { id: string }) => {
      const { error } = await supabase.from('routines').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  })
}

export function useDeleteRoutine() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('routines').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routines'] })
      // Habits that had this routine get routine_id = null via ON DELETE SET NULL
      qc.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}
