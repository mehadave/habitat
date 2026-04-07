import { useState } from 'react'
import { motion } from 'framer-motion'
import { CommitGrid } from './CommitGrid'
import type { HabitWithStreak } from '../lib/types'

interface HabitCardProps {
  habit: HabitWithStreak
  onToggle: (habitId: string, date: string) => void
  onEdit: (habit: HabitWithStreak) => void
  onDelete: (habitId: string) => void
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange?.(n)}
          className="text-sm leading-none"
          style={{ color: n <= rating ? '#60A5FA' : 'rgba(255,255,255,0.2)' }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [showActions, setShowActions] = useState(false)

  const streak = habit.streak?.current_streak ?? 0
  const streakColor = streak >= 3 ? '#93C5FD' : '#F87171'

  const startDate = new Date(habit.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  const monthsAgo = Math.floor(
    (Date.now() - new Date(habit.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
  )

  const isPrivate = habit.is_private && !revealed

  return (
    <div className="relative overflow-hidden">
      {/* Swipe actions */}
      {showActions && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-3 pl-6 z-10"
          style={{ background: '#0F1B45' }}
        >
          <button
            onClick={() => { setShowActions(false); onEdit(habit) }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(37,99,235,0.2)', color: '#93C5FD' }}
          >
            Edit
          </button>
          <button
            onClick={() => { setShowActions(false); onDelete(habit.id) }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171' }}
          >
            Delete
          </button>
        </div>
      )}

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50) setShowActions(true)
          else setShowActions(false)
          setSwipeX(0)
        }}
        animate={{ x: swipeX }}
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: streak < 3 ? '1px solid rgba(248,113,113,0.15)' : '1px solid rgba(255,255,255,0.09)',
        }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span
              className="text-2xl flex-shrink-0"
              style={{ filter: isPrivate ? 'blur(6px)' : 'none' }}
            >
              {habit.emoji || '⭐'}
            </span>
            <div className="min-w-0">
              <h3
                className="text-sm font-medium text-white truncate"
                style={{ filter: isPrivate ? 'blur(6px)' : 'none' }}
              >
                {habit.name}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Started {monthsAgo > 0 ? `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago` : startDate}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
            <StarRating rating={habit.star_rating} />
            <span className="text-xs font-medium" style={{ color: streakColor }}>
              {streak}d streak
            </span>
          </div>
        </div>

        {/* Privacy tag if private */}
        {habit.is_private && (
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setRevealed((r) => !r)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}
            >
              {revealed ? '👁 Shown' : '🔒 Private'}
            </button>
          </div>
        )}

        {/* Commit Grid */}
        <CommitGrid
          habitId={habit.id}
          habitName={habit.name}
          completions={habit.completions || []}
          onToggle={(date) => onToggle(habit.id, date)}
        />

        {/* Losing nudge */}
        {streak < 3 && streak > 0 && (
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
            This one needs you today.
          </p>
        )}
      </motion.div>
    </div>
  )
}
