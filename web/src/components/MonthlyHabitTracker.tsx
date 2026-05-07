import { useState } from 'react'
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

/** Get the start (Sunday) of the week containing `date`. */
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  return d
}

interface Props {
  habits: HabitWithStreak[]
  onToggle: (habitId: string, date: string) => void
}

export function MonthlyHabitTracker({ habits, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const todayStr = localDateStr()
  const daysInMonth = getDaysInMonth(year, month)

  const t = {
    text: 'var(--text-1)',
    textSub: 'var(--text-3)',
    textMuted: 'var(--text-2)',
    cardBg: 'var(--surface)',
    cardBorder: 'var(--border)',
    divider: 'var(--divider)',
    inputBg: 'var(--input-bg)',
    expandBg: 'var(--surface-tint)',
    expandText: 'var(--text-2)',
  }

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  if (habits.length === 0) return null

  // Current week: Sunday through Saturday containing today
  const weekStart = getWeekStart(now)
  const weekDays: number[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    // Only include days that belong to this month
    if (d.getMonth() === month && d.getFullYear() === year) {
      weekDays.push(d.getDate())
    }
  }

  // Completion summary for the week
  const weekCompleted = weekDays.reduce((sum, day) => {
    const ds = dateStr(day)
    if (ds > todayStr) return sum
    return sum + habits.filter(h => h.completions?.includes(ds)).length
  }, 0)
  const weekPossible = weekDays.filter(day => dateStr(day) <= todayStr).length * habits.length
  const weekPct = weekPossible > 0 ? Math.round((weekCompleted / weekPossible) * 100) : 0

  function renderRow(day: number) {
    const ds = dateStr(day)
    const dayOfWeek = new Date(year, month, day).getDay()
    const isToday = ds === todayStr
    const isFuture = ds > todayStr

    return (
      <tr
        key={day}
        style={{
          borderBottom: `1px solid ${t.divider}`,
          opacity: isFuture ? 0.35 : 1,
          background: isToday ? 'var(--today-bg)' : 'transparent',
        }}
      >
        <td className="px-2 py-1">
          <span className="text-[10px] font-medium" style={{ color: isToday ? '#60A5FA' : t.textSub }}>
            {DAY_INITIALS[dayOfWeek]}
          </span>
        </td>
        <td className="px-1 py-1">
          <span
            className="text-[10px]"
            style={{ color: isToday ? 'var(--accent-text)' : t.textSub, fontWeight: isToday ? 600 : 400 }}
          >
            {day}
          </span>
        </td>
        {habits.map((habit, hi) => {
          const color = HABIT_COLORS[hi % HABIT_COLORS.length]
          const done = habit.completions?.includes(ds)
          return (
            <td key={habit.id} className="text-center py-1 px-1">
              <button
                disabled={isFuture}
                onClick={() => !isFuture && onToggle(habit.id, ds)}
                className="inline-flex items-center justify-center"
                style={{ cursor: isFuture ? 'default' : 'pointer', width: 20, height: 20 }}
              >
                {done ? (
                  <div className="w-4 h-4 rounded-full" style={{ background: color, opacity: 0.9 }} />
                ) : isFuture ? (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.inputBg, border: `1px solid ${t.divider}` }} />
                ) : (
                  <div
                    className="w-3 h-3 rounded-full transition-all"
                    style={{
                      background: isToday ? `${color}22` : 'transparent',
                      border: `1.5px solid ${color}44`,
                    }}
                  />
                )}
              </button>
            </td>
          )
        })}
      </tr>
    )
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: t.textMuted }}>
            {expanded ? MONTH_NAMES[month] : 'This week'}
          </p>
          {!expanded && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: weekPct >= 80 ? 'rgba(74,222,128,0.15)' : weekPct >= 50 ? 'rgba(37,99,235,0.15)' : 'rgba(248,113,113,0.12)',
                color: weekPct >= 80 ? '#4ADE80' : weekPct >= 50 ? '#60A5FA' : '#F87171',
              }}>
              {weekPct}%
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium px-3 py-1 rounded-lg transition-all"
          style={{ background: t.expandBg, color: t.expandText }}
        >
          {expanded ? 'Collapse ▴' : `Full month ▾`}
        </button>
      </div>

      <div
        className="rounded-2xl overflow-x-auto no-scrollbar"
        style={{
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 'max-content' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.divider}` }}>
              <th className="text-left px-2 py-1.5" style={{ width: 48 }}>
                <span className="text-[9px] font-medium" style={{ color: t.textSub }}>Day</span>
              </th>
              <th className="text-left px-1 py-1.5" style={{ width: 22 }}>
                <span className="text-[9px] font-medium" style={{ color: t.textSub }}>#</span>
              </th>
              {habits.map((habit, hi) => {
                const color = HABIT_COLORS[hi % HABIT_COLORS.length]
                return (
                  <th key={habit.id} className="px-1 py-1.5 text-center" style={{ minWidth: 36 }}>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-base leading-none" style={{ color: t.textMuted }}>
                        {habit.emoji}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {expanded
              ? /* Full month 1 → N in strict chronological order */
                Array.from({ length: daysInMonth }).map((_, i) => renderRow(i + 1))
              : /* Collapsed: current week only */
                weekDays.map(day => renderRow(day))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
