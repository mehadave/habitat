import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import type { Routine, HabitWithStreak } from '../lib/types'

interface RoutineSectionProps {
  routine: Routine
  habits: HabitWithStreak[]
  isDefaultSort: boolean
  isActive?: boolean
  onEdit: (h: HabitWithStreak) => void
  onDelete: (id: string) => void
  onEditRoutine: (r: Routine) => void
  onReorder: (newOrder: HabitWithStreak[]) => void
}

function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function statusText(habit: HabitWithStreak, done: boolean): string {
  const streak = habit.streak?.current_streak ?? 0
  if (done && streak >= 7) return 'Crushed it!'
  if (done && streak >= 3) return 'Victory!'
  if (done) return 'Done!'
  if (streak > 0) return 'Get after it!'
  return 'Waiting on you...'
}

function statusColor(done: boolean, streak: number): string {
  if (done) return 'rgba(129,140,248,0.9)'   // indigo — matches screenshot
  if (streak > 0) return 'rgba(251,191,36,0.7)'
  return 'rgba(255,255,255,0.2)'
}

function RoutineHabitRow({
  habit,
  today,
  onEdit,
}: {
  habit: HabitWithStreak
  today: string
  onEdit: (h: HabitWithStreak) => void
}) {
  const done = habit.completions?.includes(today) ?? false
  const streak = habit.streak?.current_streak ?? 0

  return (
    <div
      className="flex items-center gap-3 py-2.5 px-1"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Circle checkbox */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 28,
          height: 28,
          background: done ? 'rgba(129,140,248,0.9)' : 'transparent',
          border: done ? 'none' : '2px solid rgba(255,255,255,0.2)',
          transition: 'background 0.2s, border 0.2s',
        }}
      >
        {done && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>

      {/* Emoji + name + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {habit.emoji && (
            <span style={{ fontSize: 14, lineHeight: 1 }}>{habit.emoji}</span>
          )}
          <span
            className="text-sm font-semibold truncate"
            style={{ color: done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.9)' }}
          >
            {habit.name}
          </span>
        </div>
        {habit.description && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {habit.description}
          </p>
        )}
      </div>

      {/* Status text */}
      <span
        className="text-xs font-medium flex-shrink-0"
        style={{ color: statusColor(done, streak) }}
      >
        {statusText(habit, done)}
      </span>

      {/* Edit button */}
      <button
        onClick={() => onEdit(habit)}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg"
        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
    </div>
  )
}

export function RoutineSection({
  routine,
  habits,
  isDefaultSort,
  isActive = false,
  onEdit,
  onDelete: _onDelete,
  onEditRoutine,
  onReorder,
}: RoutineSectionProps) {
  const [open, setOpen] = useState(true)
  const today = localToday()
  const doneCount = habits.filter(h => h.completions?.includes(today)).length
  const total = habits.length
  const allDone = total > 0 && doneCount === total

  const glowStyle = isActive
    ? {
        boxShadow: '0 0 0 1.5px rgba(139,92,246,0.55), 0 0 28px rgba(139,92,246,0.22), 0 0 56px rgba(99,102,241,0.1), 0 8px 32px rgba(0,0,0,0.35)',
        border: '1.5px solid rgba(139,92,246,0.45)',
      }
    : {
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.07)',
      }

  return (
    <motion.div
      className="mb-4 rounded-2xl overflow-hidden"
      layout
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(16px)',
        ...glowStyle,
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-4 pt-4 pb-3 cursor-pointer select-none"
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-xl leading-none flex-shrink-0">{routine.emoji}</span>

        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-bold leading-tight truncate"
            style={{ color: allDone ? 'rgba(129,140,248,0.9)' : 'rgba(255,255,255,0.92)' }}
          >
            {routine.name}
          </h3>
          {routine.time_of_day && (
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {routine.time_of_day}
            </span>
          )}
        </div>

        {/* X/Y badge */}
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 tabular-nums"
          style={{
            background: allDone ? 'rgba(129,140,248,0.18)' : 'rgba(255,255,255,0.07)',
            color: allDone ? 'rgba(129,140,248,0.95)' : 'rgba(255,255,255,0.4)',
            border: allDone ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {doneCount}/{total}
        </span>

        {/* Edit routine icon */}
        <button
          onClick={e => { e.stopPropagation(); onEditRoutine(routine) }}
          className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
          title="Edit routine"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>

        {/* Collapse arrow */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="flex-shrink-0"
          style={{
            color: 'rgba(255,255,255,0.25)',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mx-4 mb-3 rounded-full overflow-hidden" style={{ height: 2, background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: isActive ? 'rgba(139,92,246,0.7)' : 'rgba(129,140,248,0.5)' }}
            initial={false}
            animate={{ width: `${(doneCount / total) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Habit list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-3">
              {habits.length === 0 ? (
                <p className="text-xs py-4 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  No habits yet — edit a habit to assign it here
                </p>
              ) : isDefaultSort ? (
                <Reorder.Group
                  axis="y"
                  values={habits}
                  onReorder={onReorder}
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
                      <RoutineHabitRow habit={habit} today={today} onEdit={onEdit} />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                <div>
                  {habits.map(habit => (
                    <RoutineHabitRow key={habit.id} habit={habit} today={today} onEdit={onEdit} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
