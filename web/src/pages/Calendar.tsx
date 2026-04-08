import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import { localDateStr } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'

const HABIT_COLORS = [
  '#F87171','#FB923C','#FBBF24','#4ADE80','#22D3EE',
  '#60A5FA','#A78BFA','#F472B6','#34D399','#818CF8',
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function Calendar() {
  const { data: habits = [] } = useHabits()
  const { darkMode } = useUIStore()
  const todayStr = localDateStr()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const t = darkMode ? {
    bg: '#0B1437',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.45)',
    textSub: 'rgba(255,255,255,0.3)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.09)',
    inputBg: 'rgba(255,255,255,0.07)',
    inputBorder: '1px solid rgba(255,255,255,0.12)',
    inputColor: '#fff',
    divider: 'rgba(255,255,255,0.1)',
    navBg: 'rgba(11,20,55,0.85)',
    navBorder: 'rgba(255,255,255,0.06)',
    sheetBg: '#0F1B45',
    badgeBg: 'rgba(255,255,255,0.08)',
    badgeText: 'rgba(255,255,255,0.5)',
  } : {
    bg: '#EFF4FF',
    text: '#0B1437',
    textMuted: 'rgba(11,20,55,0.55)',
    textSub: 'rgba(11,20,55,0.35)',
    cardBg: 'rgba(255,255,255,0.75)',
    cardBorder: 'rgba(11,20,55,0.09)',
    inputBg: 'rgba(11,20,55,0.05)',
    inputBorder: '1px solid rgba(11,20,55,0.15)',
    inputColor: '#0B1437',
    divider: 'rgba(11,20,55,0.12)',
    navBg: 'rgba(239,244,255,0.92)',
    navBorder: 'rgba(11,20,55,0.1)',
    sheetBg: '#E8EFFF',
    badgeBg: 'rgba(11,20,55,0.07)',
    badgeText: 'rgba(11,20,55,0.5)',
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function getCompletedHabitsForDate(d: string) {
    return habits.filter(h => h.completions?.includes(d))
  }

  function isPerfectDay(d: string) {
    if (habits.length === 0) return false
    return habits.every(h => h.completions?.includes(d))
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    // Don't go past current month
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    if (year === currentYear && month === currentMonth) return
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const monthNames = ['January','February','March','April','May','June',
    'July','August','September','October','November','December']

  // 90-day heatmap
  const heatmapCells: { date: string; count: number }[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = localDateStr(d)
    heatmapCells.push({ date: ds, count: habits.filter(h => h.completions?.includes(ds)).length })
  }
  const maxCount = Math.max(...heatmapCells.map(c => c.count), 1)

  function heatmapColor(count: number): string {
    if (count === 0) return darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(11,20,55,0.06)'
    const ratio = count / maxCount
    if (ratio < 0.33) return '#1e3a8a'
    if (ratio < 0.66) return '#2563EB'
    return '#93C5FD'
  }

  const selectedCompletions = selectedDate ? getCompletedHabitsForDate(selectedDate) : []

  const isNextDisabled = year === now.getFullYear() && month === now.getMonth()

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <div className="px-4 pt-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-xl"
            style={{ background: t.inputBg, color: t.text }}>‹</button>
          <h2 className="text-base font-medium" style={{ color: t.text }}>{monthNames[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-xl"
            style={{
              background: t.inputBg,
              color: isNextDisabled ? t.textSub : t.text,
            }}
            disabled={isNextDisabled}>›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-xs py-1" style={{ color: t.textSub }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const ds = dateStr(day)
            const completedHabits = getCompletedHabitsForDate(ds)
            const perfect = isPerfectDay(ds)
            const isToday = ds === todayStr
            const isFuture = ds > todayStr
            const isSelected = ds === selectedDate

            return (
              <button
                key={day}
                onClick={() => !isFuture && setSelectedDate(ds === selectedDate ? null : ds)}
                disabled={isFuture}
                className="flex flex-col items-center py-2 rounded-xl relative"
                style={{
                  background: isSelected ? 'rgba(37,99,235,0.3)' : isToday ? 'rgba(37,99,235,0.15)' : t.cardBg,
                  border: perfect ? '1px solid #FBBF24' : isToday ? '1px solid rgba(37,99,235,0.5)' : '1px solid transparent',
                  opacity: isFuture ? 0.2 : 1,
                  cursor: isFuture ? 'default' : 'pointer',
                }}
              >
                <span className="text-xs" style={{ color: isToday ? '#93C5FD' : t.text }}>
                  {day}
                </span>
                {completedHabits.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[28px]">
                    {completedHabits.slice(0, 4).map((h) => {
                      const idx = habits.findIndex(hh => hh.id === h.id)
                      return (
                        <div key={h.id} style={{
                          width: 4, height: 4, borderRadius: '50%',
                          background: HABIT_COLORS[idx % HABIT_COLORS.length],
                        }} />
                      )
                    })}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected date detail */}
        {selectedDate && (
          <div className="mb-6 rounded-2xl p-4"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <h3 className="text-sm font-medium mb-2" style={{ color: t.text }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            {selectedCompletions.length === 0 ? (
              <p className="text-xs" style={{ color: t.textMuted }}>No completions this day.</p>
            ) : (
              <div className="space-y-1">
                {selectedCompletions.map(h => {
                  const idx = habits.findIndex(hh => hh.id === h.id)
                  return (
                    <div key={h.id} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: HABIT_COLORS[idx % HABIT_COLORS.length] }} />
                      <span>{h.emoji}</span>
                      <span style={{ color: t.text }}>{h.name}</span>
                      <span style={{ color: '#93C5FD' }}>✓</span>
                    </div>
                  )
                })}
                {isPerfectDay(selectedDate) && habits.length > 0 && (
                  <p className="text-xs mt-2" style={{ color: '#FBBF24' }}>⭐ Perfect day!</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Habit tracker matrix (image-3 style) */}
        {habits.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3" style={{ color: t.text }}>
              {monthNames[month]} habit tracker
            </h3>
            <div className="rounded-2xl overflow-hidden"
              style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
              {/* Day number header */}
              <div className="flex border-b" style={{ borderColor: t.divider }}>
                <div className="w-28 flex-shrink-0 px-3 py-2">
                  <p className="text-xs font-medium" style={{ color: t.textSub }}>HABITS</p>
                </div>
                <div className="flex flex-1 overflow-x-auto no-scrollbar">
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const ds = dateStr(day)
                    const isToday = ds === todayStr
                    return (
                      <div key={day} className="flex-shrink-0 w-7 flex items-center justify-center py-2">
                        <span className="text-xs" style={{ color: isToday ? '#93C5FD' : t.textSub, fontWeight: isToday ? 600 : 400 }}>
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
                  <div key={habit.id} className="flex border-b last:border-b-0" style={{ borderColor: t.divider }}>
                    <div className="w-28 flex-shrink-0 flex items-center gap-2 px-3 py-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-xs truncate" style={{ color: t.text, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                        {habit.emoji} {habit.name}
                      </span>
                    </div>
                    <div className="flex flex-1 overflow-x-auto no-scrollbar">
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const ds = dateStr(day)
                        const done = habit.completions?.includes(ds)
                        const isFuture = ds > todayStr
                        return (
                          <div key={day} className="flex-shrink-0 w-7 flex items-center justify-center py-2">
                            {done ? (
                              <div className="w-4 h-4 rounded-full" style={{ background: color, opacity: 0.9 }} />
                            ) : isFuture ? (
                              <div className="w-3 h-3 rounded-full" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }} />
                            ) : (
                              <div className="w-3 h-3 rounded-full" style={{ background: t.inputBg, border: `1px solid ${color}30` }} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 90-day heatmap */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3" style={{ color: t.text }}>90-day overview</h3>
          <div className="flex flex-wrap gap-1">
            {heatmapCells.map(({ date, count }) => (
              <div key={date} title={`${date}: ${count} completions`}
                style={{ width: 12, height: 12, borderRadius: 2, background: heatmapColor(count), border: `1px solid ${t.cardBorder}` }} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs" style={{ color: t.textSub }}>Less</span>
            {[heatmapColor(0), '#1e3a8a', '#2563EB', '#93C5FD'].map((c, idx) => (
              <div key={idx} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
            ))}
            <span className="text-xs" style={{ color: t.textSub }}>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
