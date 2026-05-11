import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { HabitCard } from './HabitCard'
import type { Routine, HabitWithStreak } from '../lib/types'

interface RoutineSectionProps {
  routine: Routine
  habits: HabitWithStreak[]
  isDefaultSort: boolean
  onEdit: (h: HabitWithStreak) => void
  onDelete: (id: string) => void
  onEditRoutine: (r: Routine) => void
  onReorder: (newOrder: HabitWithStreak[]) => void
}

function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const CARD_H = 52
const STACK_OFFSET = 10
const MAX_STACK = 3

export function RoutineSection({
  routine,
  habits,
  isDefaultSort,
  onEdit,
  onDelete,
  onEditRoutine,
  onReorder,
}: RoutineSectionProps) {
  const [open, setOpen] = useState(false)
  const today = localToday()
  const doneCount = habits.filter(h => h.completions?.includes(today)).length
  const total = habits.length
  const allDone = total > 0 && doneCount === total

  const previewHabits = habits.slice(0, MAX_STACK)
  const hasMore = habits.length > MAX_STACK
  const stackH = habits.length === 0 ? 0 : CARD_H + (previewHabits.length - 1) * STACK_OFFSET + (hasMore ? 20 : 8)

  return (
    <div className="mb-2">
      {/* Section header — plain row, no card background */}
      <div
        className="flex items-center gap-2 px-1 py-1.5 mb-1 cursor-pointer select-none rounded-xl"
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-base leading-none flex-shrink-0">{routine.emoji}</span>
        <span className="text-sm font-semibold flex-1 truncate" style={{ color: 'var(--text-1)' }}>
          {routine.name}
        </span>

        {routine.time_of_day && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: 'rgba(37,99,235,0.10)',
              color: 'var(--accent-text)',
              border: '1px solid rgba(37,99,235,0.22)',
            }}
          >
            {routine.time_of_day}
          </span>
        )}

        {/* X/Y done badge */}
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: allDone ? 'rgba(74,222,128,0.14)' : 'var(--input-bg)',
            color: allDone ? '#4ade80' : 'var(--text-3)',
            border: allDone ? '1px solid rgba(74,222,128,0.28)' : '1px solid var(--border)',
          }}
        >
          {doneCount}/{total}
        </span>

        {/* Edit routine */}
        <button
          onClick={e => { e.stopPropagation(); onEditRoutine(routine) }}
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ background: 'transparent', color: 'var(--text-3)' }}
          title="Edit routine"
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>

        {/* Collapse arrow */}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="flex-shrink-0"
          style={{
            color: 'var(--text-3)',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.18s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Stacked flashcard preview — shown when collapsed */}
      <AnimatePresence initial={false}>
        {!open && habits.length > 0 && (
          <motion.div
            key="stack"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: stackH }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ position: 'relative', overflow: 'hidden', marginBottom: 12, cursor: 'pointer' }}
            onClick={() => setOpen(true)}
          >
            {previewHabits.map((habit, idx) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{
                  opacity: 1 - idx * 0.2,
                  y: 0,
                  scale: 1 - idx * 0.025,
                }}
                transition={{ delay: idx * 0.05, duration: 0.18 }}
                style={{
                  position: 'absolute',
                  top: idx * STACK_OFFSET,
                  left: idx * 4,
                  right: -(idx * 4),
                  height: CARD_H,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '0 16px',
                  zIndex: MAX_STACK - idx,
                  transformOrigin: 'top center',
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{habit.emoji ?? '⭐'}</span>
                <span
                  className="truncate flex-1"
                  style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}
                >
                  {habit.name}
                </span>
                {habit.completions?.includes(today) && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </motion.div>
            ))}
            {hasMore && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: 10,
                  color: 'var(--text-3)',
                  pointerEvents: 'none',
                }}
              >
                +{habits.length - MAX_STACK} more · tap to expand
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded full list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pl-1 mb-3">
              {habits.length === 0 ? (
                <p className="text-xs py-3 text-center" style={{ color: 'var(--text-3)' }}>
                  No habits yet — edit a habit to assign it here
                </p>
              ) : isDefaultSort ? (
                <Reorder.Group
                  axis="y"
                  values={habits}
                  onReorder={onReorder}
                  className="space-y-3"
                  style={{ listStyle: 'none', padding: 0, margin: 0 }}
                >
                  {habits.map(habit => (
                    <Reorder.Item
                      key={habit.id}
                      value={habit}
                      initial={false}
                      layout
                      dragMomentum={false}
                      dragElastic={0}
                      style={{ listStyle: 'none' }}
                    >
                      <HabitCard habit={habit} onEdit={onEdit} onDelete={onDelete} />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                <div className="space-y-3">
                  {habits.map(habit => (
                    <HabitCard key={habit.id} habit={habit} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
