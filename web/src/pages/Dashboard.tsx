import { useHabits, useToggleCompletion, localDateStr } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'
import { DolphinLogo } from '../components/DolphinLogo'
import { QuoteRotator } from '../components/QuoteRotator'
import { StreakHero } from '../components/StreakHero'
import { WinningSection } from '../components/WinningSection'
import { motion } from 'framer-motion'

function CSSWave({ darkMode }: { darkMode: boolean }) {
  const fill1 = darkMode ? 'rgba(56,189,248,0.08)' : 'rgba(37,99,235,0.06)'
  const fill2 = darkMode ? 'rgba(14,165,233,0.05)' : 'rgba(147,197,253,0.05)'
  const fill3 = darkMode ? 'rgba(99,102,241,0.04)' : 'rgba(37,99,235,0.03)'
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: 40 }}>
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ width: '200%', height: '100%' }}>
        <path className="wave-1" d="M0,20 C150,5 350,35 600,20 C850,5 1050,35 1200,20 L1200,40 L0,40 Z" fill={fill1} />
        <path className="wave-2" d="M0,25 C200,10 400,38 600,25 C800,10 1000,38 1200,25 L1200,40 L0,40 Z" fill={fill2} />
        <path className="wave-3" d="M0,30 C250,15 450,40 600,30 C750,15 950,40 1200,30 L1200,40 L0,40 Z" fill={fill3} />
      </svg>
    </div>
  )
}

export default function Dashboard() {

  const { darkMode } = useUIStore()
  const { data: habits = [], isLoading } = useHabits()
  const toggleMutation = useToggleCompletion()

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
    navBg: 'rgba(11,17,32,0.88)',
    navBorder: 'rgba(255,255,255,0.06)',
    sheetBg: '#0F1B45',
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
    navBg: 'rgba(240,244,255,0.92)',
    navBorder: 'rgba(11,20,55,0.1)',
    sheetBg: '#E8EFFF',
    badgeBg: 'rgba(11,20,55,0.07)',
    badgeText: 'rgba(11,20,55,0.5)',
  }

  const todayStr = localDateStr()

  // Overall streak = max current streak across habits
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak?.current_streak ?? 0), 0)
  const streakStartDate = habits.find(h => (h.streak?.current_streak ?? 0) === maxStreak)?.streak?.streak_start_date

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
      <div className="flex flex-col items-center px-4 pt-6 pb-8 relative">
        <div className="dolphin-glow rounded-full p-3 mb-3" style={{ background: darkMode ? 'rgba(56,189,248,0.08)' : 'rgba(37,99,235,0.08)' }}>
          <DolphinLogo size={56} />
        </div>
        <h1 className="text-xl font-bold mb-3" style={{ color: t.text }}>
          Habit<span style={{ color: '#38BDF8' }}>·</span>at
        </h1>
        <div className="mb-2 px-2 text-center max-w-xs">
          <QuoteRotator intervalMs={600000} darkMode={darkMode} />
        </div>
        <StreakHero streak={maxStreak} startDate={streakStartDate} darkMode={darkMode} />
        <CSSWave darkMode={darkMode} />
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
                <p className="text-xs font-semibold mb-2" style={{ color: t.textMuted }}>Quick complete</p>
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

            {/* Winning section */}
            <WinningSection habits={habits} onToggle={handleToggle} />

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
    </div>
  )
}
