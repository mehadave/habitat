import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

type Range = '7d' | '30d' | '90d' | 'all'

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

export default function Analytics() {
  const { data: habits = [] } = useHabits()
  const { darkMode } = useUIStore()
  const [range, setRange] = useState<Range>('30d')

  const t = darkMode ? {
    bg: '#0B1120',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.45)',
    textSub: 'rgba(255,255,255,0.3)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.09)',
    inputBg: 'rgba(255,255,255,0.07)',
    btnText: 'rgba(255,255,255,0.55)',
    barTrack: 'rgba(255,255,255,0.1)',
    tooltipBg: '#0F1B45',
    tooltipBorder: 'rgba(255,255,255,0.12)',
    tooltipText: '#fff',
    axisTick: 'rgba(255,255,255,0.3)',
  } : {
    bg: '#F0F4FF',
    text: '#0B1437',
    textMuted: 'rgba(11,20,55,0.72)',
    textSub: 'rgba(11,20,55,0.62)',
    cardBg: 'rgba(255,255,255,0.85)',
    cardBorder: 'rgba(11,20,55,0.18)',
    inputBg: 'rgba(11,20,55,0.11)',
    btnText: 'rgba(11,20,55,0.72)',
    barTrack: 'rgba(11,20,55,0.14)',
    tooltipBg: '#E8EFFF',
    tooltipBorder: 'rgba(11,20,55,0.20)',
    tooltipText: '#0B1437',
    axisTick: 'rgba(11,20,55,0.62)',
  }

  const rangeStart = range === '7d' ? daysAgo(7)
    : range === '30d' ? daysAgo(30)
    : range === '90d' ? daysAgo(90)
    : '2000-01-01'

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const chartData = Array.from({ length: Math.min(days, 90) }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const ds = d.toISOString().split('T')[0]
    const count = habits.reduce((sum, h) => sum + (h.completions?.includes(ds) ? 1 : 0), 0)
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }
  })

  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  const habitStats = habits.map(h => {
    const comps = h.completions?.filter(d => d >= rangeStart) ?? []
    const daysInRange = Math.max(
      Math.ceil((Date.now() - new Date(Math.max(new Date(rangeStart).getTime(), new Date(h.created_at).getTime())).getTime()) / (1000 * 60 * 60 * 24)),
      1
    )
    const rate = Math.round((comps.length / daysInRange) * 100)
    return {
      id: h.id,
      name: h.name,
      emoji: h.emoji,
      completions: comps.length,
      rate,
      streak: h.streak?.current_streak ?? 0,
      best: h.streak?.longest_streak ?? 0,
      total: h.completions?.length ?? 0,
    }
  }).sort((a, b) => b.rate - a.rate)

  const RANGES: Range[] = ['7d', '30d', '90d', 'all']

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-xl px-3 py-2 text-xs"
        style={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, color: t.tooltipText }}>
        <p style={{ color: '#93C5FD' }}>{label}</p>
        <p>{payload[0].value} completions</p>
      </div>
    )
  }

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 76, paddingBottom: 80 }}>
      <div className="px-4 pt-8">
        <h1 className="text-2xl font-bold mb-5" style={{ color: t.text }}>Analytics</h1>

        {/* Range filter */}
        <div className="flex gap-2 mb-5">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: range === r ? '#2563EB' : t.inputBg,
                color: range === r ? '#fff' : t.btnText,
                boxShadow: range === r ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
              }}
            >
              {r === 'all' ? 'All time' : r}
            </button>
          ))}
        </div>

        {/* Bar chart */}
        <div className="rounded-2xl p-4 mb-5"
          style={{
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            boxShadow: darkMode ? 'none' : '0 2px 12px rgba(11,20,55,0.11)',
          }}>
          <p className="text-xs font-medium mb-3" style={{ color: t.textMuted }}>Daily completions</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={range === '90d' ? 4 : range === '30d' ? 8 : 16}>
              <XAxis
                dataKey="date"
                tick={{ fill: t.axisTick, fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                interval={range === '7d' ? 0 : range === '30d' ? 4 : 13}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.count === maxCount && entry.count > 0 ? '#93C5FD' : '#2563EB'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Per-habit table */}
        <h2 className="text-base font-bold mb-3" style={{ color: t.text }}>Per habit</h2>
        {habitStats.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: t.textMuted }}>No habits tracked yet.</p>
        ) : (
          <div className="space-y-2">
            {habitStats.map(h => (
              <div
                key={h.id}
                className="rounded-2xl p-4"
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  boxShadow: darkMode ? 'none' : '0 2px 8px rgba(11,20,55,0.09)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{h.emoji}</span>
                    <span className="text-sm font-medium" style={{ color: t.text }}>{h.name}</span>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: h.rate >= 70 ? '#4ADE80' : h.rate >= 40 ? '#60A5FA' : '#F87171' }}
                  >
                    {h.rate}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: t.barTrack }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${h.rate}%`,
                      background: 'linear-gradient(90deg, #2563EB, #93C5FD)',
                      transition: 'width 0.8s ease',
                    }}
                  />
                </div>
                <div className="flex gap-4 mt-2 text-xs" style={{ color: t.textSub }}>
                  <span>{h.completions} done</span>
                  <span>streak {h.streak}d</span>
                  <span>best {h.best}d</span>
                  <span>total {h.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
