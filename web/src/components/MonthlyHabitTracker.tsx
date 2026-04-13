import { useUIStore } from '../store/uiStore'
import { localDateStr } from '../hooks/useHabits'
import type { HabitWithStreak } from '../lib/types'

const HABIT_COLORS = [
  '#F87171','#FB923C','#FBBF24','#4ADE80','#22D3EE',
  '#60A5FA','#A78BFA','#F472B6','#34D399','#818CF8',
]

const DAY_INITIALS = ['S','M','T','W','T','F','S']

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

interface Props {
  habits: HabitWithStreak[]
  onToggle: (habitId: string, date: string) => void
}

export function MonthlyHabitTracker({ habits, onToggle }: Props) {
  const { darkMode } = useUIStore()

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const todayStr = localDateStr()
  const daysInMonth = getDaysInMonth(year, month)

  const t = darkMode ? {
    text: '#ffffff',
    textSub: 'rgba(255,255,255,0.3)',
    textMuted: 'rgba(255,255,255,0.45)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.09)',
    divider: 'rgba(255,255,255,0.07)',
    inputBg: 'rgba(255,255,255,0.07)',
  } : {
    text: '#0B1437',
    textSub: 'rgba(11,20,55,0.35)',
    textMuted: 'rgba(11,20,55,0.55)',
    cardBg: 'rgba(255,255,255,0.85)',
    cardBorder: 'rgba(11,20,55,0.09)',
    divider: 'rgba(11,20,55,0.07)',
    inputBg: 'rgba(11,20,55,0.05)',
  }

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  if (habits.length === 0) return null

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: t.textMuted }}>
          {MONTH_NAMES[month]}
        </p>
        <p className="text-xs" style={{ color: t.textSub }}>Tap a dot to log</p>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          boxShadow: darkMode ? 'none' : '0 2px 12px rgba(11,20,55,0.06)',
        }}
      >
        {/* Header row: habit label + day columns */}
        <div className="flex border-b" style={{ borderColor: t.divider }}>
          <div className="w-24 flex-shrink-0 px-3 py-2" />
          <div className="flex flex-1 overflow-x-auto no-scrollbar">
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const ds = dateStr(day)
              const dayOfWeek = new Date(year, month, day).getDay()
              const isToday = ds === todayStr
              return (
                <div
                  key={day}
                  className="flex-shrink-0 w-7 flex flex-col items-center justify-center py-1.5 gap-0.5"
                >
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: isToday ? '#60A5FA' : t.textSub }}
                  >
                    {DAY_INITIALS[dayOfWeek]}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: isToday ? '#93C5FD' : t.textSub, fontWeight: isToday ? 600 : 400 }}
                  >
                    {day}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Habit rows */}
        {habits.map((habit, hi) => {
          const color = HABIT_COLORS[hi % HABIT_COLORS.length]
          return (
            <div
              key={habit.id}
              className="flex border-b last:border-b-0"
              style={{ borderColor: t.divider }}
            >
              {/* Habit label */}
              <div className="w-24 flex-shrink-0 flex items-center gap-1.5 px-3 py-2">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <span
                  className="text-[11px] truncate"
                  style={{ color: t.text }}
                >
                  {habit.emoji} {habit.name}
                </span>
              </div>

              {/* Day cells */}
              <div className="flex flex-1 overflow-x-auto no-scrollbar">
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const ds = dateStr(day)
                  const done = habit.completions?.includes(ds)
                  const isFuture = ds > todayStr
                  const isToday = ds === todayStr

                  return (
                    <button
                      key={day}
                      disabled={isFuture}
                      onClick={() => !isFuture && onToggle(habit.id, ds)}
                      className="flex-shrink-0 w-7 flex items-center justify-center py-2"
                      style={{ cursor: isFuture ? 'default' : 'pointer' }}
                    >
                      {done ? (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ background: color, opacity: 0.9 }}
                        />
                      ) : isFuture ? (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: t.inputBg, border: `1px solid ${t.divider}` }}
                        />
                      ) : (
                        <div
                          className="w-3 h-3 rounded-full transition-all"
                          style={{
                            background: isToday ? `${color}22` : 'transparent',
                            border: `1.5px solid ${color}55`,
                          }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
