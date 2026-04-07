import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamificationStore } from '../store/gamificationStore'

const COLORS = ['#2563EB', '#93C5FD', '#60A5FA', '#ffffff', '#dbeafe']

function Particle({ color, x, delay }: { color: string; x: number; delay: number }) {
  return (
    <motion.div
      className="absolute top-0 w-2 h-2 rounded-sm"
      style={{ left: `${x}%`, background: color }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: '110vh', opacity: 0, rotate: 720 }}
      transition={{ duration: 3 + Math.random() * 2, delay, ease: 'easeIn' }}
    />
  )
}

export function StreakCelebration() {
  const { celebration, dismissCelebration } = useGamificationStore()
  const [particles] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
    }))
  )

  useEffect(() => {
    if (!celebration) return
    const t = setTimeout(dismissCelebration, 5000)
    return () => clearTimeout(t)
  }, [celebration])

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(11,20,55,0.95)' }}
          onClick={dismissCelebration}
        >
          {/* Confetti — blues + white only */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <Particle key={p.id} color={p.color} x={p.x} delay={p.delay} />
            ))}
          </div>

          {/* Badge */}
          <motion.div
            initial={{ scale: 0.5, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className="relative text-center px-8 py-10 rounded-3xl"
            style={{ background: 'rgba(15,27,69,0.9)', border: '1px solid rgba(147,197,253,0.3)', maxWidth: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">🏅</div>
            <h2 className="text-3xl font-medium text-white mb-2">
              {celebration.days} days!
            </h2>
            <p className="text-base mb-1" style={{ color: '#93C5FD' }}>
              {celebration.days}-day streak
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Full send. Absolute main character energy.
            </p>
            <button
              onClick={dismissCelebration}
              className="mt-6 px-6 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: '#2563EB' }}
            >
              Keep going 🌊
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
