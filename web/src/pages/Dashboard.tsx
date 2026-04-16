import { useState } from 'react'
import { useHabits, useToggleCompletion, localDateStr } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'
import { DolphinLogo } from '../components/DolphinLogo'
import { QuoteRotator } from '../components/QuoteRotator'
import { StreakHero } from '../components/StreakHero'
import { motion, AnimatePresence } from 'framer-motion'
import type { HabitWithStreak } from '../lib/types'

/* ──────────────────────────────────────────────────────────────────────────────
   Realistic dolphin SVG silhouette path
   ────────────────────────────────────────────────────────────────────────────── */

// Realistic leaping-dolphin silhouette — nose at right, tail at left, body in graceful arc
// viewBox "0 0 48 32"
const DOLPHIN_PATH = [
  // ── Beak tip to dorsal outline ──
  "M46,28",                         // beak tip (lower-right)
  "L44,23",                         // top of beak
  "C40,18 34,15 28,16",             // forehead / back of head
  "C22,17 16,21 12,25",             // upper back
  "C9,27 7,29 6,30",                // peduncle top
  // ── Upper tail fluke ──
  "C4,27 2,23 2,21",
  "C4,22 6,26 8,28",
  // ── Lower tail fluke ──
  "C6,30 4,33 2,34",                // lower lobe
  "C4,33 7,31 9,31",
  // ── Belly back to beak ──
  "C13,33 20,35 28,34",
  "C34,33 40,30 44,27",
  "L46,30",
  "L46,28 Z",
  // ── Dorsal fin (separate sub-path) ──
  "M28,16 C26,10 24,6 22,6 C20,8 21,14 24,17 Z",
  // ── Eye ──
  "M41,21 A1.6,1.6 0 1,0 41.01,21 Z",
].join(" ")

function OceanWave({ darkMode }: { darkMode: boolean }) {
  const fill1 = darkMode ? 'rgba(56,189,248,0.14)' : 'rgba(37,99,235,0.12)'
  const fill2 = darkMode ? 'rgba(14,165,233,0.10)' : 'rgba(147,197,253,0.10)'
  const fill3 = darkMode ? 'rgba(99,102,241,0.07)' : 'rgba(37,99,235,0.06)'
  const fill4 = darkMode ? 'rgba(37,99,235,0.05)' : 'rgba(37,99,235,0.04)'

  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none" style={{ height: 100 }}>
      {/* Dolphin 1 — blue, leaping left-to-right */}
      <svg
        className="dolphin-arc-1"
        viewBox="0 0 48 32"
        fill="none"
        style={{ position: 'absolute', width: 44, height: 30, left: '20%', bottom: 35 }}
      >
        <path
          d={DOLPHIN_PATH}
          fill="#38BDF8"
          opacity="0.9"
          transform="rotate(-25 24 16)"
        />
      </svg>

      {/* Dolphin 2 — pink, leaping right-to-left (mirrored) */}
      <svg
        className="dolphin-arc-2"
        viewBox="0 0 48 32"
        fill="none"
        style={{ position: 'absolute', width: 38, height: 26, right: '16%', bottom: 28 }}
      >
        <path
          d={DOLPHIN_PATH}
          fill="#F472B6"
          opacity="0.85"
          transform="scale(-1,1) translate(-48,0) rotate(-18 24 16)"
        />
      </svg>

      {/* Splash drops — blue */}
      <div className="splash-left" style={{ position: 'absolute', left: '24%', bottom: 30 }}>
        {[0, 1, 2].map(i => (
          <div key={i} className={`splash-drop splash-drop-${i}`} style={{
            position: 'absolute', width: 3, height: 3, borderRadius: '50%',
            background: '#38BDF8', opacity: 0.5,
          }} />
        ))}
      </div>

      {/* Splash drops — pink */}
      <div className="splash-right" style={{ position: 'absolute', right: '18%', bottom: 24 }}>
        {[0, 1, 2].map(i => (
          <div key={i} className={`splash-drop splash-drop-${i}`} style={{
            position: 'absolute', width: 3, height: 3, borderRadius: '50%',
            background: '#F472B6', opacity: 0.4,
          }} />
        ))}
      </div>

      {/* 4-layer waves */}
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ width: '200%', height: '100%', position: 'absolute', bottom: 0 }}>
        <path className="wave-1" d="M0,35 C180,15 360,55 540,35 C720,15 900,55 1080,35 C1260,15 1440,55 1440,35 L1440,100 L0,100 Z" fill={fill1} />
        <path className="wave-2" d="M0,45 C200,25 400,65 600,45 C800,25 1000,65 1200,45 C1400,25 1440,45 1440,45 L1440,100 L0,100 Z" fill={fill2} />
        <path className="wave-3" d="M0,55 C240,35 480,70 720,55 C960,40 1200,70 1440,55 L1440,100 L0,100 Z" fill={fill3} />
        <path className="wave-4" d="M0,68 C300,50 600,78 900,68 C1200,58 1440,78 1440,68 L1440,100 L0,100 Z" fill={fill4} />
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
      {/* Hero section */}
      <div className="flex flex-col items-center px-4 pt-6 pb-20 relative">
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
