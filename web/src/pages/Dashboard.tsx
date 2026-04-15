import { useState } from 'react'
import { useHabits, useToggleCompletion, localDateStr } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'
import { DolphinLogo } from '../components/DolphinLogo'
import { QuoteRotator } from '../components/QuoteRotator'
import { StreakHero } from '../components/StreakHero'
import { LosingSection } from '../components/LosingSection'
import { motion, AnimatePresence } from 'framer-motion'
import type { HabitWithStreak } from '../lib/types'

/* ──────────────────────────────────────────────────────────────────────────────
   Dramatic Ocean Wave with two jumping dolphins
   ────────────────────────────────────────────────────────────────────────────── */

function OceanWave({ darkMode }: { darkMode: boolean }) {
  const fill1 = darkMode ? 'rgba(56,189,248,0.12)' : 'rgba(37,99,235,0.10)'
  const fill2 = darkMode ? 'rgba(14,165,233,0.08)' : 'rgba(147,197,253,0.08)'
  const fill3 = darkMode ? 'rgba(99,102,241,0.06)' : 'rgba(37,99,235,0.05)'
  const fill4 = darkMode ? 'rgba(37,99,235,0.04)' : 'rgba(37,99,235,0.03)'

  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: 90 }}>
      {/* Dolphin 1 — blue, left side, arc upward */}
      <svg
        className="dolphin-arc-1"
        viewBox="0 0 48 48"
        fill="none"
        style={{
          position: 'absolute',
          width: 36,
          height: 36,
          left: '22%',
          bottom: 30,
          zIndex: 2,
        }}
      >
        <g transform="rotate(-30 24 24)">
          {/* Body */}
          <ellipse cx="24" cy="24" rx="14" ry="7" fill="#38BDF8" opacity="0.85" />
          {/* Dorsal fin */}
          <path d="M20,17 Q24,8 28,17" fill="#2563EB" opacity="0.7" />
          {/* Tail */}
          <path d="M10,24 Q6,18 4,22 Q6,26 10,24Z" fill="#38BDF8" opacity="0.7" />
          {/* Eye */}
          <circle cx="32" cy="22" r="1.5" fill="#0F1B45" />
          {/* Snout */}
          <ellipse cx="37" cy="24" rx="4" ry="2.5" fill="#7DD3FC" opacity="0.6" />
        </g>
      </svg>

      {/* Dolphin 2 — pink, right side, arc upward */}
      <svg
        className="dolphin-arc-2"
        viewBox="0 0 48 48"
        fill="none"
        style={{
          position: 'absolute',
          width: 32,
          height: 32,
          right: '18%',
          bottom: 22,
          zIndex: 2,
        }}
      >
        <g transform="rotate(-20 24 24) scale(-1,1) translate(-48,0)">
          {/* Body */}
          <ellipse cx="24" cy="24" rx="13" ry="6.5" fill="#F472B6" opacity="0.80" />
          {/* Dorsal fin */}
          <path d="M20,17.5 Q24,9 28,17.5" fill="#EC4899" opacity="0.65" />
          {/* Tail */}
          <path d="M10,24 Q6,18 4,22 Q6,26 10,24Z" fill="#F472B6" opacity="0.65" />
          {/* Eye */}
          <circle cx="32" cy="22" r="1.5" fill="#0F1B45" />
          {/* Snout */}
          <ellipse cx="37" cy="24" rx="3.5" ry="2.2" fill="#FBCFE8" opacity="0.6" />
        </g>
      </svg>

      {/* Splash particles — left dolphin */}
      <div className="splash-left" style={{
        position: 'absolute', left: '22%', bottom: 24, zIndex: 1,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} className={`splash-drop splash-drop-${i}`} style={{
            position: 'absolute',
            width: 3, height: 3,
            borderRadius: '50%',
            background: '#38BDF8',
            opacity: 0.6,
          }} />
        ))}
      </div>

      {/* Splash particles — right dolphin */}
      <div className="splash-right" style={{
        position: 'absolute', right: '20%', bottom: 18, zIndex: 1,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} className={`splash-drop splash-drop-${i}`} style={{
            position: 'absolute',
            width: 3, height: 3,
            borderRadius: '50%',
            background: '#F472B6',
            opacity: 0.5,
          }} />
        ))}
      </div>

      {/* 4-layer waves */}
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none" style={{ width: '200%', height: '100%', position: 'absolute', bottom: 0 }}>
        <path className="wave-1" d="M0,30 C180,10 360,50 540,30 C720,10 900,50 1080,30 C1260,10 1440,50 1440,30 L1440,90 L0,90 Z" fill={fill1} />
        <path className="wave-2" d="M0,40 C200,20 400,60 600,40 C800,20 1000,60 1200,40 C1400,20 1440,40 1440,40 L1440,90 L0,90 Z" fill={fill2} />
        <path className="wave-3" d="M0,50 C240,30 480,65 720,50 C960,35 1200,65 1440,50 L1440,90 L0,90 Z" fill={fill3} />
        <path className="wave-4" d="M0,60 C300,45 600,70 900,60 C1200,50 1440,70 1440,60 L1440,90 L0,90 Z" fill={fill4} />
      </svg>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Podium section — top 3 habits by streak, displayed as a podium visual
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
  const cardBg = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)'
  const cardBorder = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11,20,55,0.09)'

  // Podium order: 2nd | 1st | 3rd (classic podium layout)
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

  // Map back to original indices for medal display
  const orderMap = ranked.length >= 3 ? [1, 0, 2] : ranked.length === 2 ? [1, 0] : [0]

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-base font-bold" style={{ color: textColor }}>
          🏆 Winning Habits
        </h2>
      </div>

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
              {/* Habit info */}
              <span className="text-2xl mb-1">{habit.emoji || '⭐'}</span>
              <span className="text-xs font-semibold text-center truncate w-full mb-1"
                style={{ color: textColor }}>{habit.name}</span>
              <span className="text-lg font-bold" style={{ color: '#38BDF8' }}>{streak}d 🔥</span>

              {doneToday ? (
                <span className="text-[10px] font-medium mb-2" style={{ color: '#4ADE80' }}>✓ Done</span>
              ) : (
                <button
                  onClick={() => onToggle(habit.id, todayStr)}
                  className="text-[10px] font-medium mb-2"
                  style={{ color: mutedColor }}
                >
                  + Do it
                </button>
              )}

              {/* Podium block */}
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

      {/* Remaining winning habits (4th+) as compact cards */}
      {habits.filter(h => (h.streak?.current_streak ?? 0) >= 3).length > 3 && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {habits
            .filter(h => (h.streak?.current_streak ?? 0) >= 3)
            .sort((a, b) => (b.streak?.current_streak ?? 0) - (a.streak?.current_streak ?? 0))
            .slice(3, 7)
            .map(h => {
              const doneToday = h.completions?.includes(todayStr)
              return (
                <div key={h.id} className="rounded-xl p-3"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{h.emoji}</span>
                    <span className="text-xs font-semibold truncate flex-1" style={{ color: textColor }}>{h.name}</span>
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(56,189,248,0.12)', color: '#38BDF8' }}>
                      {h.streak?.current_streak ?? 0}d
                    </span>
                  </div>
                  {doneToday ? (
                    <p className="text-[10px] font-medium" style={{ color: '#38BDF8' }}>✓ Done today</p>
                  ) : (
                    <button onClick={() => onToggle(h.id, todayStr)}
                      className="text-[10px] font-medium" style={{ color: mutedColor }}>
                      + Complete today
                    </button>
                  )}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Streak Dashboard Modal — per-habit streaks with animated bars
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
  const maxStreak = sorted[0]?.streak?.current_streak ?? 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="w-full max-w-sm rounded-3xl p-6"
        style={{
          background: sheetBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          maxHeight: '80vh',
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
    inputBorder: '1px solid rgba(255,255,255,0.12)',
    inputColor: '#fff',
    divider: 'rgba(255,255,255,0.1)',
    badgeBg: 'rgba(255,255,255,0.08)',
    badgeText: 'rgba(255,255,255,0.5)',
  } : {
    bg: '#F0F4FF',
    text: '#0B1437',
    textMuted: 'rgba(11,20,55,0.55)',
    textSub: 'rgba(11,20,55,0.35)',
    cardBg: 'rgba(255,255,255,0.8)',
    cardBorder: 'rgba(11,20,55,0.09)',
    inputBg: 'rgba(11,20,55,0.05)',
    inputBorder: '1px solid rgba(11,20,55,0.15)',
    inputColor: '#0B1437',
    divider: 'rgba(11,20,55,0.12)',
    badgeBg: 'rgba(11,20,55,0.07)',
    badgeText: 'rgba(11,20,55,0.5)',
  }

  const todayStr = localDateStr()

  // #7: Perfect-day streak — consecutive days where ALL 3+ star habits were completed
  const priorityHabits = habits.filter(h => h.star_rating >= 3)
  const perfectDayStreak = (() => {
    if (priorityHabits.length === 0) return 0
    let streak = 0
    const d = new Date()
    // Check today first — if today isn't perfect yet, start from yesterday
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

  // Find the streak start date for the perfect-day streak
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

  // Quick complete chips — habits not done today
  const quickHabits = habits.filter(h => !h.completions?.includes(todayStr)).slice(0, 8)

  function handleToggle(habitId: string, date: string) {
    const habit = habits.find(h => h.id === habitId)
    if (habit) toggleMutation.mutate({ habit, date })
  }

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 60, paddingBottom: 80 }}>
      {/* Hero section */}
      <div className="flex flex-col items-center px-4 pt-6 pb-16 relative">
        <div className="dolphin-glow rounded-full p-3 mb-3" style={{ background: darkMode ? 'rgba(56,189,248,0.08)' : 'rgba(37,99,235,0.08)' }}>
          <DolphinLogo size={56} />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: t.text }}>
          Habit<span style={{ color: '#38BDF8' }}>·</span>at
        </h1>
        <div className="mb-2 px-2 text-center max-w-xs">
          <QuoteRotator intervalMs={600000} darkMode={darkMode} />
        </div>

        {/* Streak hero — now shows perfect-day streak for 3+ star habits */}
        <StreakHero
          streak={perfectDayStreak}
          startDate={perfectStreakStart}
          label={priorityHabits.length > 0 ? 'Perfect Day Streak' : 'Day Streak'}
          sublabel={priorityHabits.length > 0 ? `across ${priorityHabits.length} priority habit${priorityHabits.length > 1 ? 's' : ''}` : undefined}
          darkMode={darkMode}
        />

        {/* See all streaks button */}
        {habits.length > 0 && (
          <button
            onClick={() => setShowStreaks(true)}
            className="mt-1 text-xs font-semibold px-4 py-1.5 rounded-full transition-all"
            style={{
              background: 'rgba(56,189,248,0.12)',
              border: '1px solid rgba(56,189,248,0.25)',
              color: '#38BDF8',
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

            {/* Podium — 1st/2nd/3rd place habits */}
            <PodiumSection habits={habits} onToggle={handleToggle} darkMode={darkMode} />

            {/* Needs attention — struggling habits */}
            <LosingSection habits={habits} onToggle={handleToggle} />

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
