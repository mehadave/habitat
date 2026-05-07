import { useState } from 'react'
import { useHabits, useToggleCompletion, localDateStr } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'
import { useAuthStore } from '../store/authStore'
import { DolphinLogo } from '../components/DolphinLogo'
import { QuoteRotator } from '../components/QuoteRotator'
import { StreakHero } from '../components/StreakHero'
import { motion, AnimatePresence } from 'framer-motion'
import type { HabitWithStreak } from '../lib/types'

/* ──────────────────────────────────────────────────────────────────────────────
   Water ring — static glassy hoop, animated water swirling inside,
   mini snowflake target in the center. No drips.
   SVG SMIL animateTransform drives the internal flow (no CSS classes needed).
   ────────────────────────────────────────────────────────────────────────────── */
function WaterRing() {
  const CX = 60, CY = 60, R = 42

  return (
    <svg viewBox="0 0 120 120" width={96} height={96} fill="none">
      <defs>
        {/* Clip to ring interior — water stays inside */}
        <clipPath id="wr-inner">
          <circle cx={CX} cy={CY} r={R - 5} />
        </clipPath>

        {/* Ring stroke gradient — glassy water look */}
        <linearGradient id="wr-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#bae6fd" stopOpacity="0.97" />
          <stop offset="50%"  stopColor="#38bdf8" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.82" />
        </linearGradient>

        {/* Radial glow filter */}
        <filter id="wr-glow" x="-28%" y="-28%" width="156%" height="156%">
          <feGaussianBlur stdDeviation="2.8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Animated water swirling inside the ring ── */}
      <g clipPath="url(#wr-inner)">
        {/* Subtle water fill */}
        <circle cx={CX} cy={CY} r={R - 5} fill="rgba(14,165,233,0.07)" />

        {/* Swirl ring 1 — clockwise, slower */}
        <circle cx={CX} cy={CY} r={R * 0.70} stroke="rgba(56,189,248,0.38)"
          strokeWidth="2.8" fill="none" strokeDasharray="22 13">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="5s" repeatCount="indefinite" />
        </circle>

        {/* Swirl ring 2 — counter-clockwise, medium */}
        <circle cx={CX} cy={CY} r={R * 0.52} stroke="rgba(186,230,253,0.45)"
          strokeWidth="2" fill="none" strokeDasharray="15 10">
          <animateTransform attributeName="transform" type="rotate"
            from={`360 ${CX} ${CY}`} to={`0 ${CX} ${CY}`} dur="3.6s" repeatCount="indefinite" />
        </circle>

        {/* Swirl ring 3 — clockwise, fastest */}
        <circle cx={CX} cy={CY} r={R * 0.32} stroke="rgba(255,255,255,0.32)"
          strokeWidth="1.4" fill="none" strokeDasharray="9 7">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="2.5s" repeatCount="indefinite" />
        </circle>

        {/* Tiny floating bubbles drifting up — staggered with animateMotion */}
        {[
          { cx: CX - 10, cy: CY + 15, r: 1.4, dur: '3.2s', delay: '0s'   },
          { cx: CX + 6,  cy: CY + 18, r: 1.0, dur: '2.8s', delay: '-1.4s' },
          { cx: CX - 2,  cy: CY + 22, r: 1.6, dur: '3.8s', delay: '-2.1s' },
        ].map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="rgba(255,255,255,0.50)">
            <animate attributeName="cy" values={`${b.cy};${b.cy - 28};${b.cy}`}
              dur={b.dur} begin={b.delay} repeatCount="indefinite" calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
            <animate attributeName="opacity" values="0;0.6;0" dur={b.dur} begin={b.delay}
              repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* ── Static glassy ring border (on top of water) ── */}
      <circle cx={CX} cy={CY} r={R} stroke="url(#wr-grad)" strokeWidth="6"
        fill="none" filter="url(#wr-glow)" />

      {/* Top-arc glassy highlight */}
      <path d={`M ${CX - 30} ${CY - 36} A ${R} ${R} 0 0 1 ${CX + 30} ${CY - 36}`}
        stroke="rgba(255,255,255,0.52)" strokeWidth="2.2" strokeLinecap="round" fill="none" />

    </svg>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Logo-identical dolphin — mirrored to face RIGHT (direction of travel).
   Original logo has eye at x≈22 (left), tail at x≈56 (right) → faces left.
   We wrap in <g transform="translate(60,0) scale(-1,1)"> to flip within the
   60×60 viewBox: x′ = 60 − x → eye at x=38 (right), tail at x=4 (left).
   ────────────────────────────────────────────────────────────────────────────── */
function SwimDolphin({ color }: { color: 'blue' | 'pink' }) {
  const isPink = color === 'pink'
  const bodyBase  = isPink ? '#9d174d' : '#1e3a8a'
  const bodyTop   = isPink ? '#ec4899' : '#2563eb'
  const dorsalFin = isPink ? '#f9a8d4' : '#93c5fd'
  const tailColor = isPink ? '#be185d' : '#1d4ed8'
  const eyeBg     = isPink ? '#fce7f3' : '#dbeafe'
  const eyePupil  = isPink ? '#9d174d' : '#1e3a8a'

  const sz = isPink ? 44 : 50

  return (
    <svg viewBox="0 0 60 60" width={sz} height={sz} fill="none">
      {/* translate(60,0) scale(-1,1) mirrors the drawing: x → 60-x */}
      <g transform="translate(60,0) scale(-1,1)">
        {/* Body */}
        <ellipse cx="28" cy="34" rx="18" ry="13" fill={bodyBase} />
        {/* Upper body highlight */}
        <path d="M12 28 Q18 18 28 20 Q38 18 44 28 Q38 26 28 27 Q18 26 12 28Z" fill={bodyTop} />
        {/* Dorsal fin */}
        <path d="M26 20 Q30 10 38 14 Q34 18 30 21Z" fill={dorsalFin} />
        {/* Left flipper */}
        <path d="M13 34 Q8 38 10 44 Q14 40 16 36Z" fill={bodyBase} />
        {/* Right flipper */}
        <path d="M42 34 Q46 37 45 42 Q42 39 40 36Z" fill={bodyBase} />
        {/* Tail */}
        <path d="M44 38 Q52 32 56 26 Q52 30 48 34 Q54 26 56 18 Q50 24 46 32Z" fill={tailColor} />
        {/* Eye */}
        <ellipse cx="22" cy="27" rx="4" ry="3.5" fill={eyeBg} />
        <circle cx="22.5" cy="27" r="2" fill={eyePupil} />
        <circle cx="23.5" cy="25.8" r="0.8" fill="white" />
        {/* Smile */}
        <path d="M17 31 Q20 33 23 31" stroke={tailColor} strokeWidth="0.8"
          strokeLinecap="round" fill="none" />
      </g>
    </svg>
  )
}

function OceanWave({ darkMode, userName }: { darkMode: boolean; userName: string }) {
  const fill1 = darkMode ? 'rgba(56,189,248,0.14)' : 'rgba(37,99,235,0.12)'
  const fill2 = darkMode ? 'rgba(14,165,233,0.10)' : 'rgba(147,197,253,0.10)'
  const fill3 = darkMode ? 'rgba(99,102,241,0.07)' : 'rgba(37,99,235,0.06)'
  const fill4 = darkMode ? 'rgba(37,99,235,0.05)' : 'rgba(37,99,235,0.04)'

  return (
    /*
     * overflow: visible → dolphins arc above the hero boundary freely.
     * Parent hero div uses overflow-x: clip → no horizontal scrollbar.
     * Ring centred at 76 % from left (between middle and right edge).
     * Ring bottom is 44 px above the wave floor — clear of all page text.
     * Dolphins z-index 4, ring z-index 3 → dolphins pass in front.
     */
    <div
      className="pointer-events-none"
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 145, overflow: 'visible' }}
    >
      {/* ── WaterRing — 96×96 px, centred at 76% ──
          CSS 3D: perspective(420px) rotateY(42deg) → opening faces left-front.
          rotateX(-10deg) → small upward tilt for depth.
          Ring SVG is 96×96 → centre it at left: calc(76% - 48px).
          bottom: 44 px keeps it above the wave tops and well below any text.
      ── */}
      <div style={{
        position: 'absolute',
        left: 'calc(76% - 48px)',
        bottom: 44,
        zIndex: 3,
        transform: 'perspective(420px) rotateY(42deg) rotateX(-10deg)',
        transformOrigin: 'center center',
        filter: 'drop-shadow(0 0 16px rgba(14,165,233,0.65)) drop-shadow(0 0 5px rgba(186,230,253,0.45))',
      }}>
        <WaterRing />
      </div>

      {/* ── Blue dolphin — outer div translates, inner div rotates ── */}
      <div
        className="dolphin-swim-blue"
        style={{ position: 'absolute', bottom: 62, left: 0, zIndex: 4 }}
      >
        <div className="dolphin-flip-blue">
          <SwimDolphin color="blue" />
        </div>
      </div>

      {/* ── Pink dolphin — offset -6.5 s ── */}
      <div
        className="dolphin-swim-pink"
        style={{ position: 'absolute', bottom: 62, left: 0, zIndex: 4 }}
      >
        <div className="dolphin-flip-pink">
          <SwimDolphin color="pink" />
        </div>
      </div>

      {/* ── Speech bubbles — placed at bottom:65 inside the OceanWave container
          (which is position:absolute, bottom:0, height:145 in the hero).
          bottom:65 ≈ dolphin height (62) — bubble floats right beside the dolphin.
          left:20 keeps it left-aligned, away from the centered hero text.
      ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 145, zIndex: 6, pointerEvents: 'none' }}>
        <div
          className="hi-bubble-blue"
          style={{
            position: 'absolute',
            bottom: 112,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '14px 14px 14px 4px',
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 500,
            color: '#1e3a8a',
            border: '1px solid rgba(37,99,235,0.15)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.14), 0 1px 4px rgba(37,99,235,0.12)',
            letterSpacing: '-0.01em',
            lineHeight: 1.4,
          }}
        >
          <div className="flex flex-row gap-1">
            <div>Hey <span style={{ color: '#2563EB', fontWeight: 700 }}>{userName}</span>,</div>
            <div>You got this!! 💙</div>
          </div>
        </div>
        <div
          className="hi-bubble-pink"
          style={{
            position: 'absolute',
            bottom: 112,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '14px 14px 14px 4px',
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 500,
            color: '#1e3a8a',
            border: '1px solid rgba(236,72,153,0.15)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.14), 0 1px 4px rgba(236,72,153,0.12)',
            letterSpacing: '-0.01em',
            lineHeight: 1.4,
          }}
        >
          <div className="flex flex-row gap-1">
            <div>Keep going <span style={{ color: '#ec4899', fontWeight: 700 }}>{userName}</span>!</div>
            <div>🌸</div>
          </div>
        </div>
      </div>

      {/* ── 4-layer wave SVG ── */}
      <svg viewBox="0 0 1440 145" preserveAspectRatio="none"
        style={{ width: '200%', height: '100%', position: 'absolute', bottom: 0 }}>
        <path className="wave-1" d="M0,55 C180,28 360,75 540,55 C720,28 900,75 1080,55 C1260,28 1440,75 1440,55 L1440,145 L0,145 Z" fill={fill1} />
        <path className="wave-2" d="M0,68 C200,44 400,86 600,68 C800,44 1000,86 1200,68 C1400,44 1440,68 1440,68 L1440,145 L0,145 Z" fill={fill2} />
        <path className="wave-3" d="M0,82 C240,60 480,96 720,82 C960,64 1200,96 1440,82 L1440,145 L0,145 Z" fill={fill3} />
        <path className="wave-4" d="M0,96 C300,78 600,108 900,96 C1200,84 1440,108 1440,96 L1440,145 L0,145 Z" fill={fill4} />
      </svg>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Podium section — top 3 habits by streak
   ────────────────────────────────────────────────────────────────────────────── */

function PodiumSection({ habits, onToggle }: {
  habits: HabitWithStreak[]
  onToggle: (habitId: string, date: string) => void
}) {
  const todayStr = localDateStr()
  const ranked = [...habits]
    .sort((a, b) => {
      const sd = (b.streak?.current_streak ?? 0) - (a.streak?.current_streak ?? 0)
      if (sd !== 0) return sd
      return (b.completions?.length ?? 0) - (a.completions?.length ?? 0)
    })
    .slice(0, 3)

  if (ranked.length === 0) return null

  const textColor = 'var(--text-1)'
  const mutedColor = 'var(--text-2)'
  const cardBorder = 'var(--border)'

  // Podium layout: Silver (left) | Gold (center) | Bronze (right)
  // Position i directly maps to the correct medal/height — no remapping needed.
  const podiumOrder = ranked.length >= 3
    ? [ranked[1], ranked[0], ranked[2]]
    : ranked.length === 2
      ? [ranked[1], ranked[0]]
      : [ranked[0]]

  // Index 0 = left (2nd place) · 1 = center (1st place) · 2 = right (3rd place)
  // For 1 habit: force gold (index 1). For 2+: use podium position as-is.
  const medals      = ['🥈', '🥇', '🥉']
  const podiumHeights = [72,   96,   56  ]
  const podiumColors = [
    'linear-gradient(180deg, rgba(192,192,192,0.22), rgba(192,192,192,0.04))', // silver
    'linear-gradient(180deg, rgba(255,215,0,0.25),   rgba(255,215,0,0.05))',   // gold
    'linear-gradient(180deg, rgba(205,127,50,0.18),  rgba(205,127,50,0.03))',  // bronze
  ]
  function podiumIdx(i: number) { return podiumOrder.length === 1 ? 1 : i }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div style={{ width: 3, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, #FBBF24, #F59E0B)' }} />
        <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: textColor, letterSpacing: '0.08em' }}>
          Winning Habits
        </h2>
      </div>

      <div className="flex items-end justify-center gap-3" style={{ minHeight: 180 }}>
        {podiumOrder.map((habit, i) => {
          const streak = habit.streak?.current_streak ?? 0
          const doneToday = habit.completions?.includes(todayStr)
          const height = podiumHeights[podiumIdx(i)] ?? 56

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
              <span className="font-bold" style={{ fontSize: 22, color: '#38BDF8', letterSpacing: '-0.02em' }}>
                {streak}<span className="font-sans text-xs font-semibold ml-0.5" style={{ color: 'rgba(56,189,248,0.65)' }}>d</span>
              </span>

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
                  background: podiumColors[podiumIdx(i)],
                  border: `1px solid ${cardBorder}`,
                  borderBottom: 'none',
                }}
              >
                <span className="text-2xl">{medals[podiumIdx(i)]}</span>
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

function NeedsAttentionSection({ habits, onToggle }: {
  habits: HabitWithStreak[]
  onToggle: (habitId: string, date: string) => void
}) {
  const todayStr = localDateStr()
  const sorted = [...habits].sort((a, b) => (a.streak?.current_streak ?? 0) - (b.streak?.current_streak ?? 0))
  const belowTwo = sorted.filter(h => (h.streak?.current_streak ?? 0) < 2)
  const struggling = belowTwo.length >= 4 ? belowTwo : sorted.slice(0, 4)

  if (struggling.length === 0) return null

  const textColor = 'var(--text-1)'
  const mutedColor = 'var(--text-2)'
  const divider = 'var(--divider)'

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div style={{ width: 3, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, #F87171, #DC2626)' }} />
        <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ color: mutedColor, letterSpacing: '0.08em' }}>
          Needs Attention
        </h2>
      </div>
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

function StreakDashboardModal({ habits, onClose }: {
  habits: HabitWithStreak[]
  onClose: () => void
}) {
  const textColor = 'var(--text-1)'
  const mutedColor = 'var(--text-2)'
  const sheetBg = 'var(--surface-alt)'
  const cardBorder = 'var(--border)'
  const barTrack = 'var(--surface-tint)'

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
   Habit Suggestions Modal — for new / zero-habit users
   ────────────────────────────────────────────────────────────────────────────── */

const HABIT_SUGGESTIONS = [
  { emoji: '💧', name: 'Drink 8 glasses of water',  cat: 'Health'  },
  { emoji: '🏃', name: 'Exercise for 30 minutes',    cat: 'Health'  },
  { emoji: '🧘', name: 'Meditate for 10 minutes',   cat: 'Mind'    },
  { emoji: '📚', name: 'Read for 20 minutes',        cat: 'Mind'    },
  { emoji: '✍️', name: 'Journal daily',              cat: 'Mind'    },
  { emoji: '😴', name: 'Sleep before midnight',      cat: 'Health'  },
  { emoji: '🍎', name: 'Eat a healthy meal',         cat: 'Health'  },
  { emoji: '📵', name: 'No phone first hour',        cat: 'Mind'    },
  { emoji: '💪', name: 'Strength training',          cat: 'Fitness' },
  { emoji: '🚶', name: 'Walk 10,000 steps',          cat: 'Fitness' },
  { emoji: '🌅', name: 'Wake up at 6 AM',            cat: 'Routine' },
  { emoji: '☀️', name: 'Morning sunlight',           cat: 'Routine' },
  { emoji: '🙏', name: 'Practice gratitude',         cat: 'Mind'    },
  { emoji: '💊', name: 'Take vitamins',              cat: 'Health'  },
  { emoji: '🌱', name: 'Learn something new',        cat: 'Growth'  },
  { emoji: '🎯', name: 'Work on a side project',     cat: 'Growth'  },
  { emoji: '📞', name: 'Call a friend or family',    cat: 'Social'  },
  { emoji: '🧹', name: 'Tidy your space',            cat: 'Routine' },
  { emoji: '🥗', name: 'No junk food',               cat: 'Health'  },
  { emoji: '🔥', name: 'Cold shower',                cat: 'Health'  },
]

function HabitSuggestionsModal({ onClose }: { onClose: () => void }) {
  const t = { bg: 'var(--surface-alt)', text: 'var(--text-1)', muted: 'var(--text-2)', card: 'var(--surface)', border: 'var(--border)' }
  const cats = [...new Set(HABIT_SUGGESTIONS.map(h => h.cat))]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="w-full max-w-md rounded-3xl p-5 overflow-y-auto"
        style={{ background: t.bg, border: `1px solid ${t.border}`, maxHeight: '80vh', boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: '#38BDF8' }}>Get started</p>
            <h2 className="text-lg font-bold" style={{ color: t.text }}>Popular habit ideas</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: t.card, color: t.muted }}>×</button>
        </div>
        <p className="text-xs mb-4" style={{ color: t.muted }}>
          Head to the Habits tab to add any of these. These are just ideas — build habits that matter to you.
        </p>
        {cats.map(cat => (
          <div key={cat} className="mb-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: t.muted }}>{cat}</p>
            <div className="grid grid-cols-2 gap-2">
              {HABIT_SUGGESTIONS.filter(h => h.cat === cat).map(h => (
                <div key={h.name} className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{ background: t.card, border: `1px solid ${t.border}` }}>
                  <span className="text-lg flex-shrink-0">{h.emoji}</span>
                  <span className="text-xs font-medium leading-tight" style={{ color: t.text }}>{h.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Dashboard
   ────────────────────────────────────────────────────────────────────────────── */

export default function Dashboard() {
  const { darkMode } = useUIStore()
  const { profile } = useAuthStore()
  const { data: habits = [], isLoading } = useHabits()
  const toggleMutation = useToggleCompletion()
  const [showStreaks, setShowStreaks] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // First name only, fallback to "friend"
  const userName = (profile?.display_name ?? '').split(' ')[0] || 'friend'

  const t = {
    bg: 'var(--bg-app)',
    text: 'var(--text-1)',
    textMuted: 'var(--text-2)',
    textSub: 'var(--text-3)',
    cardBg: 'var(--surface)',
    cardBorder: 'var(--border)',
    inputBg: 'var(--input-bg)',
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

  function handleToggle(habitId: string, date: string) {
    const habit = habits.find(h => h.id === habitId)
    if (habit) toggleMutation.mutate({ habit, date })
  }

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 76, paddingBottom: 80 }}>
      {/* Hero section — overflow-x:clip prevents horizontal scroll while allowing dolphins to arc vertically */}
      <div className="flex flex-col items-center px-4 pt-8 pb-36 relative" style={{ overflowX: 'clip' }}>
        {/* Aurora background layer — oversized by 50px to prevent translate clipping */}
        <div className="hero-aurora pointer-events-none" style={{
          position: 'absolute', top: -50, left: -50, right: -50, bottom: -50, zIndex: 0,
          background: darkMode
            ? [
                'radial-gradient(ellipse 100% 65% at 10% 20%, rgba(56,189,248,0.38) 0%, transparent 55%)',
                'radial-gradient(ellipse 80%  55% at 88% 10%, rgba(14,165,233,0.30) 0%, transparent 52%)',
                'radial-gradient(ellipse 65%  50% at 50% 90%, rgba(37,99,235,0.25) 0%, transparent 52%)',
                'radial-gradient(ellipse 55%  40% at 75% 55%, rgba(99,102,241,0.18) 0%, transparent 48%)',
                'radial-gradient(ellipse 45%  30% at 25% 65%, rgba(56,189,248,0.15) 0%, transparent 45%)',
              ].join(', ')
            : [
                'radial-gradient(ellipse 90% 55% at 15% 30%, rgba(37,99,235,0.12) 0%, transparent 55%)',
                'radial-gradient(ellipse 70% 45% at 85% 15%, rgba(147,197,253,0.14) 0%, transparent 50%)',
                'radial-gradient(ellipse 80% 60% at 55% 85%, rgba(59,130,246,0.10) 0%, transparent 50%)',
              ].join(', '),
        }} />
        <div className="dolphin-glow rounded-full p-3 mb-3" style={{ background: darkMode ? 'rgba(56,189,248,0.08)' : 'rgba(37,99,235,0.08)' }}>
          <DolphinLogo size={56} />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: t.text }}>
          Habit<span style={{ color: '#38BDF8' }}>·</span>at
        </h1>
        <div className="mb-2 px-2 text-center max-w-xs">
          <QuoteRotator intervalMs={45000} darkMode={darkMode} />
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
              zIndex: 20,
            }}
          >
            See all streaks →
          </button>
        )}

        <OceanWave darkMode={darkMode} userName={userName} />
      </div>

      {/* Content */}
      <div className="px-4 page-inner">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Habits', value: totalHabits, accent: '#38BDF8' },
                { label: 'This month', value: `${completionPct}%`, accent: '#4ADE80' },
                { label: 'Perfect days', value: perfectDays, accent: '#FBBF24' },
              ].map(({ label, value, accent }) => (
                <div key={label} className="rounded-2xl p-3 text-center glass-card">
                  <p className="text-3xl font-bold leading-none mb-1" style={{ color: accent, letterSpacing: '-0.02em' }}>{value}</p>
                  <p className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: t.textMuted }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Podium — top 3 habits with 3+ day streaks */}
            <PodiumSection habits={habits} onToggle={handleToggle} />

            {/* Needs attention — minimalistic list */}
            <NeedsAttentionSection habits={habits} onToggle={handleToggle} />

            {habits.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🐬</p>
                <p className="text-base font-semibold mb-1" style={{ color: t.text }}>Nothing tracked yet</p>
                <p className="text-sm mb-5" style={{ color: t.textMuted }}>Start building your daily rhythm.</p>
                <button
                  onClick={() => setShowSuggestions(true)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#2563EB', boxShadow: '0 2px 8px rgba(37,99,235,0.35)' }}
                >
                  See habit ideas →
                </button>
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
          />
        )}
      </AnimatePresence>

      {/* Habit suggestions for new/empty users */}
      <AnimatePresence>
        {showSuggestions && (
          <HabitSuggestionsModal
            onClose={() => setShowSuggestions(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
