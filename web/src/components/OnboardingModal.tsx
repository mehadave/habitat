import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DolphinLogo } from './DolphinLogo'

const STORAGE_KEY = 'habitat-onboarding-complete'

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function markOnboardingComplete() {
  localStorage.setItem(STORAGE_KEY, 'true')
}

interface Step {
  icon: string
  title: string
  body: string
  tip: string
}

const STEPS: Step[] = [
  {
    icon: '✅',
    title: 'Track tiny habits',
    body: "Add up to 15 habits that matter to you — from drinking water to reading 10 pages. Tap to check them off each day.",
    tip: 'Start with just 2 or 3 habits. Consistency beats quantity.',
  },
  {
    icon: '🔥',
    title: 'Build streaks that stick',
    body: 'Every checked-off day extends your streak. Miss a day and it resets — so make showing up non-negotiable.',
    tip: 'Your longest streak is saved forever. Beat your own record.',
  },
  {
    icon: '📓',
    title: 'Reflect in your journal',
    body: 'No filter, no judgment. Dump your thoughts, log your mood, and watch patterns emerge over time.',
    tip: 'Entries are private and searchable — future you will thank present you.',
  },
]

interface Props {
  onClose: () => void
}

export function OnboardingModal({ onClose }: Props) {
  const [step, setStep] = useState(0)

  const t = {
    sheetBg: 'var(--surface-alt)',
    cardBorder: 'var(--border)',
    text: 'var(--text-1)',
    textMuted: 'var(--text-2)',
    textSub: 'var(--text-3)',
    tipBg: 'rgba(56,189,248,0.08)',
    tipBorder: 'rgba(56,189,248,0.18)',
    dotInactive: 'var(--border)',
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function next() {
    if (isLast) {
      markOnboardingComplete()
      onClose()
    } else {
      setStep(s => s + 1)
    }
  }

  function skip() {
    markOnboardingComplete()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="w-full max-w-sm rounded-3xl p-6 relative"
        style={{
          background: t.sheetBg,
          border: `1px solid ${t.cardBorder}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Skip button */}
        <button
          onClick={skip}
          className="absolute top-4 right-4 text-xs font-medium transition-colors"
          style={{ color: t.textSub }}
        >
          Skip
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="dolphin-glow rounded-full p-2" style={{ background: 'rgba(56,189,248,0.08)' }}>
            <DolphinLogo size={44} />
          </div>
        </div>

        <p className="text-center text-xs uppercase tracking-widest font-semibold mb-1"
          style={{ color: '#38BDF8' }}>
          Welcome to Habit<span style={{ color: t.textSub }}>·</span>at
        </p>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
            className="text-center"
          >
            <div className="text-5xl my-5">{current.icon}</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: t.text }}>
              {current.title}
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: t.textMuted }}>
              {current.body}
            </p>
            <div
              className="text-xs rounded-xl px-3 py-2 mb-1"
              style={{ background: t.tipBg, border: `1px solid ${t.tipBorder}`, color: '#38BDF8' }}
            >
              💡 {current.tip}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-5 mb-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                background: i === step ? '#38BDF8' : t.dotInactive,
              }}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: 'transparent',
                color: t.textMuted,
                border: `1px solid ${t.cardBorder}`,
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
            style={{
              background: '#2563EB',
              boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
            }}
          >
            {isLast ? "Let's go 🐬" : 'Next'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
