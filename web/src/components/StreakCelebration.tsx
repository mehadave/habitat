import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamificationStore } from '../store/gamificationStore'

const CONFETTI_COLORS = [
  '#FBBF24', '#F472B6', '#34D399', '#60A5FA', '#A78BFA',
  '#FB923C', '#ffffff', '#93C5FD', '#6EE7B7', '#FDE68A',
]

function Particle({ color, x, delay, shape }: { color: string; x: number; delay: number; shape: 'rect' | 'circle' }) {
  return (
    <motion.div
      className="absolute top-0"
      style={{
        left: `${x}%`,
        background: color,
        width: shape === 'circle' ? 8 : 6,
        height: shape === 'circle' ? 8 : 10,
        borderRadius: shape === 'circle' ? '50%' : 2,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ y: '110vh', opacity: 0, rotate: 540, scale: 0.5 }}
      transition={{ duration: 2.5 + Math.random() * 2, delay, ease: 'easeIn' }}
    />
  )
}

function getMilestoneConfig(days: number): {
  emoji: string
  title: string
  sub: string
  wit: string
} {
  if (days >= 365 && days % 365 === 0) {
    const years = days / 365
    return {
      emoji: '👑',
      title: `${years === 1 ? 'One whole year' : `${years} years`}!`,
      sub: `${days}-day streak`,
      wit: "This isn't a habit anymore. It's your personality.",
    }
  }
  if (days >= 100 && days % 100 === 0) return {
    emoji: '💎',
    title: `${days} days!`,
    sub: `${days}-day streak`,
    wit: "You're statistically rare. Like, top 0.1% rare.",
  }
  const map: Record<number, { emoji: string; title: string; sub: string; wit: string }> = {
    7: {
      emoji: '🏅',
      title: '7 days!',
      sub: '7-day streak',
      wit: "You've officially outlasted most New Year's resolutions.",
    },
    10: {
      emoji: '🔥',
      title: '10 days!',
      sub: '10-day streak',
      wit: "Double digits. Statistically, you're now a habit.",
    },
    15: {
      emoji: '⚡',
      title: '15 days!',
      sub: '15-day streak',
      wit: "Half a month in. The version of you that quits? Gone.",
    },
    21: {
      emoji: '🧠',
      title: '21 days!',
      sub: '21-day streak',
      wit: "They say 21 days forms a habit. You just became one.",
    },
    30: {
      emoji: '🌊',
      title: '30 days!',
      sub: '30-day streak',
      wit: "A whole month. Your future self is taking notes.",
    },
    50: {
      emoji: '💪',
      title: '50 days!',
      sub: '50-day streak',
      wit: "50 days in. That's not discipline anymore — that's identity.",
    },
    60: {
      emoji: '🌙',
      title: '60 days!',
      sub: '60-day streak',
      wit: "Two months strong. The streak has a personality now.",
    },
  }
  return map[days] ?? {
    emoji: '🏅',
    title: `${days} days!`,
    sub: `${days}-day streak`,
    wit: "Keep stacking.",
  }
}

export function StreakCelebration() {
  const { celebration, dismissCelebration } = useGamificationStore()
  const [particles] = useState(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      x: Math.random() * 100,
      delay: Math.random() * 1.8,
      shape: (i % 3 === 0 ? 'circle' : 'rect') as 'rect' | 'circle',
    }))
  )

  useEffect(() => {
    if (!celebration) return
    const t = setTimeout(dismissCelebration, 6000)
    return () => clearTimeout(t)
  }, [celebration])

  const config = celebration ? getMilestoneConfig(celebration.days) : null

  return (
    <AnimatePresence>
      {celebration && config && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(6,8,24,0.96)', backdropFilter: 'blur(4px)' }}
          onClick={dismissCelebration}
        >
          {/* Confetti */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <Particle key={p.id} color={p.color} x={p.x} delay={p.delay} shape={p.shape} />
            ))}
          </div>

          {/* Card */}
          <motion.div
            initial={{ scale: 0.5, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className="relative text-center px-8 py-10 rounded-3xl mx-4"
            style={{
              background: 'linear-gradient(145deg, #0B1030 0%, #0E1640 60%, #0A122E 100%)',
              border: '1px solid rgba(148,163,220,0.22)',
              boxShadow: '0 0 60px rgba(37,99,235,0.18), 0 24px 64px rgba(0,0,0,0.5)',
              maxWidth: 340,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle inner glow */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 24, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(56,189,248,0.07) 0%, transparent 70%)',
            }} />

            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {config.emoji}
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-1">
              Wohoooo!
            </h2>
            <p className="text-base font-semibold mb-1" style={{ color: '#93C5FD' }}>
              {config.sub}
            </p>

            {/* Habit badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
              style={{ background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(96,165,250,0.3)' }}>
              <span className="text-sm">{celebration.habitEmoji}</span>
              <span className="text-xs font-semibold" style={{ color: '#93C5FD' }}>{celebration.habitName}</span>
            </div>

            <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Absolute main character energy.
            </p>
            <p className="text-xs italic mb-6" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {config.wit}
            </p>

            <button
              onClick={dismissCelebration}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
              }}
            >
              Keep going 🌊
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
