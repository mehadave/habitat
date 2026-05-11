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

const CARD_H = 56
const STACK_OFFSET = 12
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
  const pct = total > 0 ? doneCount / total : 0

  const previewHabits = habits.slice(0, MAX_STACK)
  const hasMore = habits.length > MAX_STACK
  // height = top card + (n-1) offsets + progress bar area
  const stackH = habits.length === 0 ? 0 : CARD_H + (previewHabits.length - 1) * STACK_OFFSET + 28

  return (
    <div
      className="mb-3 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '2px 0 2px',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none"
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-base leading-none flex-shrink-0">{routine.emoji}</span>
        <span className="text-sm font-semibold flex-1 truncate" style={{ color: allDone ? '#54e98a' : 'var(--text-1)' }}>
          {routine.name}
        </span>

        {routine.time_of_day && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: 'rgba(84,233,138,0.08)',
              color: 'rgba(84,233,138,0.75)',
              border: '1px solid rgba(84,233,138,0.18)',
            }}
          >
            {routine.time_of_day}
          </span>
        )}

        {/* X/Y done badge */}
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 tabular-nums"
          style={{
            background: allDone ? 'rgba(84,233,138,0.14)' : 'rgba(255,255,255,0.05)',
            color: allDone ? '#54e98a' : 'var(--text-3)',
            border: allDone ? '1px solid rgba(84,233,138,0.28)' : '1px solid rgba(255,255,255,0.1)',
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
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Progress bar track */}
      {total > 0 && (
        <div
          className="mx-3 mb-2 rounded-full overflow-hidden"
          style={{ height: 2, background: 'rgba(255,255,255,0.07)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: allDone ? '#54e98a' : 'rgba(84,233,138,0.5)' }}
            initial={false}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Stacked flashcard preview — shown when collapsed */}
      <AnimatePresence initial={false}>
        {!open && habits.length > 0 && (
          <motion.div
            key="stack"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: stackH }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ position: 'relative', marginBottom: 4, cursor: 'pointer', marginLeft: 8, marginRight: 8 }}
            onClick={() => setOpen(true)}
          >
            {previewHabits.map((habit, idx) => {
              const isDone = habit.completions?.includes(today)
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1 - idx * 0.18, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.18 }}
                  style={{
                    position: 'absolute',
                    top: idx * STACK_OFFSET,
                    left: idx * 5,
                    right: idx * 5,
                    height: CARD_H,
                    // Glassmorphism card - Zenith Productivity palette
                    background: idx === 0
                      ? isDone
                        ? 'rgba(84,233,138,0.07)'
                        : 'rgba(255,255,255,0.05)'
                      : `rgba(16,19,26,${0.7 - idx * 0.08})`,
                    backdropFilter: 'blur(12px)',
                    border: idx === 0
                      ? isDone
                        ? '1px solid rgba(84,233,138,0.25)'
                        : '1px solid rgba(255,255,255,0.12)'
                      : `1px solid rgba(255,255,255,${0.07 - idx * 0.02})`,
                    borderRadius: 14,
                    boxShadow: idx === 0
                      ? '0 4px 24px rgba(0,0,0,0.28)'
                      : `0 ${idx * 2}px ${idx * 8 + 4}px rgba(0,0,0,0.18)`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '0 14px',
                    zIndex: MAX_STACK - idx,
                    scale: 1 - idx * 0.018,
                    transformOrigin: 'top center',
                  }}
                >
                  {/* Emerald left accent strip on top card */}
                  {idx === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 10,
                        bottom: 10,
                        width: 3,
                        borderRadius: '0 2px 2px 0',
                        background: isDone ? '#54e98a' : 'rgba(84,233,138,0.35)',
                      }}
                    />
                  )}

                  <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginLeft: idx === 0 ? 6 : 0 }}>
                    {habit.emoji ?? '⭐'}
                  </span>
                  <span
                    className="truncate flex-1"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isDone ? 'rgba(84,233,138,0.85)' : 'var(--text-1)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      textDecorationColor: 'rgba(84,233,138,0.4)',
                    }}
                  >
                    {habit.name}
                  </span>
                  {isDone && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#54e98a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </motion.div>
              )
            })}

            {/* Bottom hint row */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
                fontSize: 10,
                color: 'rgba(84,233,138,0.45)',
                pointerEvents: 'none',
              }}
            >
              {hasMore && <span>+{habits.length - MAX_STACK} more</span>}
              {hasMore && <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>}
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>tap to expand</span>
            </div>
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
            <div className="px-2 pb-2">
              {habits.length === 0 ? (
                <p className="text-xs py-3 text-center" style={{ color: 'var(--text-3)' }}>
                  No habits yet — edit a habit to assign it here
                </p>
              ) : isDefaultSort ? (
                <Reorder.Group
                  axis="y"
                  values={habits}
                  onReorder={onReorder}
                  className="space-y-2"
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
                <div className="space-y-2">
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
