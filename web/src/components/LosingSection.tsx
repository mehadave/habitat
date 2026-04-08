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

  return (
    <div className="flex gap-1 mt-2">
      {dates.map((d) => {
        const done = completions.includes(d)
        return (
          <div
            key={d}
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: done ? '#2563EB' : 'rgba(248,113,113,0.18)',
              border: done ? 'none' : '1px solid rgba(248,113,113,0.25)',
            }}
          />
        )
      })}
    </div>
  )
}

export function LosingSection({ habits, onToggle }: Props) {
  const { darkMode } = useUIStore()
  const todayStr = new Date().toISOString().split('T')[0]
  const losing = habits
    .filter((h) => (h.streak?.current_streak ?? 0) < 3)
    .sort((a, b) => (a.streak?.current_streak ?? 0) - (b.streak?.current_streak ?? 0))
    .slice(0, 3)

  if (losing.length === 0) return null

  const habitNameColor = darkMode ? 'white' : '#0B1437'
  const starEmptyColor = darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(11,20,55,0.25)'
  const headingColor = darkMode ? 'rgba(255,255,255,0.85)' : 'rgba(11,20,55,0.85)'
  const badgeBg = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11,20,55,0.07)'
  const badgeText = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(11,20,55,0.5)'
  const needsYouColor = darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(11,20,55,0.35)'

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-medium" style={{ color: headingColor }}>
          Needs attention
        </h2>
        <span
          className="px-2 py-0.5 rounded-full text-xs"
          style={{ background: badgeBg, color: badgeText }}
        >
          {losing.length}
        </span>
      </div>

      <div className="space-y-2">
        {losing.map((habit) => {
          const streak = habit.streak?.current_streak ?? 0
          const doneToday = habit.completions?.includes(todayStr)
          return (
            <div
              key={habit.id}
              className="rounded-2xl p-4"
              style={{
                background: 'rgba(248,113,113,0.04)',
                border: '1px solid rgba(248,113,113,0.15)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{habit.emoji || '⭐'}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: habitNameColor }}>{habit.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {[1,2,3,4,5].map(n => (
                        <span key={n} style={{ fontSize: 10, color: starEmptyColor }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(248,113,113,0.10)', color: '#F87171', border: '1px solid rgba(248,113,113,0.20)' }}
                >
                  slipping · only {streak} day{streak !== 1 ? 's' : ''}
                </span>
              </div>
              <MiniDotGrid completions={habit.completions ?? []} darkMode={darkMode} />
              <p className="text-xs mt-2" style={{ color: needsYouColor }}>
                This one needs you today.
              </p>

              {!doneToday && (
                <button
                  onClick={() => onToggle(habit.id, todayStr)}
                  className="mt-2 px-3 py-1 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171' }}
                >
                  + Do it now
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
