import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useArchivedHabits, useRestoreHabit, usePermanentlyDeleteHabit } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'

export function ArchivedHabitsSection() {
  const { darkMode } = useUIStore()
  const { data: archived = [] } = useArchivedHabits()
  const restoreMutation = useRestoreHabit()
  const deleteMutation = usePermanentlyDeleteHabit()
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (archived.length === 0) return null

  const t = darkMode ? {
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.5)',
    textSub: 'rgba(255,255,255,0.3)',
    cardBg: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.07)',
    divider: 'rgba(255,255,255,0.08)',
  } : {
    text: '#0B1437',
    textMuted: 'rgba(11,20,55,0.72)',
    textSub: 'rgba(11,20,55,0.62)',
    cardBg: 'rgba(255,255,255,0.6)',
    cardBorder: 'rgba(11,20,55,0.14)',
    divider: 'rgba(11,20,55,0.14)',
  }

  return (
    <div className="mt-8">
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-2 mb-3 text-xs font-semibold tracking-wide uppercase transition-colors"
        style={{ color: t.textMuted }}
      >
        <span>📦 Archived ({archived.length})</span>
        <span style={{ fontSize: 10 }}>{expanded ? '▾' : '▸'}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              {archived.map(habit => (
                <div
                  key={habit.id}
                  className="rounded-xl px-3 py-3 flex items-center gap-3"
                  style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
                >
                  <span className="text-xl flex-shrink-0" style={{ opacity: 0.7 }}>
                    {habit.emoji || '⭐'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: t.text }}>
                      {habit.name}
                    </p>
                    <p className="text-xs" style={{ color: t.textSub }}>
                      Archived
                    </p>
                  </div>
                  <button
                    onClick={() => restoreMutation.mutate(habit.id)}
                    disabled={restoreMutation.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
                    style={{ background: 'rgba(56,189,248,0.15)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.3)' }}
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => setConfirmDelete(habit.id)}
                    className="px-2 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
                    style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: t.textSub }}>
              Restored habits reappear in your active list with their full history intact.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permanent delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="w-full max-w-xs rounded-2xl p-6"
              style={{
                background: darkMode ? '#0F1B45' : '#E8EFFF',
                border: '1px solid rgba(248,113,113,0.3)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-sm font-bold mb-2" style={{ color: '#F87171' }}>
                Delete forever?
              </h3>
              <p className="text-xs mb-5" style={{ color: t.textMuted }}>
                This will permanently remove the habit, all completions, and its streak history. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                  style={{ background: t.cardBg, color: t.textMuted, border: `1px solid ${t.cardBorder}` }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteMutation.mutate(confirmDelete)
                    setConfirmDelete(null)
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white"
                  style={{ background: '#DC2626' }}
                >
                  Delete forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
