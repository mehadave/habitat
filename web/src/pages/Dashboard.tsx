import { useState } from 'react'
import { useHabits, useToggleCompletion, localDateStr } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'
import { DolphinLogo } from '../components/DolphinLogo'
import { QuoteRotator } from '../components/QuoteRotator'
import { StreakHero } from '../components/StreakHero'
import { motion, AnimatePresence } from 'framer-motion'
import type { HabitWithStreak } from '../lib/types'

/* ──────────────────────────────────────────────────────────────────────────────
   Water-droplet ring with a mini snowflake bullseye target in the center.
   The outer ring looks like a glassy water hoop with drips hanging from the
   bottom arc. The inner snowflake is the "target" the dolphins aim for.
   Rendered with CSS 3D perspective so it faces slightly left-front.
   ────────────────────────────────────────────────────────────────────────────── */
function WaterRing() {
  const CX = 60, CY = 62, R = 44

  // Drip positions — angles measured clockwise from top (180 = directly below)
  // Spread across the lower half of the ring
  const drips = [
    { angle: 165, stem: 10, r: 2.2 },
    { angle: 195, stem: 15, r: 3.0 },
    { angle: 220, stem: 20, r: 3.8 },
    { angle: 250, stem: 24, r: 4.5 },
    { angle: 270, stem: 26, r: 5.0 },
    { angle: 290, stem: 24, r: 4.5 },
    { angle: 318, stem: 19, r: 3.6 },
    { angle: 342, stem: 13, r: 2.5 },
    { angle: 358, stem:  9, r: 1.8 },
  ]

  // Small 6-arm snowflake in center — "target" the dolphin aims through
  const flakeArms = [0, 60, 120, 180, 240, 300]
  const FR = 14 // flake arm radius

  // Ring point from angle (clockwise-from-top convention)
  function ringPt(angleDeg: number) {
    const a = (angleDeg - 90) * (Math.PI / 180)
    return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a), cos: Math.cos(a), sin: Math.sin(a) }
  }

  return (
    <svg viewBox="0 0 120 160" width={92} height={123} fill="none">
      <defs>
        <linearGradient id="wring-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#bae6fd" stopOpacity="0.95" />
          <stop offset="50%"  stopColor="#38bdf8" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.80" />
        </linearGradient>
        <radialGradient id="drop-grad" cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#e0f2fe" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.82" />
        </radialGradient>
        <filter id="wring-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="drop-glow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="1.6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Outer halo ── */}
      <circle cx={CX} cy={CY} r={R + 9} stroke="#38bdf8" strokeWidth="1.2"
        opacity="0.18" />

      {/* ── Main glassy water ring ── */}
      <circle cx={CX} cy={CY} r={R} stroke="url(#wring-grad)" strokeWidth="6"
        fill="rgba(14,165,233,0.05)" filter="url(#wring-glow)" />

      {/* ── Inner shimmer ring — makes it look thick/glassy ── */}
      <circle cx={CX} cy={CY} r={R - 3} stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.5" fill="none" strokeDasharray="6 5" />

      {/* ── Top-arc highlight — glassy sheen ── */}
      <path
        d={`M ${CX - R * 0.72} ${CY - R * 0.68}
            A ${R} ${R} 0 0 1 ${CX + R * 0.72} ${CY - R * 0.68}`}
        stroke="rgba(255,255,255,0.45)" strokeWidth="2.2" strokeLinecap="round" fill="none"
      />

      {/* ── Water drips hanging from the bottom arc ── */}
      {drips.map((d, i) => {
        const p = ringPt(d.angle)
        // Drip direction: 65 % gravity (down) + 35 % outward from center
        const gx = 0, gy = 1          // straight down
        const ox = p.cos, oy = p.sin  // outward from center
        const dx = gx * 0.65 + ox * 0.35
        const dy = gy * 0.65 + oy * 0.35
        const len = Math.sqrt(dx * dx + dy * dy)
        const nx = dx / len, ny = dy / len
        const tx = p.x + nx * d.stem
        const ty = p.y + ny * d.stem
        const dropX = p.x + nx * (d.stem + d.r * 1.35)
        const dropY = p.y + ny * (d.stem + d.r * 1.35)
        return (
          <g key={i} filter="url(#drop-glow)">
            <line x1={p.x} y1={p.y} x2={tx} y2={ty}
              stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" opacity="0.72" />
            <ellipse cx={dropX} cy={dropY} rx={d.r * 0.85} ry={d.r}
              fill="url(#drop-grad)" />
          </g>
        )
      })}

      {/* ── Center mini snowflake (the "target") ── */}
      {flakeArms.map((deg, i) => {
        const rad = (deg - 90) * (Math.PI / 180)
        const ex = CX + FR * Math.cos(rad), ey = CY + FR * Math.sin(rad)
        // Small crossbar at 58 % of arm
        const bx = CX + FR * 0.58 * Math.cos(rad), by = CY + FR * 0.58 * Math.sin(rad)
        const pr = rad + Math.PI / 2
        const bl = 4.5
        return (
          <g key={i}>
            <line x1={CX} y1={CY} x2={ex} y2={ey}
              stroke="#bae6fd" strokeWidth="1.6" strokeLinecap="round" opacity="0.92" />
            <line x1={bx - bl * Math.cos(pr)} y1={by - bl * Math.sin(pr)}
              x2={bx + bl * Math.cos(pr)} y2={by + bl * Math.sin(pr)}
              stroke="#bae6fd" strokeWidth="1" strokeLinecap="round" opacity="0.72" />
            <circle cx={ex} cy={ey} r="1.3" fill="#e0f2fe" opacity="0.9" />
          </g>
        )
      })}

      {/* Center gem */}
      <circle cx={CX} cy={CY} r="4" fill="#e0f2fe" opacity="0.88" filter="url(#drop-glow)" />

      {/* Tiny scatter bubbles near ring */}
      <circle cx={CX - R - 7} cy={CY - 12} r="1.6" fill="#7dd3fc" opacity="0.45" />
      <circle cx={CX + R + 6} cy={CY +  8} r="1.1" fill="#7dd3fc" opacity="0.38" />
      <circle cx={CX -  8}    cy={CY - R - 8} r="1.3" fill="#bae6fd" opacity="0.55" />
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

function OceanWave({ darkMode }: { darkMode: boolean }) {
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
      {/* ── Water-drip ring with snowflake target ──
          CSS 3D: perspective(420px) rotateY(42deg) → opening faces left-front,
          slightly more toward the left so dolphins visually swim through it.
          rotateX(-10deg) → small upward tilt for depth.
          Ring SVG is 92×123 px → centre it at left: calc(76% - 46px).
          bottom: 46 px keeps it above the wave tops and well below any text.
      ── */}
      <div style={{
        position: 'absolute',
        left: 'calc(76% - 46px)',
        bottom: 44,
        zIndex: 3,
        transform: 'perspective(420px) rotateY(42deg) rotateX(-10deg)',
        transformOrigin: 'center center',
        filter: 'drop-shadow(0 0 16px rgba(14,165,233,0.65)) drop-shadow(0 0 5px rgba(186,230,253,0.45))',
      }}>
        <WaterRing />
      </div>

      {/* ── Blue dolphin — swims left → right ── */}
      <div
        className="dolphin-swim-blue"
        style={{ position: 'absolute', bottom: 62, left: 0, zIndex: 4 }}
      >
        <SwimDolphin color="blue" />
      </div>

      {/* ── Pink dolphin — offset -6.5 s ── */}
      <div
        className="dolphin-swim-pink"
        style={{ position: 'absolute', bottom: 62, left: 0, zIndex: 4 }}
      >
        <SwimDolphin color="pink" />
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
