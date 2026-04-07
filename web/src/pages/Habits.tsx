import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabits, useAddHabit, useUpdateHabit, useDeleteHabit, useToggleCompletion } from '../hooks/useHabits'
import { HabitCard } from '../components/HabitCard'
import type { HabitWithStreak } from '../lib/types'

const EMOJIS = ['⭐','🏃','📚','💧','🧘','💪','🍎','😴','🎯','✍️','🎸','🌱','🧹','💊','☀️','🐬','🌊','🏊','🦋','🔥']

interface HabitFormData {
  name: string
  emoji: string
  description: string
  star_rating: number
  is_private: boolean
}

function AddEditSheet({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<HabitFormData>
  onSave: (data: HabitFormData) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<HabitFormData>({
    name: initial?.name ?? '',
    emoji: initial?.emoji ?? '⭐',
    description: initial?.description ?? '',
    star_rating: initial?.star_rating ?? 0,
    is_private: initial?.is_private ?? false,
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-lg rounded-t-3xl p-6"
        style={{ background: '#0F1B45', border: '1px solid rgba(255,255,255,0.09)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.2)' }} />
        <h2 className="text-base font-medium text-white mb-4">
          {initial?.name ? 'Edit habit' : 'New habit'}
        </h2>

        {/* Emoji picker */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setForm({ ...form, emoji: e })}
              className="text-2xl flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: form.emoji === e ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.07)',
                border: form.emoji === e ? '1px solid #2563EB' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {e}
            </button>
          ))}
        </div>

        <input
          placeholder="Habit name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
        />

        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3 resize-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
        />

        {/* Star rating */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Priority:</span>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setForm({ ...form, star_rating: n })}>
                <span style={{ fontSize: 20, color: n <= form.star_rating ? '#60A5FA' : 'rgba(255,255,255,0.2)' }}>★</span>
              </button>
            ))}
          </div>
          <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {form.star_rating === 5 ? '2× XP!' : ''}
          </span>
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-white">Private</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Blurs name & emoji</p>
          </div>
          <button
            onClick={() => setForm({ ...form, is_private: !form.is_private })}
            className="w-12 h-6 rounded-full relative transition-colors"
            style={{ background: form.is_private ? '#2563EB' : 'rgba(255,255,255,0.15)' }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
              style={{ left: form.is_private ? '50%' : '2px' }}
            />
          </button>
        </div>

        <button
          onClick={() => { if (form.name.trim()) onSave(form) }}
          disabled={!form.name.trim()}
          className="w-full py-3 rounded-xl text-sm font-medium text-white"
          style={{ background: form.name.trim() ? '#2563EB' : 'rgba(255,255,255,0.15)' }}
        >
          {initial?.name ? 'Save changes' : 'Add habit'}
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function Habits() {
  const { data: habits = [], isLoading } = useHabits()
  const addMutation = useAddHabit()
  const updateMutation = useUpdateHabit()
  const deleteMutation = useDeleteHabit()
  const toggleMutation = useToggleCompletion()

  const [showAdd, setShowAdd] = useState(false)
  const [editHabit, setEditHabit] = useState<HabitWithStreak | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const activeHabits = habits.filter((h) => h.is_active !== false)

  async function handleAdd(data: HabitFormData) {
    await addMutation.mutateAsync({
      ...data,
      sort_order: activeHabits.length,
    })
    setShowAdd(false)
  }

  async function handleEdit(data: HabitFormData) {
    if (!editHabit) return
    await updateMutation.mutateAsync({ id: editHabit.id, ...data })
    setEditHabit(null)
  }

  function handleToggle(habitId: string, date: string) {
    const habit = habits.find(h => h.id === habitId)
    if (habit) toggleMutation.mutate({ habit, date })
  }

  return (
    <div className="min-h-screen" style={{ background: '#0B1437', paddingTop: 60, paddingBottom: 80 }}>
      <div className="px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-medium text-white">Your habits</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {activeHabits.length} / 15 habits
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => activeHabits.length < 15 && setShowAdd(true)}
            disabled={activeHabits.length >= 15}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{
              background: activeHabits.length >= 15 ? 'rgba(255,255,255,0.1)' : '#2563EB',
              opacity: activeHabits.length >= 15 ? 0.5 : 1,
            }}
          >
            + Add
          </motion.button>
        </div>

        {/* Habits list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
          </div>
        ) : activeHabits.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🐬</p>
            <p className="text-sm font-medium text-white mb-1">No habits yet?</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>Your pod is waiting.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: '#2563EB' }}
            >
              Add your first habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={handleToggle}
                onEdit={(h) => setEditHabit(h)}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add sheet */}
      <AnimatePresence>
        {showAdd && (
          <AddEditSheet onSave={handleAdd} onClose={() => setShowAdd(false)} />
        )}
      </AnimatePresence>

      {/* Edit sheet */}
      <AnimatePresence>
        {editHabit && (
          <AddEditSheet
            initial={editHabit as Partial<HabitFormData>}
            onSave={handleEdit}
            onClose={() => setEditHabit(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-xs rounded-2xl p-6"
              style={{ background: '#0F1B45', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <h3 className="text-sm font-medium text-white mb-2">Archive this habit?</h3>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Your history will be preserved.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 rounded-xl text-xs"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}>
                  Cancel
                </button>
                <button
                  onClick={() => { deleteMutation.mutate(deleteConfirm); setDeleteConfirm(null) }}
                  className="flex-1 py-2 rounded-xl text-xs font-medium"
                  style={{ background: 'rgba(248,113,113,0.2)', color: '#F87171' }}>
                  Archive
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
