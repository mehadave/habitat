import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUIStore } from '../store/uiStore'
import { CommitGrid } from './CommitGrid'
import type { HabitWithStreak } from '../lib/types'

interface HabitCardProps {
  habit: HabitWithStreak
  onToggle: (habitId: string, date: string) => void
  onEdit: (habit: HabitWithStreak) => void
  onDelete: (habitId: string) => void
}

function StarRating({ rating, darkMode }: { rating: number; darkMode: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className="text-sm leading-none"
          style={{ color: n <= rating ? '#60A5FA' : darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(11,20,55,0.2)' }}>★</span>
      ))}
    </div>
  )
}

export function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const { darkMode } = useUIStore()
  const [revealed, setRevealed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [showActions, setShowActions] = useState(false)

  const streak = habit.streak?.current_streak ?? 0
  const streakColor = streak >= 3 ? '#93C5FD' : streak > 0 ? '#FBBF24' : '#F87171'

  const startDate = new Date(habit.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const monthsAgo = Math.floor((Date.now() - new Date(habit.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
  const isPrivate = habit.is_private && !revealed

  const cardBg = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)'
  const cardBorder = streak < 3
    ? '1px solid rgba(248,113,113,0.15)'
    : darkMode ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(11,20,55,0.09)'
  const textColor = darkMode ? 'white' : '#0B1437'
  const textMuted = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(11,20,55,0.4)'
  const descBg = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(11,20,55,0.04)'
  const descBorder = darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(11,20,55,0.07)'
  const swipeActionsBg = darkMode ? '#0F1B45' : '#E8EFFF'
  const badgeBg = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(11,20,55,0.06)'
  const badgeColor = darkMode ? 'rgba(255,255,255,0.45)' : 'rgba(11,20,55,0.45)'
  const editBtnBg = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(11,20,55,0.06)'
  const editBtnColor = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(11,20,55,0.4)'
  const needsYouColor = darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(11,20,55,0.35)'

  return (
    <div className="relative overflow-hidden">
      {/* Swipe actions */}
      {showActions && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-3 pl-6 z-10"
          style={{ background: swipeActionsBg }}>
          <button onClick={() => { setShowActions(false); onEdit(habit) }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(37,99,235,0.2)', color: '#93C5FD' }}>
            Edit
          </button>
          <button onClick={() => { setShowActions(false); onDelete(habit.id) }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171' }}>
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
          background: cardBg,
          border: cardBorder,
        }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <button
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
            onClick={() => setExpanded(e => !e)}
          >
            <span className="text-2xl flex-shrink-0"
              style={{ filter: isPrivate ? 'blur(6px)' : 'none' }}>
              {habit.emoji || '⭐'}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-medium truncate"
                style={{ color: textColor, filter: isPrivate ? 'blur(6px)' : 'none' }}>
                {habit.name}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                Started {monthsAgo > 0 ? `${monthsAgo}mo ago` : startDate}
                {habit.description ? ' · tap to expand' : ''}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {/* Edit button */}
            <button
              onClick={() => onEdit(habit)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: editBtnBg, color: editBtnColor, fontSize: 12 }}
              title="Edit habit"
            >
              ✏️
            </button>
            <div className="flex flex-col items-end gap-1">
              <StarRating rating={habit.star_rating} darkMode={darkMode} />
              <span className="text-xs font-medium" style={{ color: streakColor }}>
                {streak}d streak
              </span>
            </div>
          </div>
        </div>

        {/* Description (expanded) */}
        {expanded && habit.description && (
          <div className="mb-3 px-3 py-2.5 rounded-xl"
            style={{ background: descBg, border: descBorder }}>
            <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
              {habit.description}
            </p>
          </div>
        )}

        {/* Privacy tag */}
        {habit.is_private && (
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setRevealed(r => !r)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: badgeBg, color: badgeColor }}>
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

        {streak < 3 && streak > 0 && (
          <p className="text-xs mt-2" style={{ color: needsYouColor }}>
            This one needs you today.
          </p>
        )}
      </motion.div>
    </div>
  )
}
