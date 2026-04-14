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
    .slice(0, 4)

  if (winning.length === 0) return null

  const headingColor = darkMode ? 'rgba(255,255,255,0.85)' : 'rgba(11,20,55,0.85)'
  const badgeBg = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11,20,55,0.07)'
  const badgeText = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(11,20,55,0.5)'
  const cardBg = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)'
  const cardBorder = darkMode ? 'rgba(255,255,255,0.09)' : 'rgba(11,20,55,0.09)'
  const nameColor = darkMode ? 'white' : '#0B1437'
  const mutedColor = darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(11,20,55,0.4)'

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-sm font-medium" style={{ color: headingColor }}>
          On fire
        </h2>
        <span
          className="px-2 py-0.5 rounded-full text-xs"
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
              {/* Line 1: emoji + name + streak */}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm flex-shrink-0">{habit.emoji || '⭐'}</span>
                <span className="text-xs font-medium truncate flex-1" style={{ color: nameColor }}>
                  {habit.name}
                </span>
                <span
                  className="text-[10px] font-medium flex-shrink-0 px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(37,99,235,0.15)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.3)' }}
                >
                  {streak}d 🔥
                </span>
              </div>

              {/* Line 2: action */}
              {doneToday ? (
                <p className="text-[10px]" style={{ color: '#93C5FD' }}>✓ Done today</p>
              ) : (
                <button
                  onClick={() => onToggle(habit.id, todayStr)}
                  className="text-[10px] font-medium"
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
