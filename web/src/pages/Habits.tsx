import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabits, useAddHabit, useUpdateHabit, useDeleteHabit, useToggleCompletion } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'
import { HabitCard } from '../components/HabitCard'
import { MonthlyHabitTracker } from '../components/MonthlyHabitTracker'
import { ArchivedHabitsSection } from '../components/ArchivedHabitsSection'
import {
  getHabitPref,
  setHabitPref,
  requestNotificationPermission,
  syncNotificationsToSW,
} from '../hooks/useNotifications'
import type { HabitWithStreak } from '../lib/types'

const EMOJIS = ['⭐','🏃','📚','💧','🧘','💪','🍎','😴','🎯','✍️','🎸','🌱','🧹','💊','☀️','🐬','🌊','🏊','🦋','🔥']

const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa']

interface HabitFormData {
  name: string
  emoji: string
  description: string
  star_rating: number
  is_private: boolean
}

interface FormWithNotif extends HabitFormData {
  notifEnabled: boolean
  notifTime: string
  notifDays: number[]
}

function buildTokens(darkMode: boolean) {
  return darkMode ? {
    bg: '#0B1120',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.45)',
    textSub: 'rgba(255,255,255,0.3)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.09)',
    inputBg: 'rgba(255,255,255,0.07)',
    inputBorder: '1px solid rgba(255,255,255,0.12)',
    inputColor: '#fff',
    divider: 'rgba(255,255,255,0.1)',
    sheetBg: '#0F1B45',
  } : {
    bg: '#F0F4FF',
    text: '#0B1437',
    textMuted: 'rgba(11,20,55,0.72)',
    textSub: 'rgba(11,20,55,0.62)',
    cardBg: 'rgba(255,255,255,0.85)',
    cardBorder: 'rgba(11,20,55,0.18)',
    inputBg: 'rgba(11,20,55,0.09)',
    inputBorder: '1px solid rgba(11,20,55,0.15)',
    inputColor: '#0B1437',
    divider: 'rgba(11,20,55,0.1)',
    sheetBg: '#EEF3FF',
  }
}

function AddEditSheet({
  habitId,
  initial,
  onSave,
  onClose,
  t,
  isSaving,
}: {
  habitId?: string
  initial?: Partial<FormWithNotif>
  onSave: (data: FormWithNotif) => void
  onClose: () => void
  t: ReturnType<typeof buildTokens>
  isSaving?: boolean
}) {
  const existingPref = habitId ? getHabitPref(habitId) : { enabled: false, time: '09:00', days: [] }

  const [form, setForm] = useState<FormWithNotif>({
    name: initial?.name ?? '',
    emoji: initial?.emoji ?? '⭐',
    description: initial?.description ?? '',
    star_rating: initial?.star_rating ?? 0,
    is_private: initial?.is_private ?? false,
    notifEnabled: initial?.notifEnabled ?? existingPref.enabled,
    notifTime: initial?.notifTime ?? existingPref.time,
    notifDays: initial?.notifDays ?? existingPref.days,
  })
  const emojiInputRef = useRef<HTMLInputElement>(null)

  function toggleDay(d: number) {
    setForm(f => ({
      ...f,
      notifDays: f.notifDays.includes(d)
        ? f.notifDays.filter(x => x !== d)
        : [...f.notifDays, d],
    }))
  }

  async function handleNotifToggle() {
    if (!form.notifEnabled) {
      const granted = await requestNotificationPermission()
      if (!granted) return
    }
    setForm(f => ({ ...f, notifEnabled: !f.notifEnabled }))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4 pb-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        className="w-full max-w-md rounded-3xl p-6"
        style={{
          background: t.sheetBg,
          border: `1px solid ${t.cardBorder}`,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: t.text }}>
            {initial?.name ? 'Edit habit' : 'New habit'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg leading-none"
            style={{ background: t.inputBg, color: t.textMuted, border: t.inputBorder }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Emoji picker — py-2 px-1 ensures the scale(1.1) border isn't clipped */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 py-2 px-1">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setForm({ ...form, emoji: e })}
              className="text-2xl flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: form.emoji === e ? 'rgba(37,99,235,0.25)' : t.inputBg,
                border: form.emoji === e ? '1.5px solid #2563EB' : t.inputBorder,
                transform: form.emoji === e ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {e}
            </button>
          ))}
          {/* Custom emoji — tapping opens native emoji keyboard */}
          <button
            onClick={() => emojiInputRef.current?.focus()}
            className="text-xl flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all font-semibold"
            style={{
              background: !EMOJIS.includes(form.emoji as typeof EMOJIS[number]) ? 'rgba(37,99,235,0.25)' : t.inputBg,
              border: !EMOJIS.includes(form.emoji as typeof EMOJIS[number]) ? '1.5px solid #2563EB' : t.inputBorder,
              color: t.textMuted,
            }}
            title="Choose any emoji"
          >
            {!EMOJIS.includes(form.emoji as typeof EMOJIS[number]) ? form.emoji : '+'}
          </button>
          {/* Hidden input that receives the emoji from the OS keyboard */}
          <input
            ref={emojiInputRef}
            type="text"
            inputMode="text"
            value=""
            onChange={(e) => {
              const val = [...e.target.value].find(c => c.trim())
              if (val) setForm(f => ({ ...f, emoji: val }))
              e.target.value = ''
            }}
            className="absolute opacity-0 pointer-events-none w-0 h-0"
            aria-hidden="true"
          />
        </div>

        <input
          placeholder="Habit name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
          style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }}
        />

        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3 resize-none"
          style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }}
        />

        {/* Priority — High / Medium / Low pill buttons */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs flex-shrink-0" style={{ color: t.textMuted }}>Priority:</span>
          <div className="flex gap-1.5">
            {([
              { label: 'High',   value: 5, color: '#F87171', bg: 'rgba(248,113,113,0.13)', border: 'rgba(248,113,113,0.35)' },
              { label: 'Medium', value: 3, color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.35)'  },
              { label: 'Low',    value: 1, color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.30)'  },
            ] as const).map(({ label, value, color, bg, border }) => {
              const sel = (label === 'High' && form.star_rating >= 4)
                       || (label === 'Medium' && form.star_rating >= 2 && form.star_rating < 4)
                       || (label === 'Low' && form.star_rating < 2)
              return (
                <button
                  key={label}
                  onClick={() => setForm({ ...form, star_rating: value })}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: sel ? bg : t.inputBg,
                    border: `1px solid ${sel ? border : 'transparent'}`,
                    color: sel ? color : t.textSub,
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Privacy toggle */}
        <div className="flex items-center justify-between mb-4 py-3 rounded-xl px-3"
          style={{ background: t.inputBg, border: t.inputBorder }}>
          <div>
            <p className="text-sm font-medium" style={{ color: t.text }}>Private</p>
            <p className="text-xs" style={{ color: t.textMuted }}>Blurs name & emoji</p>
          </div>
          <button
            onClick={() => setForm({ ...form, is_private: !form.is_private })}
            className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
            style={{ background: form.is_private ? '#2563EB' : t.cardBorder }}
          >
            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ left: form.is_private ? '22px' : '2px' }} />
          </button>
        </div>

        {/* Reminder section */}
        <div className="rounded-xl mb-5 overflow-hidden" style={{ border: t.inputBorder }}>
          <div className="flex items-center justify-between px-3 py-3"
            style={{ background: t.inputBg }}>
            <div>
              <p className="text-sm font-medium" style={{ color: t.text }}>Daily reminder</p>
              <p className="text-xs" style={{ color: t.textMuted }}>
                {form.notifEnabled ? `Notifies at ${form.notifTime}` : 'Off'}
              </p>
            </div>
            <button
              onClick={handleNotifToggle}
              className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
              style={{ background: form.notifEnabled ? '#2563EB' : t.cardBorder }}
            >
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                style={{ left: form.notifEnabled ? '22px' : '2px' }} />
            </button>
          </div>

          {form.notifEnabled && (
            <div className="px-3 pb-3 pt-2" style={{ background: t.inputBg, borderTop: `1px solid ${t.divider}` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs" style={{ color: t.textMuted }}>Time</span>
                <input
                  type="time"
                  value={form.notifTime}
                  onChange={(e) => setForm({ ...form, notifTime: e.target.value })}
                  className="px-3 py-1.5 rounded-lg text-sm outline-none"
                  style={{ background: t.cardBg, border: t.inputBorder, color: t.inputColor }}
                />
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: t.textMuted }}>
                  Days {form.notifDays.length === 0 ? '(every day)' : ''}
                </p>
                <div className="flex gap-1.5">
                  {DAY_LABELS.map((label, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: form.notifDays.includes(i) ? 'rgba(37,99,235,0.3)' : t.cardBg,
                        border: form.notifDays.includes(i) ? '1.5px solid #2563EB' : t.inputBorder,
                        color: form.notifDays.includes(i) ? '#93C5FD' : t.textMuted,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => { if (form.name.trim() && !isSaving) onSave(form) }}
          disabled={!form.name.trim() || isSaving}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
          style={{
            background: form.name.trim() && !isSaving ? '#2563EB' : t.inputBg,
            opacity: form.name.trim() && !isSaving ? 1 : 0.5,
          }}
        >
          {isSaving ? 'Saving…' : initial?.name ? 'Save changes' : 'Add habit'}
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function Habits() {
  const { data: habits = [], isLoading } = useHabits()
  const { darkMode } = useUIStore()
  const addMutation = useAddHabit()
  const updateMutation = useUpdateHabit()
  const deleteMutation = useDeleteHabit()
  const toggleMutation = useToggleCompletion()

  const [showAdd, setShowAdd] = useState(false)
  const [editHabit, setEditHabit] = useState<HabitWithStreak | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const t = buildTokens(darkMode)

  const activeHabits = habits.filter((h) => h.is_active !== false)

  async function handleAdd(data: FormWithNotif) {
    const habit = await addMutation.mutateAsync({
      name: data.name,
      emoji: data.emoji,
      description: data.description,
      star_rating: data.star_rating,
      is_private: data.is_private,
      sort_order: activeHabits.length,
    })
    if (habit && data.notifEnabled) {
      setHabitPref(habit.id, { enabled: true, time: data.notifTime, days: data.notifDays })
      syncNotificationsToSW([...habits, habit as HabitWithStreak])
    }
    setShowAdd(false)
  }

  async function handleEdit(data: FormWithNotif) {
    if (!editHabit) return
    await updateMutation.mutateAsync({
      id: editHabit.id,
      name: data.name,
      emoji: data.emoji,
      description: data.description,
      star_rating: data.star_rating,
      is_private: data.is_private,
    })
    setHabitPref(editHabit.id, { enabled: data.notifEnabled, time: data.notifTime, days: data.notifDays })
    syncNotificationsToSW(habits)
    setEditHabit(null)
  }

  function handleToggle(habitId: string, date: string) {
    const habit = habits.find(h => h.id === habitId)
    if (habit) toggleMutation.mutate({ habit, date })
  }

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 76, paddingBottom: 80 }}>
      <div className="px-4 pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: t.text }}>Your habits</h1>
            <p className="text-sm mt-1" style={{ color: t.textMuted }}>
              {activeHabits.length} / 15 active
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => activeHabits.length < 15 && setShowAdd(true)}
            disabled={activeHabits.length >= 15}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{
              background: activeHabits.length >= 15 ? t.inputBg : '#2563EB',
              opacity: activeHabits.length >= 15 ? 0.5 : 1,
              boxShadow: activeHabits.length < 15 ? '0 2px 8px rgba(37,99,235,0.35)' : 'none',
            }}
          >
            + Add
          </motion.button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
          </div>
        ) : activeHabits.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🐬</p>
            <p className="text-sm font-semibold mb-1" style={{ color: t.text }}>No habits yet</p>
            <p className="text-xs mb-5" style={{ color: t.textMuted }}>Your pod is waiting.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#2563EB', boxShadow: '0 2px 8px rgba(37,99,235,0.35)' }}
            >
              Add your first habit
            </button>
          </div>
        ) : (
          <>
            {/* Monthly tracker at the top */}
            <MonthlyHabitTracker habits={activeHabits} onToggle={handleToggle} />

            {/* Habit cards */}
            <p className="text-sm font-semibold tracking-wide uppercase mb-3" style={{ color: t.textMuted }}>
              Your Habits!
            </p>
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

            {/* Archived habits section */}
            <ArchivedHabitsSection />
          </>
        )}
      </div>

      {/* Add sheet */}
      <AnimatePresence>
        {showAdd && (
          <AddEditSheet onSave={handleAdd} onClose={() => setShowAdd(false)} t={t} isSaving={addMutation.isPending} />
        )}
      </AnimatePresence>

      {/* Edit sheet */}
      <AnimatePresence>
        {editHabit && (
          <AddEditSheet
            habitId={editHabit.id}
            initial={editHabit as Partial<FormWithNotif>}
            onSave={handleEdit}
            onClose={() => setEditHabit(null)}
            t={t}
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
            style={{ background: 'rgba(0,0,0,0.55)' }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 8 }}
              className="w-full max-w-xs rounded-2xl p-6"
              style={{
                background: t.sheetBg,
                border: `1px solid ${t.cardBorder}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              }}
            >
              <h3 className="text-sm font-semibold mb-1" style={{ color: t.text }}>Archive this habit?</h3>
              <p className="text-xs mb-5" style={{ color: t.textMuted }}>
                Your history will be preserved. You can re-add it any time.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                  style={{ background: t.inputBg, color: t.textMuted }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { deleteMutation.mutate(deleteConfirm); setDeleteConfirm(null) }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(248,113,113,0.18)', color: '#F87171' }}
                >
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
