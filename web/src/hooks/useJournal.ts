import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { JournalEntry } from '../lib/types'

export function useJournalEntries() {
  const { session } = useAuthStore()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['journal', userId],
    enabled: !!userId,
    queryFn: async (): Promise<JournalEntry[]> => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })
}

export function useUpsertJournal() {
  const qc = useQueryClient()
  const { session } = useAuthStore()

  return useMutation({
    mutationFn: async (entry: Partial<JournalEntry> & { id?: string }) => {
      const userId = session!.user.id
      if (entry.id) {
        const { error } = await supabase
          .from('journal_entries')
          .update({ content: entry.content, mood_score: entry.mood_score, updated_at: new Date().toISOString() })
          .eq('id', entry.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('journal_entries')
          .insert({ ...entry, user_id: userId })
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal'] }),
  })
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('journal_entries').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal'] }),
  })
}
