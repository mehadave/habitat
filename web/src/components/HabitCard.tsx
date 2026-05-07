import { useState, useEffect, useRef } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { useUIStore } from '../store/uiStore'
import type { HabitWithStreak } from '../lib/types'

interface HabitCardProps {
  habit: HabitWithStreak
  onEdit: (habit: HabitWithStreak) => void
  onDelete: (habitId: string) => void
}

function PriorityBadge({ rating }: { rating: number }) {
  if (rating >= 4) return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{ background: 'rgba(248,113,113,0.13)', color: '#F87171', border: '1px solid rgba(248,113,113,0.30)' }}>
      High
    </span>
  )
  if (rating >= 2) return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.30)' }}>
      Med
    </span>
  )
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.25)' }}>
      Low
    </span>
  )
}

export function HabitCard({ habit, onEdit, onDelete }: HabitCardProps) {
  const { darkMode } = useUIStore()
  const [revealed, setRevealed] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [hinting, setHinting] = useState(false)
  const hintRan = useRef(false)
  const dragControls = useDragControls()
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function startDragTimer(e: React.PointerEvent) {
    pressTimer.current = setTimeout(() => {
      dragControls.start(e)
    }, 180)
  }

  function cancelDragTimer() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  useEffect(() => {
    if (hintRan.current) return
    if (localStorage.getItem('swipe-hint-shown')) return
    hintRan.current = true
    localStorage.setItem('swipe-hint-shown', '1')
    const t1 = setTimeout(() => setHinting(true), 900)
    const t2 = setTimeout(() => setHinting(false), 1700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const streak = habit.streak?.current_streak ?? 0
  const streakColor = streak >= 7 ? '#93C5FD' : streak >= 3 ? '#60A5FA' : streak > 0 ? '#FBBF24' : '#F87171'

  const monthsAgo = Math.floor((Date.now() - new Date(habit.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
  const isPrivate = habit.is_private && !revealed

  const cardBg = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)'
  const cardShadow = darkMode ? 'none' : '0 2px 12px rgba(11,20,55,0.13)'
  const cardBorder = streak < 3 && streak > 0
    ? '1px solid rgba(248,113,113,0.2)'
    : darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(11,20,55,0.14)'
  const textColor = darkMode ? '#ffffff' : '#0B1437'
  const textMuted = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(11,20,55,0.85)'
  const descBg = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(11,20,55,0.03)'
  const descBorder = darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(11,20,55,0.13)'
  const swipeActionsBg = darkMode ? '#0F1B45' : '#E8EFFF'
  const badgeBg = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(11,20,55,0.11)'
  const badgeColor = darkMode ? 'rgba(255,255,255,0.45)' : 'rgba(11,20,55,0.85)'
  const editBtnBg = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(11,20,55,0.09)'
  const editBtnColor = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(11,20,55,0.78)'

  return (
    <div className="relative rounded-2xl" style={{ isolation: 'isolate' }}>
      {/* Swipe actions — positioned behind the card, revealed as card slides left */}
      <div
        className="absolute inset-y-0 right-0 flex items-center gap-2 px-4 pointer-events-none rounded-2xl"
        style={{
          background: swipeActionsBg,
          opacity: showActions ? 1 : 0,
          transition: 'opacity 0.2s ease',
          width: 160,
          zIndex: 0,
        }}
      >
        <button
          onClick={() => { setShowActions(false); onEdit(habit) }}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold pointer-events-auto text-center"
          style={{ background: 'rgba(37,99,235,0.22)', color: 'var(--accent-text)' }}
        >
          Edit
        </button>
        <button
          onClick={() => { setShowActions(false); onDelete(habit.id) }}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold pointer-events-auto text-center"
          style={{ background: 'rgba(248,113,113,0.2)', color: '#F87171' }}
        >
          Delete
        </button>
      </div>

      <motion.div
        drag="x"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ left: -160, right: 0 }}
        dragElastic={0.05}
        animate={{ x: hinting ? -44 : showActions ? -160 : 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onDragEnd={(_, info) => {
          setShowActions(info.offset.x < -70 || info.velocity.x < -300)
        }}
        onPointerDown={startDragTimer}
        onPointerUp={cancelDragTimer}
        onPointerCancel={cancelDragTimer}
        className="p-4 relative"
        style={{
          background: cardBg,
          border: cardBorder,
          boxShadow: cardShadow,
          borderRadius: 16,
          zIndex: 1,
          touchAction: 'pan-y',
        }}
      >
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Emoji + name */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
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
              {monthsAgo > 0 && (
                <span className="text-xs mt-0.5 leading-none" style={{ color: textMuted }}>{monthsAgo}mo ago</span>
              )}
            </div>
          </div>

          {/* Right side: edit + stars + streak */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(habit)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
              style={{ background: editBtnBg, color: editBtnColor }}
            >
              <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>✏️</span>
            </button>
            <div className="flex flex-col items-end gap-1">
              <PriorityBadge rating={habit.star_rating} />
              <span
                className="text-xs font-semibold"
                style={{ color: streakColor }}
              >
                {streak}d
              </span>
            </div>
          </div>
        </div>

        {/* Description — always visible when present */}
        {habit.description && (
          <div className="mt-2 px-3 py-2 rounded-xl" style={{ background: descBg, border: descBorder }}>
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

        {streak < 3 && streak > 0 && (
          <p className="text-xs mt-2" style={{ color: 'rgba(248,113,113,0.6)' }}>
            Let's check this off!
          </p>
        )}
      </motion.div>
    </div>
  )
}
