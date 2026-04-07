import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function Calendar() {
  const { data: habits = [] } = useHabits()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function getCompletionsForDate(d: string) {
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
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const monthNames = ['January','February','March','April','May','June',
    'July','August','September','October','November','December']

  // 90-day heatmap
  const heatmapDays = 90
  const heatmapCells: { date: string; count: number }[] = []
  for (let i = heatmapDays - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().split('T')[0]
    heatmapCells.push({
      date: ds,
      count: habits.filter(h => h.completions?.includes(ds)).length,
    })
  }

  const maxCount = Math.max(...heatmapCells.map(c => c.count), 1)

  function heatmapColor(count: number): string {
    if (count === 0) return 'rgba(255,255,255,0.05)'
    const ratio = count / maxCount
    if (ratio < 0.33) return '#1e3a8a'
    if (ratio < 0.66) return '#2563EB'
    return '#93C5FD'
  }

  const selectedCompletions = selectedDate ? getCompletionsForDate(selectedDate) : []

  return (
    <div className="min-h-screen" style={{ background: '#0B1437', paddingTop: 60, paddingBottom: 80 }}>
      <div className="px-4 pt-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>
            ‹
          </button>
          <h2 className="text-base font-medium text-white">
            {monthNames[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>
            ›
          </button>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-xs py-1"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {/* Empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const ds = dateStr(day)
            const comps = getCompletionsForDate(ds)
            const perfect = isPerfectDay(ds)
            const isToday = ds === today.toISOString().split('T')[0]
            const isFuture = ds > today.toISOString().split('T')[0]
            const isSelected = ds === selectedDate

            return (
              <button
                key={day}
                onClick={() => !isFuture && setSelectedDate(ds === selectedDate ? null : ds)}
                className="flex flex-col items-center py-2 rounded-xl relative"
                style={{
                  background: isSelected ? 'rgba(37,99,235,0.3)' : isToday ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.04)',
                  border: perfect ? '1px solid #FBBF24' : isToday ? '1px solid rgba(37,99,235,0.5)' : '1px solid transparent',
                  opacity: isFuture ? 0.3 : 1,
                }}
              >
                <span className="text-xs" style={{ color: isToday ? '#93C5FD' : 'rgba(255,255,255,0.8)' }}>
                  {day}
                </span>
                {comps.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[28px]">
                    {comps.slice(0, 3).map((h) => (
                      <div key={h.id} style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: comps.length === habits.length && habits.length > 0 ? '#60A5FA' : '#2563EB'
                      }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected date detail */}
        {selectedDate && (
          <div className="mb-6 rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <h3 className="text-sm font-medium text-white mb-2">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            {selectedCompletions.length === 0 ? (
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>No completions this day.</p>
            ) : (
              <div className="space-y-1">
                {selectedCompletions.map(h => (
                  <div key={h.id} className="flex items-center gap-2 text-xs">
                    <span>{h.emoji}</span>
                    <span style={{ color: 'rgba(255,255,255,0.75)' }}>{h.name}</span>
                    <span style={{ color: '#93C5FD' }}>✓</span>
                  </div>
                ))}
                {isPerfectDay(selectedDate) && habits.length > 0 && (
                  <p className="text-xs mt-2" style={{ color: '#FBBF24' }}>⭐ Perfect day!</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 90-day heatmap */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,0.85)' }}>
            90-day overview
          </h3>
          <div className="flex flex-wrap gap-1">
            {heatmapCells.map(({ date, count }) => (
              <div
                key={date}
                title={`${date}: ${count} completions`}
                style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: heatmapColor(count),
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Less</span>
            {['rgba(255,255,255,0.05)', '#1e3a8a', '#2563EB', '#93C5FD'].map((c) => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
            ))}
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
