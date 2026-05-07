import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import { localDateStr } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'

const HABIT_COLORS = [
  '#F87171','#FB923C','#FBBF24','#4ADE80','#22D3EE',
  '#60A5FA','#A78BFA','#F472B6','#34D399','#818CF8',
] as const

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
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr)
  const [filterIds, setFilterIds] = useState<string[]>([])

  const visibleHabits = filterIds.length > 0 ? habits.filter(h => filterIds.includes(h.id)) : habits

  function toggleFilter(id: string) {
    setFilterIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const t = {
    bg: 'var(--bg-app)',
    text: 'var(--text-1)',
    textMuted: 'var(--text-2)',
    textSub: 'var(--text-3)',
    cardBg: 'var(--surface)',
    cardBorder: 'var(--border)',
    inputBg: 'var(--input-bg)',
    inputBorder: '1px solid var(--input-border)',
    inputColor: 'var(--text-1)',
    divider: 'var(--divider)',
    navBg: 'var(--nav-bg)',
    navBorder: 'var(--border)',
    sheetBg: 'var(--surface-alt)',
    badgeBg: 'var(--surface-tint)',
    badgeText: 'var(--text-2)',
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function getCompletedHabitsForDate(d: string) {
    return visibleHabits.filter(h => h.completions?.includes(d))
  }

  function isPerfectDay(d: string) {
    if (visibleHabits.length === 0) return false
    return visibleHabits.every(h => h.completions?.includes(d))
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
    heatmapCells.push({ date: ds, count: visibleHabits.filter(h => h.completions?.includes(ds)).length })
  }
  const maxCount = Math.max(...heatmapCells.map(c => c.count), 1)

  function heatmapColor(count: number): string {
    if (count === 0) return darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(11,20,55,0.11)'
    const ratio = count / maxCount
    if (ratio < 0.33) return '#93C5FD'   // few habits — lightest
    if (ratio < 0.66) return '#2563EB'   // moderate — medium
    return '#1e3a8a'                     // most habits — darkest
  }

  const selectedCompletions = selectedDate ? getCompletedHabitsForDate(selectedDate) : []
  const selectedMissed = selectedDate
    ? visibleHabits.filter(h => !h.completions?.includes(selectedDate) && selectedDate <= todayStr)
    : []

  const isNextDisabled = year === now.getFullYear() && month === now.getMonth()

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 76, paddingBottom: 80 }}>
      <div className="px-4 pt-8 page-inner">
        <h1 className="text-2xl font-bold mb-2" style={{ color: t.text }}>Calendar</h1>

        {/* Habit filter chips — compact scrollable row */}
        {habits.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-4 pb-0.5">
            <button
              onClick={() => setFilterIds([])}
              className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all"
              style={{
                background: filterIds.length === 0 ? 'rgba(37,99,235,0.25)' : t.inputBg,
                color: filterIds.length === 0 ? '#93C5FD' : t.textMuted,
                border: filterIds.length === 0 ? '1.5px solid #2563EB' : '1px solid var(--border)',
              }}
            >All</button>
            {habits.map((h, i) => {
              const active = filterIds.includes(h.id)
              const color = HABIT_COLORS[i % HABIT_COLORS.length]
              return (
                <button
                  key={h.id}
                  onClick={() => toggleFilter(h.id)}
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{
                    fontSize: 15,
                    background: active ? `${color}22` : t.inputBg,
                    border: active ? `1.5px solid ${color}88` : '1px solid var(--border)',
                    boxShadow: active ? `0 0 6px ${color}44` : 'none',
                  }}
                  title={h.name}
                >
                  {h.emoji}
                </button>
              )
            })}
          </div>
        )}

        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-xl w-10 h-10 flex items-center justify-center text-lg"
            style={{ background: t.inputBg, color: t.text }}>‹</button>
          <h2 className="text-lg font-semibold" style={{ color: t.text }}>{monthNames[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-xl w-10 h-10 flex items-center justify-center text-lg"
            style={{
              background: t.inputBg,
              color: isNextDisabled ? t.textSub : t.text,
            }}
            disabled={isNextDisabled}>›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-sm font-medium py-1" style={{ color: t.textSub }}>{d}</div>
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
                <span className="text-sm font-medium" style={{ color: isToday ? '#93C5FD' : t.text }}>
                  {day}
                </span>
                {completedHabits.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[32px]">
                    {completedHabits.slice(0, 4).map((h) => {
                      const idx = habits.findIndex(hh => hh.id === h.id)
                      return (
                        <div key={h.id} style={{
                          width: 5, height: 5, borderRadius: '50%',
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
            <h3 className="text-base font-semibold mb-2" style={{ color: t.text }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            {selectedCompletions.length === 0 && selectedMissed.length === 0 ? (
              <p className="text-xs" style={{ color: t.textMuted }}>No habits logged this day.</p>
            ) : (
              <div className="space-y-1.5">
                {selectedCompletions.map(h => {
                  const idx = habits.findIndex(hh => hh.id === h.id)
                  return (
                    <div key={h.id} className="flex items-center gap-2 text-sm">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: HABIT_COLORS[idx % HABIT_COLORS.length] }} />
                      <span>{h.emoji}</span>
                      <span style={{ color: t.text }}>{h.name}</span>
                      <span style={{ color: '#4ADE80' }}>✓</span>
                    </div>
                  )
                })}
                {selectedMissed.length > 0 && selectedCompletions.length > 0 && (
                  <div className="my-1.5" style={{ height: 1, background: t.divider }} />
                )}
                {selectedMissed.map(h => {
                  const idx = habits.findIndex(hh => hh.id === h.id)
                  return (
                    <div key={h.id} className="flex items-center gap-2 text-sm opacity-50">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: HABIT_COLORS[idx % HABIT_COLORS.length] }} />
                      <span>{h.emoji}</span>
                      <span style={{ color: t.text }}>{h.name}</span>
                      <span style={{ color: t.textSub }}>✗</span>
                    </div>
                  )
                })}
                {isPerfectDay(selectedDate) && visibleHabits.length > 0 && (
                  <p className="text-sm mt-2" style={{ color: '#FBBF24' }}>⭐ Perfect day!</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 90-day heatmap */}
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-3" style={{ color: t.text }}>90-day overview</h3>
          <div className="flex flex-wrap gap-1">
            {heatmapCells.map(({ date, count }) => (
              <div key={date} title={`${date}: ${count} completions`}
                style={{ width: 12, height: 12, borderRadius: 2, background: heatmapColor(count), border: `1px solid ${t.cardBorder}` }} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs" style={{ color: t.textSub }}>Less</span>
            {[heatmapColor(0), '#93C5FD', '#2563EB', '#1e3a8a'].map((c, idx) => (
              <div key={idx} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
            ))}
            <span className="text-xs" style={{ color: t.textSub }}>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
