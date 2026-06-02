import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { HabitCard } from './HabitCard'
import { SortableItem } from './SortableItem'
import type { Routine, HabitWithStreak } from '../lib/types'

interface RoutineSectionProps {
  routine: Routine
  habits: HabitWithStreak[]
  isDefaultSort: boolean
  onEdit: (h: HabitWithStreak) => void
  onDelete: (id: string) => void
  onEditRoutine: (r: Routine) => void
  onReorder: (newOrder: HabitWithStreak[]) => void
  dragHandleProps?: Record<string, unknown>
}

function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function RoutineSection({
  routine,
  habits,
  isDefaultSort,
  onEdit,
  onDelete,
  onEditRoutine,
  onReorder,
  dragHandleProps,
}: RoutineSectionProps) {
  const [open, setOpen] = useState(false)
  const today = localToday()
  const doneCount = habits.filter(h => h.completions?.includes(today)).length
  const total = habits.length
  const allDone = total > 0 && doneCount === total

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 5 } })
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const oldIdx = habits.findIndex(h => h.id === active.id)
    const newIdx = habits.findIndex(h => h.id === over.id)
    if (oldIdx !== -1 && newIdx !== -1) {
      onReorder(arrayMove(habits, oldIdx, newIdx))
    }
  }

  return (
    <div className="mb-2">
      {/* Section header — drag handle for section reordering */}
      <div
        className="flex items-center gap-2 px-1 py-1.5 mb-1 cursor-pointer select-none rounded-xl"
        onClick={() => setOpen(v => !v)}
        {...(dragHandleProps as React.HTMLAttributes<HTMLDivElement>)}
        style={dragHandleProps ? { touchAction: 'none' } : undefined}
      >
        <span className="text-base leading-none flex-shrink-0">{routine.emoji}</span>
        <span className="text-sm font-semibold flex-1 truncate" style={{ color: 'var(--text-1)' }}>
          {routine.name}
        </span>

        {routine.time_of_day && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: 'var(--glass-btn-bg)',
              color: 'var(--accent-text)',
              border: '1px solid var(--glass-btn-border)',
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

      {/* Expanded habit list */}
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
            <div
              className="mb-3"
              style={{
                marginLeft: 8,
                paddingLeft: 12,
                borderLeft: '2px solid var(--border)',
              }}
            >
              {habits.length === 0 ? (
                <p className="text-xs py-3" style={{ color: 'var(--text-3)' }}>
                  No habits yet — edit a habit to assign it here
                </p>
              ) : isDefaultSort ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={habits.map(h => h.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {habits.map(habit => (
                        <SortableItem key={habit.id} id={habit.id}>
                          <HabitCard habit={habit} onEdit={onEdit} onDelete={onDelete} />
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
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
