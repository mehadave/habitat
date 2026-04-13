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
        <span
          key={n}
          className="text-xs leading-none"
          style={{ color: n <= rating ? '#60A5FA' : darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(11,20,55,0.18)' }}
        >★</span>
      ))}
    </div>
  )
}

export function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const { darkMode } = useUIStore()
  const [revealed, setRevealed] = useState(false)
  const [showDesc, setShowDesc] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const streak = habit.streak?.current_streak ?? 0
  const streakColor = streak >= 7 ? '#93C5FD' : streak >= 3 ? '#60A5FA' : streak > 0 ? '#FBBF24' : '#F87171'

  const monthsAgo = Math.floor((Date.now() - new Date(habit.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
  const isPrivate = habit.is_private && !revealed

  const cardBg = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)'
  const cardShadow = darkMode ? 'none' : '0 2px 12px rgba(11,20,55,0.07)'
  const cardBorder = streak < 3 && streak > 0
    ? '1px solid rgba(248,113,113,0.2)'
    : darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(11,20,55,0.08)'
  const textColor = darkMode ? '#ffffff' : '#0B1437'
  const textMuted = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(11,20,55,0.45)'
  const descBg = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(11,20,55,0.03)'
  const descBorder = darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(11,20,55,0.07)'
  const swipeActionsBg = darkMode ? '#0F1B45' : '#E8EFFF'
  const badgeBg = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(11,20,55,0.06)'
  const badgeColor = darkMode ? 'rgba(255,255,255,0.45)' : 'rgba(11,20,55,0.5)'
  const editBtnBg = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(11,20,55,0.05)'
  const editBtnColor = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(11,20,55,0.4)'
  const historyBtnColor = darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(11,20,55,0.35)'

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Swipe actions */}
      {showActions && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-3 pl-6 z-10 rounded-r-2xl"
          style={{ background: swipeActionsBg }}
        >
          <button
            onClick={() => { setShowActions(false); onEdit(habit) }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(37,99,235,0.18)', color: '#93C5FD' }}
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
        dragElastic={0.08}
        onDragEnd={(_, info) => {
          setShowActions(info.offset.x < -50)
        }}
        className="p-4"
        style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow, borderRadius: 16 }}
      >
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Emoji + name */}
          <button
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
            onClick={() => habit.description && setShowDesc(d => !d)}
          >
            <span
              className="text-2xl flex-shrink-0 leading-none"
              style={{ filter: isPrivate ? 'blur(6px)' : 'none' }}
            >
              {habit.emoji || '⭐'}
            </span>
            <div className="min-w-0 flex-1">
              <h3
                className="text-sm font-semibold leading-snug"
                style={{ color: textColor, filter: isPrivate ? 'blur(6px)' : 'none' }}
              >
                {habit.name}
              </h3>
              <p className="text-xs mt-0.5 leading-none" style={{ color: textMuted }}>
                {monthsAgo > 0 ? `${monthsAgo}mo ago` : 'This month'}
                {habit.description ? ' · tap to expand' : ''}
              </p>
            </div>
          </button>

          {/* Right side: edit + stars + streak */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(habit)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
              style={{ background: editBtnBg, color: editBtnColor }}
            >
              ✏️
            </button>
            <div className="flex flex-col items-end gap-1">
              <StarRating rating={habit.star_rating} darkMode={darkMode} />
              <span
                className="text-xs font-semibold"
                style={{ color: streakColor }}
              >
                {streak}d
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {showDesc && habit.description && (
          <div className="mt-3 px-3 py-2.5 rounded-xl" style={{ background: descBg, border: descBorder }}>
            <p className="text-xs leading-relaxed" style={{ color: textMuted }}>{habit.description}</p>
          </div>
        )}

        {/* Privacy tag */}
        {habit.is_private && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setRevealed(r => !r)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: badgeBg, color: badgeColor }}
            >
              {revealed ? '👁 Shown' : '🔒 Private'}
            </button>
          </div>
        )}

        {/* Expand history button */}
        <button
          onClick={() => setShowHistory(h => !h)}
          className="flex items-center gap-1 mt-3 text-xs"
          style={{ color: historyBtnColor }}
        >
          <span style={{ fontSize: 9, transition: 'transform 0.2s', display: 'inline-block', transform: showHistory ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
          <span>{showHistory ? 'Hide history' : 'View history'}</span>
        </button>

        {/* Commit grid (hidden by default) */}
        {showHistory && (
          <div className="mt-3">
            <CommitGrid
              habitId={habit.id}
              habitName={habit.name}
              completions={habit.completions || []}
              onToggle={(date) => onToggle(habit.id, date)}
            />
          </div>
        )}

        {streak < 3 && streak > 0 && (
          <p className="text-xs mt-2" style={{ color: 'rgba(248,113,113,0.6)' }}>
            Keep it going today.
          </p>
        )}
      </motion.div>
    </div>
  )
}
