import { useHabits, useToggleCompletion } from '../hooks/useHabits'
import { useAuthStore } from '../store/authStore'
import { DolphinLogo } from '../components/DolphinLogo'
import { QuoteRotator } from '../components/QuoteRotator'
import { StreakHero } from '../components/StreakHero'
import { XPBar } from '../components/XPBar'
import { WinningSection } from '../components/WinningSection'
import { LosingSection } from '../components/LosingSection'
import { getLevelName, getLevelFromXP, getXPProgressInLevel } from '../lib/gamification'
import { motion } from 'framer-motion'

function CSSWave() {
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: 40 }}>
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ width: '200%', height: '100%' }}>
        <path
          className="wave-1"
          d="M0,20 C150,5 350,35 600,20 C850,5 1050,35 1200,20 L1200,40 L0,40 Z"
          fill="rgba(37,99,235,0.08)"
        />
        <path
          className="wave-2"
          d="M0,25 C200,10 400,38 600,25 C800,10 1000,38 1200,25 L1200,40 L0,40 Z"
          fill="rgba(147,197,253,0.05)"
        />
        <path
          className="wave-3"
          d="M0,30 C250,15 450,40 600,30 C750,15 950,40 1200,30 L1200,40 L0,40 Z"
          fill="rgba(37,99,235,0.04)"
        />
      </svg>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuthStore()
  const { data: habits = [], isLoading } = useHabits()
  const toggleMutation = useToggleCompletion()

  const todayStr = new Date().toISOString().split('T')[0]

  const totalXP = profile?.total_xp ?? 0
  const level = getLevelFromXP(totalXP)
  const levelName = getLevelName(level)
  const xpProgress = getXPProgressInLevel(totalXP)

  // Overall streak = max current streak across habits
  const maxStreak = habits.reduce(
    (max, h) => Math.max(max, h.streak?.current_streak ?? 0),
    0
  )
  const streakStartDate = habits.find(h => (h.streak?.current_streak ?? 0) === maxStreak)
    ?.streak?.streak_start_date

  // Stats
  const totalHabits = habits.length
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const monthStart = thisMonth.toISOString().split('T')[0]

  const daysInMonth = new Date().getDate()
  const completedThisMonth = habits.reduce((sum, h) => {
    return sum + (h.completions?.filter(d => d >= monthStart).length ?? 0)
  }, 0)
  const possibleThisMonth = totalHabits * daysInMonth
  const completionPct = possibleThisMonth > 0
    ? Math.round((completedThisMonth / possibleThisMonth) * 100)
    : 0

  const perfectDays = (() => {
    const days: Record<string, number> = {}
    habits.forEach(h => {
      h.completions?.filter(d => d >= monthStart).forEach(d => {
        days[d] = (days[d] ?? 0) + 1
      })
    })
    return Object.values(days).filter(c => c >= totalHabits && totalHabits > 0).length
  })()

  // Quick complete chips
  const quickHabits = habits.filter(h => !h.completions?.includes(todayStr)).slice(0, 8)

  function handleToggle(habitId: string, date: string) {
    const habit = habits.find(h => h.id === habitId)
    if (habit) toggleMutation.mutate({ habit, date })
  }

  return (
    <div className="min-h-screen" style={{ background: '#0B1437', paddingTop: 60, paddingBottom: 80 }}>
      {/* Sticky Hero */}
      <div
        className="sticky top-[60px] z-10"
        style={{ background: '#0B1437' }}
      >
        <div className="flex flex-col items-center px-4 pt-6 pb-10 relative">
          {/* Dolphin with glow */}
          <div className="dolphin-glow rounded-full p-3 mb-3" style={{ background: 'rgba(37,99,235,0.08)' }}>
            <DolphinLogo size={56} />
          </div>

          {/* Wordmark */}
          <h1 className="text-lg font-medium text-white mb-3">
            Habit<span style={{ color: '#93C5FD' }}>·</span>at
          </h1>

          {/* Quote */}
          <div className="mb-4 px-2 text-center max-w-xs">
            <QuoteRotator intervalMs={600000} />
          </div>

          {/* Streak hero */}
          <StreakHero streak={maxStreak} startDate={streakStartDate} />

          {/* XP Bar */}
          <div className="w-full max-w-xs px-2 mt-2">
            <XPBar current={xpProgress.current} max={xpProgress.max} level={level} levelName={levelName} />
          </div>

          <CSSWave />
        </div>
      </div>

      {/* Scroll sheet */}
      <div
        className="relative z-20 min-h-screen scroll-sheet"
        style={{
          background: '#0B1437',
          borderRadius: '24px 24px 0 0',
          marginTop: -24,
          padding: '24px 16px 0',
        }}
      >
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
                <div
                  key={label}
                  className="rounded-2xl p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  <p className="text-lg font-medium text-white">{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Quick complete chips */}
            {quickHabits.length > 0 && (
              <div className="mb-6">
                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Quick complete
                </p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {quickHabits.map((h) => (
                    <motion.button
                      key={h.id}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleToggle(h.id, todayStr)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium flex-shrink-0"
                      style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', color: '#93C5FD' }}
                    >
                      <span>{h.emoji}</span>
                      <span>{h.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Winning section */}
            <WinningSection habits={habits} onToggle={handleToggle} />

            {/* Losing section */}
            <LosingSection habits={habits} onToggle={handleToggle} />

            {/* Empty state */}
            {habits.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🐬</p>
                <p className="text-sm font-medium text-white mb-1">No habits yet?</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Your pod is waiting.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
