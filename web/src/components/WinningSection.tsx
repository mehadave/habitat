import { useUIStore } from '../store/uiStore'
import { localDateStr } from '../hooks/useHabits'
import type { HabitWithStreak } from '../lib/types'

interface Props {
  habits: HabitWithStreak[]
  onToggle: (habitId: string, date: string) => void
}

export function WinningSection({ habits, onToggle }: Props) {
  const { darkMode } = useUIStore()
  const todayStr = localDateStr()
  const winning = habits
    .filter((h) => (h.streak?.current_streak ?? 0) >= 3)
    .sort((a, b) => (b.streak?.current_streak ?? 0) - (a.streak?.current_streak ?? 0))
    .slice(0, 6)

  if (winning.length === 0) return null

  const headingColor = darkMode ? 'rgba(255,255,255,0.88)' : 'rgba(11,20,55,0.85)'
  const badgeBg = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11,20,55,0.13)'
  const badgeText = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(11,20,55,0.70)'
  const cardBg = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)'
  const cardBorder = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11,20,55,0.18)'
  const nameColor = darkMode ? 'white' : '#0B1437'
  const mutedColor = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(11,20,55,0.62)'

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-bold" style={{ color: headingColor }}>
          On fire
        </h2>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: badgeBg, color: badgeText }}
        >
          {winning.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {winning.map((habit) => {
          const streak = habit.streak?.current_streak ?? 0
          const doneToday = habit.completions?.includes(todayStr)
          return (
            <div
              key={habit.id}
              className="rounded-xl p-3"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-base flex-shrink-0">{habit.emoji || '⭐'}</span>
                <span className="text-sm font-semibold truncate flex-1" style={{ color: nameColor }}>
                  {habit.name}
                </span>
                <span
                  className="text-xs font-semibold flex-shrink-0 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(56,189,248,0.12)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.25)' }}
                >
                  {streak}d 🔥
                </span>
              </div>

              {doneToday ? (
                <p className="text-xs font-medium" style={{ color: '#38BDF8' }}>✓ Done today</p>
              ) : (
                <button
                  onClick={() => onToggle(habit.id, todayStr)}
                  className="text-xs font-medium"
                  style={{ color: mutedColor }}
                >
                  + Complete today
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
