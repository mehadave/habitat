import { useState } from 'react'
import { useHabits, useToggleCompletion, localDateStr } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'
import { DolphinLogo } from '../components/DolphinLogo'
import { QuoteRotator } from '../components/QuoteRotator'
import { StreakHero } from '../components/StreakHero'
import { motion, AnimatePresence } from 'framer-motion'
import type { HabitWithStreak } from '../lib/types'

/* ──────────────────────────────────────────────────────────────────────────────
   Dolphin silhouette — clean torpedo body, nose right, tail left
   ────────────────────────────────────────────────────────────────────────────── */
const DOLPHIN_BODY = [
  "M46,15 L44,11",
  "C40,6 34,4 28,5",
  "C22,6 16,9 12,13",
  "C9,15 7,17 6,18",
  "C4,15 2,11 2,9",
  "C4,10 6,14 8,16",
  "C6,18 4,21 2,22",
  "C4,21 7,19 9,19",
  "C13,21 20,23 28,22",
  "C34,21 40,18 44,15",
  "L46,18 L46,15 Z",
  "M28,5 C26,0 24,0 23,1 C22,3 23,7 25,8 Z",
].join(" ")

/* Frozen-inspired ice ring SVG */
function IceRing() {
  const pts6 = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 90) * (Math.PI / 180)
    return { x: 50 + 44 * Math.cos(a), y: 50 + 44 * Math.sin(a) }
  })
  const pts6b = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 60) * (Math.PI / 180)
    return { x: 50 + 44 * Math.cos(a), y: 50 + 44 * Math.sin(a) }
  })

  return (
    <svg
      viewBox="0 0 100 100"
      width={88}
      height={88}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="iceG1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#e0f2fe" stopOpacity="0.95" />
          <stop offset="45%"  stopColor="#38bdf8" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.9"  />
        </linearGradient>
        <filter id="iceGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer glow ring */}
      <circle cx="50" cy="50" r="46" stroke="#7dd3fc" strokeWidth="1" fill="none" opacity="0.25" />

      {/* Main ice ring */}
      <circle cx="50" cy="50" r="42" stroke="url(#iceG1)" strokeWidth="4.5"
        fill="rgba(186,230,253,0.04)" filter="url(#iceGlow)" />

      {/* Inner dashed ring */}
      <circle cx="50" cy="50" r="35" stroke="#bae6fd" strokeWidth="1" fill="none"
        strokeDasharray="5 4" opacity="0.45" />

      {/* Crystal spikes at 6 outer points */}
      {pts6.map((p, i) => {
        const angle = i * 60 - 90
        const rad = angle * (Math.PI / 180)
        const tx = p.x + 7 * Math.cos(rad)
        const ty = p.y + 7 * Math.sin(rad)
        return (
          <g key={i}>
            <line x1={p.x} y1={p.y} x2={tx} y2={ty}
              stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
            <circle cx={tx} cy={ty} r="1.5" fill="#bae6fd" opacity="0.9" />
          </g>
        )
      })}

      {/* Sparkle dots between spikes */}
      {pts6b.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1" fill="#e0f2fe" opacity="0.6" />
      ))}

      {/* Inner shimmer circles */}
      <circle cx="50" cy="50" r="20" stroke="rgba(186,230,253,0.2)" strokeWidth="1"
        fill="rgba(186,230,253,0.03)" strokeDasharray="3 6" />

      {/* Center star glint */}
      <circle cx="50" cy="50" r="2.5" fill="#bae6fd" opacity="0.5" />
      <line x1="47" y1="50" x2="53" y2="50" stroke="#e0f2fe" strokeWidth="0.8" opacity="0.6" />
      <line x1="50" y1="47" x2="50" y2="53" stroke="#e0f2fe" strokeWidth="0.8" opacity="0.6" />
    </svg>
  )
}

function OceanWave({ darkMode }: { darkMode: boolean }) {
  const fill1 = darkMode ? 'rgba(56,189,248,0.14)' : 'rgba(37,99,235,0.12)'
  const fill2 = darkMode ? 'rgba(14,165,233,0.10)' : 'rgba(147,197,253,0.10)'
  const fill3 = darkMode ? 'rgba(99,102,241,0.07)' : 'rgba(37,99,235,0.06)'
  const fill4 = darkMode ? 'rgba(37,99,235,0.05)' : 'rgba(37,99,235,0.04)'

  return (
    /*
     * overflow: visible — lets dolphins arc above the hero boundary without clipping.
     * The parent hero div uses overflow-x: clip so no horizontal scrollbar appears.
     */
    <div
      className="pointer-events-none"
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 130, overflow: 'visible' }}
    >
      {/* ── Ice ring — centered, Frozen-inspired ── */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 62,
          transform: 'translateX(-50%)',
          filter: 'drop-shadow(0 0 14px rgba(56,189,248,0.55))',
          zIndex: 1,
        }}
      >
        <div className="ice-ring-spin">
          <IceRing />
        </div>
      </div>

      {/* ── Blue dolphin — full-width left→right swim ── */}
      <svg
        className="dolphin-swim-blue"
        viewBox="0 0 48 24"
        fill="none"
        style={{ position: 'absolute', width: 52, height: 26, bottom: 70, left: 0, zIndex: 2 }}
      >
        <defs>
          <linearGradient id="blueDolphinG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <path d={DOLPHIN_BODY} fill="url(#blueDolphinG)" />
        {/* Eye */}
        <ellipse cx="41" cy="13" rx="1.8" ry="1.5" fill="white" opacity="0.9" />
        <circle cx="41.4" cy="13" r="0.9" fill="#1e3a8a" />
        <circle cx="41.8" cy="12.4" r="0.35" fill="white" />
      </svg>

      {/* ── Pink dolphin — follows blue, offset by -9s ── */}
      <svg
        className="dolphin-swim-pink"
        viewBox="0 0 48 24"
        fill="none"
        style={{ position: 'absolute', width: 44, height: 22, bottom: 70, left: 0, zIndex: 2 }}
      >
        <defs>
          <linearGradient id="pinkDolphinG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f9a8d4" />
            <stop offset="100%" stopColor="#be185d" />
          </linearGradient>
        </defs>
        <path d={DOLPHIN_BODY} fill="url(#pinkDolphinG)" />
        {/* Eye */}
        <ellipse cx="41" cy="13" rx="1.8" ry="1.5" fill="white" opacity="0.9" />
        <circle cx="41.4" cy="13" r="0.9" fill="#9d174d" />
        <circle cx="41.8" cy="12.4" r="0.35" fill="white" />
      </svg>

      {/* ── 4-layer wave SVG ── */}
      <svg viewBox="0 0 1440 130" preserveAspectRatio="none"
        style={{ width: '200%', height: '100%', position: 'absolute', bottom: 0 }}>
        <path className="wave-1" d="M0,50 C180,25 360,70 540,50 C720,25 900,70 1080,50 C1260,25 1440,70 1440,50 L1440,130 L0,130 Z" fill={fill1} />
        <path className="wave-2" d="M0,62 C200,40 400,80 600,62 C800,40 1000,80 1200,62 C1400,40 1440,62 1440,62 L1440,130 L0,130 Z" fill={fill2} />
        <path className="wave-3" d="M0,75 C240,55 480,90 720,75 C960,58 1200,90 1440,75 L1440,130 L0,130 Z" fill={fill3} />
        <path className="wave-4" d="M0,90 C300,72 600,100 900,90 C1200,78 1440,100 1440,90 L1440,130 L0,130 Z" fill={fill4} />
      </svg>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Podium section — top 3 habits by streak
   ────────────────────────────────────────────────────────────────────────────── */

function PodiumSection({ habits, onToggle, darkMode }: {
  habits: HabitWithStreak[]
  onToggle: (habitId: string, date: string) => void
  darkMode: boolean
}) {
  const todayStr = localDateStr()
  const ranked = habits
    .filter(h => (h.streak?.current_streak ?? 0) >= 1)
    .sort((a, b) => (b.streak?.current_streak ?? 0) - (a.streak?.current_streak ?? 0))
    .slice(0, 3)

  if (ranked.length === 0) return null

  const textColor = darkMode ? '#fff' : '#0B1437'
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(11,20,55,0.5)'
  const cardBorder = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11,20,55,0.09)'

  // Podium order: 2nd | 1st | 3rd
  const podiumOrder = ranked.length >= 3
    ? [ranked[1], ranked[0], ranked[2]]
    : ranked.length === 2
      ? [ranked[1], ranked[0]]
      : [ranked[0]]

  const medals = ['🥈', '🥇', '🥉']
  const podiumHeights = [72, 96, 56]
  const podiumColors = [
    'linear-gradient(180deg, rgba(192,192,192,0.2), rgba(192,192,192,0.05))',
    'linear-gradient(180deg, rgba(255,215,0,0.2), rgba(255,215,0,0.05))',
    'linear-gradient(180deg, rgba(205,127,50,0.15), rgba(205,127,50,0.03))',
  ]

  const orderMap = ranked.length >= 3 ? [1, 0, 2] : ranked.length === 2 ? [1, 0] : [0]

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold mb-3" style={{ color: textColor }}>
        🏆 Winning Habits
      </h2>

      <div className="flex items-end justify-center gap-3" style={{ minHeight: 180 }}>
        {podiumOrder.map((habit, i) => {
          const streak = habit.streak?.current_streak ?? 0
          const doneToday = habit.completions?.includes(todayStr)
          const medalIdx = orderMap[i]
          const height = podiumHeights[medalIdx] ?? 56

          return (
            <motion.div
              key={habit.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 18 }}
              className="flex flex-col items-center flex-1"
              style={{ maxWidth: 120 }}
            >
              <span className="text-2xl mb-1">{habit.emoji || '⭐'}</span>
              <span className="text-xs font-semibold text-center truncate w-full mb-1"
                style={{ color: textColor }}>{habit.name}</span>
              <span className="text-lg font-bold" style={{ color: '#38BDF8' }}>{streak}d 🔥</span>

              {doneToday ? (
                <span className="text-[10px] font-medium mb-2" style={{ color: '#4ADE80' }}>✓ Done</span>
              ) : (
                <button onClick={() => onToggle(habit.id, todayStr)}
                  className="text-[10px] font-medium mb-2" style={{ color: mutedColor }}>
                  + Do it
                </button>
              )}

              <div
                className="w-full rounded-t-xl flex items-start justify-center pt-2"
                style={{
                  height,
                  background: podiumColors[medalIdx],
                  border: `1px solid ${cardBorder}`,
                  borderBottom: 'none',
                }}
              >
                <span className="text-2xl">{medals[medalIdx]}</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Needs Attention — minimal list, max 4 habits
   ────────────────────────────────────────────────────────────────────────────── */

function NeedsAttentionSection({ habits, onToggle, darkMode }: {
  habits: HabitWithStreak[]
  onToggle: (habitId: string, date: string) => void
  darkMode: boolean
}) {
  const todayStr = localDateStr()
  const struggling = habits
    .filter(h => (h.streak?.current_streak ?? 0) < 3)
    .sort((a, b) => (a.streak?.current_streak ?? 0) - (b.streak?.current_streak ?? 0))
    .slice(0, 4)

  if (struggling.length === 0) return null

  const textColor = darkMode ? '#fff' : '#0B1437'
  const mutedColor = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(11,20,55,0.4)'
  const divider = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(11,20,55,0.06)'

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold mb-2" style={{ color: mutedColor }}>
        Needs attention
      </h2>
      <div>
        {struggling.map((habit, i) => {
          const streak = habit.streak?.current_streak ?? 0
          const doneToday = habit.completions?.includes(todayStr)
          return (
            <div
              key={habit.id}
              className="flex items-center gap-3 py-2.5"
              style={{ borderBottom: i < struggling.length - 1 ? `1px solid ${divider}` : 'none' }}
            >
              <span className="text-base flex-shrink-0">{habit.emoji || '⭐'}</span>
              <span className="text-sm flex-1 truncate" style={{ color: textColor }}>{habit.name}</span>
              {doneToday ? (
                <span className="text-xs font-medium" style={{ color: '#4ADE80' }}>✓</span>
              ) : (
                <button
                  onClick={() => onToggle(habit.id, todayStr)}
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(248,113,113,0.10)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' }}
                >
                  Do it
                </button>
              )}
              <span className="text-xs font-medium flex-shrink-0" style={{ color: streak > 0 ? '#FBBF24' : '#F87171' }}>
                {streak}d
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Streak Dashboard Modal
   ────────────────────────────────────────────────────────────────────────────── */

function StreakDashboardModal({ habits, onClose, darkMode }: {
  habits: HabitWithStreak[]
  onClose: () => void
  darkMode: boolean
}) {
  const textColor = darkMode ? '#fff' : '#0B1437'
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(11,20,55,0.5)'
  const sheetBg = darkMode ? '#0F1B45' : '#EEF3FF'
  const cardBorder = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(11,20,55,0.1)'
  const barTrack = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11,20,55,0.08)'

  const sorted = [...habits].sort(
    (a, b) => (b.streak?.current_streak ?? 0) - (a.streak?.current_streak ?? 0)
  )
  const maxStreak = Math.max(sorted[0]?.streak?.current_streak ?? 1, 1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="w-full max-w-sm rounded-3xl p-6"
        style={{
          background: sheetBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          maxHeight: '75vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: textColor }}>🔥 All Streaks</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ background: barTrack, color: mutedColor }}>×</button>
        </div>

        <div className="space-y-4">
          {sorted.map((habit, i) => {
            const streak = habit.streak?.current_streak ?? 0
            const best = habit.streak?.longest_streak ?? 0
            const pct = maxStreak > 0 ? Math.max((streak / maxStreak) * 100, 4) : 4
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''

            return (
              <motion.div
                key={habit.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{habit.emoji || '⭐'}</span>
                  <span className="text-sm font-semibold flex-1 truncate" style={{ color: textColor }}>
                    {habit.name}
                  </span>
                  {medal && <span className="text-base">{medal}</span>}
                  <span className="text-sm font-bold" style={{ color: '#38BDF8' }}>{streak}d</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: barTrack }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                    style={{ background: 'linear-gradient(90deg, #2563EB, #38BDF8)' }}
                  />
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="text-[10px]" style={{ color: mutedColor }}>Current: {streak}d</span>
                  <span className="text-[10px]" style={{ color: mutedColor }}>Best: {best}d</span>
                  <span className="text-[10px]" style={{ color: mutedColor }}>Total: {habit.completions?.length ?? 0}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {sorted.length === 0 && (
          <p className="text-center text-sm py-8" style={{ color: mutedColor }}>
            No habits yet. Add some to see your streaks!
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Dashboard
   ────────────────────────────────────────────────────────────────────────────── */

export default function Dashboard() {
  const { darkMode } = useUIStore()
  const { data: habits = [], isLoading } = useHabits()
  const toggleMutation = useToggleCompletion()
  const [showStreaks, setShowStreaks] = useState(false)

  const t = darkMode ? {
    bg: '#0B1120',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.5)',
    textSub: 'rgba(255,255,255,0.3)',
    cardBg: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.08)',
    inputBg: 'rgba(255,255,255,0.07)',
  } : {
    bg: '#F0F4FF',
    text: '#0B1437',
    textMuted: 'rgba(11,20,55,0.55)',
    textSub: 'rgba(11,20,55,0.35)',
    cardBg: 'rgba(255,255,255,0.8)',
    cardBorder: 'rgba(11,20,55,0.09)',
    inputBg: 'rgba(11,20,55,0.05)',
  }

  const todayStr = localDateStr()

  // Perfect-day streak — consecutive days where ALL 3+ star habits were completed
  const priorityHabits = habits.filter(h => h.star_rating >= 3)
  const perfectDayStreak = (() => {
    if (priorityHabits.length === 0) return 0
    let streak = 0
    const d = new Date()
    const todayPerfect = priorityHabits.every(h => h.completions?.includes(todayStr))
    if (!todayPerfect) d.setDate(d.getDate() - 1)

    while (true) {
      const ds = localDateStr(d)
      const allDone = priorityHabits.every(h => h.completions?.includes(ds))
      if (!allDone) break
      streak++
      d.setDate(d.getDate() - 1)
    }
    return streak
  })()

  const perfectStreakStart = (() => {
    if (perfectDayStreak === 0) return undefined
    const d = new Date()
    d.setDate(d.getDate() - perfectDayStreak + (priorityHabits.every(h => h.completions?.includes(todayStr)) ? 0 : 1))
    return localDateStr(d)
  })()

  // Stats
  const totalHabits = habits.length
  const monthStart = localDateStr(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const daysInMonth = new Date().getDate()
  const completedThisMonth = habits.reduce((sum, h) => sum + (h.completions?.filter(d => d >= monthStart).length ?? 0), 0)
  const possibleThisMonth = totalHabits * daysInMonth
  const completionPct = possibleThisMonth > 0 ? Math.round((completedThisMonth / possibleThisMonth) * 100) : 0

  const perfectDays = (() => {
    const days: Record<string, number> = {}
    habits.forEach(h => {
      h.completions?.filter(d => d >= monthStart).forEach(d => {
        days[d] = (days[d] ?? 0) + 1
      })
    })
    return Object.values(days).filter(c => c >= totalHabits && totalHabits > 0).length
  })()

  const quickHabits = habits.filter(h => !h.completions?.includes(todayStr)).slice(0, 8)

  function handleToggle(habitId: string, date: string) {
    const habit = habits.find(h => h.id === habitId)
    if (habit) toggleMutation.mutate({ habit, date })
  }

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 60, paddingBottom: 80 }}>
      {/* Hero section — overflow-x:clip prevents horizontal scroll while allowing dolphins to arc vertically */}
      <div className="flex flex-col items-center px-4 pt-6 pb-20 relative" style={{ overflowX: 'clip' }}>
        <div className="dolphin-glow rounded-full p-3 mb-3" style={{ background: darkMode ? 'rgba(56,189,248,0.08)' : 'rgba(37,99,235,0.08)' }}>
          <DolphinLogo size={56} />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: t.text }}>
          Habit<span style={{ color: '#38BDF8' }}>·</span>at
        </h1>
        <div className="mb-2 px-2 text-center max-w-xs">
          <QuoteRotator intervalMs={600000} darkMode={darkMode} />
        </div>

        <StreakHero
          streak={perfectDayStreak}
          startDate={perfectStreakStart}
          label={priorityHabits.length > 0 ? 'Perfect Day Streak' : 'Day Streak'}
          sublabel={priorityHabits.length > 0 ? `across ${priorityHabits.length} priority habit${priorityHabits.length > 1 ? 's' : ''}` : undefined}
          darkMode={darkMode}
        />

        {/* See all streaks button — z-index above wave */}
        {habits.length > 0 && (
          <button
            onClick={() => setShowStreaks(true)}
            className="mt-1 text-xs font-semibold px-4 py-1.5 rounded-full transition-all relative"
            style={{
              background: 'rgba(56,189,248,0.12)',
              border: '1px solid rgba(56,189,248,0.25)',
              color: '#38BDF8',
              zIndex: 10,
            }}
          >
            See all streaks →
          </button>
        )}

        <OceanWave darkMode={darkMode} />
      </div>

      {/* Content */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { label: 'Habits', value: totalHabits },
                { label: '% this month', value: `${completionPct}%` },
                { label: 'Perfect days', value: perfectDays },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl p-3 text-center"
                  style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                  <p className="text-xl font-bold" style={{ color: t.text }}>{value}</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: t.textMuted }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Quick complete chips */}
            {quickHabits.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2" style={{ color: t.textMuted }}>Quick complete</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {quickHabits.map((h) => (
                    <motion.button
                      key={h.id}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleToggle(h.id, todayStr)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-sm font-medium flex-shrink-0"
                      style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', color: '#38BDF8' }}
                    >
                      <span>{h.emoji}</span>
                      <span>{h.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Podium — top 3 habits with 3+ day streaks */}
            <PodiumSection habits={habits} onToggle={handleToggle} darkMode={darkMode} />

            {/* Needs attention — minimalistic list */}
            <NeedsAttentionSection habits={habits} onToggle={handleToggle} darkMode={darkMode} />

            {habits.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🐬</p>
                <p className="text-base font-semibold mb-1" style={{ color: t.text }}>No habits yet?</p>
                <p className="text-sm" style={{ color: t.textMuted }}>Your pod is waiting.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Streak dashboard modal */}
      <AnimatePresence>
        {showStreaks && (
          <StreakDashboardModal
            habits={habits}
            onClose={() => setShowStreaks(false)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
