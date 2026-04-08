import { useUIStore } from '../store/uiStore'
import type { HabitWithStreak } from '../lib/types'

interface Props {
  habits: HabitWithStreak[]
  onToggle: (habitId: string, date: string) => void
}

function MiniDotGrid({ completions, darkMode }: { completions: string[]; darkMode: boolean }) {
  const today = new Date()
  const dates: string[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }

  function getStreak(startIdx: number): number {
    let count = 0
    for (let i = startIdx; i >= 0; i--) {
      if (completions.includes(dates[i])) count++
      else break
    }
    return count
  }

  const emptyDotBg = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(11,20,55,0.1)'
  const emptyDotBorder = darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(11,20,55,0.12)'

  return (
    <div className="flex gap-1 mt-2">
      {dates.map((d, i) => {
        const done = completions.includes(d)
        const streak = done ? getStreak(i) : 0
        const onARoll = streak >= 5
        return (
          <div
            key={d}
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: done ? (onARoll ? '#93C5FD' : '#2563EB') : emptyDotBg,
              border: done ? 'none' : emptyDotBorder,
            }}
          />
        )
      })}
    </div>
  )
}

export function WinningSection({ habits, onToggle }: Props) {
  const { darkMode } = useUIStore()
  const todayStr = new Date().toISOString().split('T')[0]
  const winning = habits
    .filter((h) => (h.streak?.current_streak ?? 0) >= 3)
    .sort((a, b) => (b.streak?.current_streak ?? 0) - (a.streak?.current_streak ?? 0))
    .slice(0, 3)

  if (winning.length === 0) return null

  const cardBg = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)'
  const cardBorder = darkMode ? 'rgba(255,255,255,0.09)' : 'rgba(11,20,55,0.09)'
  const habitNameColor = darkMode ? 'white' : '#0B1437'
  const starEmptyColor = darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(11,20,55,0.2)'
  const headingColor = darkMode ? 'rgba(255,255,255,0.85)' : 'rgba(11,20,55,0.85)'
  const badgeBg = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11,20,55,0.07)'
  const badgeText = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(11,20,55,0.5)'

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-medium" style={{ color: headingColor }}>
          Winning the race
        </h2>
        <span
          className="px-2 py-0.5 rounded-full text-xs"
          style={{ background: badgeBg, color: badgeText }}
        >
          {winning.length}
        </span>
      </div>

      <div className="space-y-2">
        {winning.map((habit) => {
          const streak = habit.streak?.current_streak ?? 0
          const doneToday = habit.completions?.includes(todayStr)
          return (
            <div
              key={habit.id}
              className="rounded-2xl p-4"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{habit.emoji || '⭐'}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: habitNameColor }}>{habit.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {[1,2,3,4,5].map(n => (
                        <span key={n} style={{ fontSize: 10, color: n <= habit.star_rating ? '#60A5FA' : starEmptyColor }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(37,99,235,0.15)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.3)' }}
                  >
                    on fire · {streak} day streak
                  </span>
                </div>
              </div>
              <MiniDotGrid completions={habit.completions ?? []} darkMode={darkMode} />

              {/* Quick complete button */}
              {!doneToday && (
                <button
                  onClick={() => onToggle(habit.id, todayStr)}
                  className="mt-2 px-3 py-1 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(37,99,235,0.15)', color: '#60A5FA' }}
                >
                  + Complete today
                </button>
              )}
              {doneToday && (
                <p className="mt-2 text-xs" style={{ color: '#93C5FD' }}>✓ Done today</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
