import { useState } from 'react'
import { useUIStore } from '../store/uiStore'
import { localDateStr } from '../hooks/useHabits'
import type { HabitWithStreak } from '../lib/types'
import { motion, AnimatePresence } from 'framer-motion'

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
  const { darkMode } = useUIStore()
  const [expanded, setExpanded] = useState(false)

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
    expandBg: 'rgba(255,255,255,0.06)',
    expandText: 'rgba(255,255,255,0.5)',
  } : {
    text: '#0B1437',
    textSub: 'rgba(11,20,55,0.35)',
    textMuted: 'rgba(11,20,55,0.55)',
    cardBg: 'rgba(255,255,255,0.85)',
    cardBorder: 'rgba(11,20,55,0.09)',
    divider: 'rgba(11,20,55,0.07)',
    inputBg: 'rgba(11,20,55,0.05)',
    expandBg: 'rgba(11,20,55,0.05)',
    expandText: 'rgba(11,20,55,0.5)',
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
          background: isToday ? (darkMode ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.06)') : 'transparent',
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
            style={{ color: isToday ? '#93C5FD' : t.textSub, fontWeight: isToday ? 600 : 400 }}
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
          boxShadow: darkMode ? 'none' : '0 2px 12px rgba(11,20,55,0.06)',
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
                  <th key={habit.id} className="px-1 py-1.5 text-center" style={{ minWidth: 32 }}>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-[9px] leading-tight" style={{ color: t.textMuted }}>
                        {habit.emoji}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {/* Always show current week */}
            {weekDays.map(day => renderRow(day))}

            {/* Expanded: show rest of month */}
            <AnimatePresence>
              {expanded && (
                <motion.tr
                  key="expanded-rows"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'contents' }}
                >
                  {/* Render as a React fragment trick — we need multiple TRs */}
                </motion.tr>
              )}
            </AnimatePresence>
            {expanded && Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              if (weekDays.includes(day)) return null
              return renderRow(day)
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
