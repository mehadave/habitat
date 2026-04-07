import type { HabitWithStreak } from '../lib/types'

interface Props {
  habits: HabitWithStreak[]
  onToggle: (habitId: string, date: string) => void
}

function MiniDotGrid({ completions }: { completions: string[] }) {
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
              background: done ? (onARoll ? '#93C5FD' : '#2563EB') : 'rgba(255,255,255,0.07)',
              border: done ? 'none' : '1px solid rgba(255,255,255,0.12)',
            }}
          />
        )
      })}
    </div>
  )
}

export function WinningSection({ habits, onToggle }: Props) {
  const todayStr = new Date().toISOString().split('T')[0]
  const winning = habits
    .filter((h) => (h.streak?.current_streak ?? 0) >= 3)
    .sort((a, b) => (b.streak?.current_streak ?? 0) - (a.streak?.current_streak ?? 0))
    .slice(0, 3)

  if (winning.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Winning the race
        </h2>
        <span
          className="px-2 py-0.5 rounded-full text-xs"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
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
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{habit.emoji || '⭐'}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{habit.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {[1,2,3,4,5].map(n => (
                        <span key={n} style={{ fontSize: 10, color: n <= habit.star_rating ? '#60A5FA' : 'rgba(255,255,255,0.2)' }}>★</span>
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
              <MiniDotGrid completions={habit.completions ?? []} />

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
