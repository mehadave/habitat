import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import { useAuthStore } from '../store/authStore'
import { getLevelFromXP, getLevelName, getXPProgressInLevel } from '../lib/gamification'
import { XPBar } from '../components/XPBar'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

type Range = '7d' | '30d' | '90d' | 'all'

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs"
      style={{ background: '#0F1B45', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
      <p style={{ color: '#93C5FD' }}>{label}</p>
      <p>{payload[0].value} completions</p>
    </div>
  )
}

export default function Analytics() {
  const { data: habits = [] } = useHabits()
  const { profile } = useAuthStore()
  const [range, setRange] = useState<Range>('30d')

  const rangeStart = range === '7d' ? daysAgo(7)
    : range === '30d' ? daysAgo(30)
    : range === '90d' ? daysAgo(90)
    : '2000-01-01'

  const totalXP = profile?.total_xp ?? 0
  const level = getLevelFromXP(totalXP)
  const levelName = getLevelName(level)
  const xpProgress = getXPProgressInLevel(totalXP)

  // Daily completions chart data
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 90
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

  // Per-habit stats
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

  return (
    <div className="min-h-screen" style={{ background: '#0B1437', paddingTop: 60, paddingBottom: 80 }}>
      <div className="px-4 pt-4">
        <h1 className="text-lg font-medium text-white mb-4">Analytics</h1>

        {/* XP / Level */}
        <div className="rounded-2xl p-4 mb-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Your progress</p>
          <XPBar current={xpProgress.current} max={xpProgress.max} level={level} levelName={levelName} />
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Total XP: <span style={{ color: '#93C5FD' }}>{totalXP.toLocaleString()}</span>
          </p>
        </div>

        {/* Range filter */}
        <div className="flex gap-2 mb-4">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{
                background: range === r ? '#2563EB' : 'rgba(255,255,255,0.07)',
                color: range === r ? '#fff' : 'rgba(255,255,255,0.55)',
              }}
            >
              {r === 'all' ? 'All time' : r}
            </button>
          ))}
        </div>

        {/* Bar chart */}
        <div className="rounded-2xl p-4 mb-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>Daily completions</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={range === '90d' ? 4 : range === '30d' ? 8 : 16}>
              <XAxis
                dataKey="date"
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
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
                    fill={entry.count === Math.max(...chartData.map(d => d.count)) ? '#93C5FD' : '#2563EB'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Per-habit table */}
        <h2 className="text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,0.85)' }}>Per habit</h2>
        <div className="space-y-2">
          {habitStats.map(h => (
            <div key={h.id} className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{h.emoji}</span>
                  <span className="text-sm text-white">{h.name}</span>
                </div>
                <span className="text-sm font-medium" style={{ color: h.rate >= 70 ? '#93C5FD' : h.rate >= 40 ? '#60A5FA' : '#F87171' }}>
                  {h.rate}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full"
                  style={{ width: `${h.rate}%`, background: 'linear-gradient(90deg, #2563EB, #93C5FD)', transition: 'width 0.8s ease' }} />
              </div>
              <div className="flex gap-4 mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span>{h.completions} done</span>
                <span>streak: {h.streak}d</span>
                <span>best: {h.best}d</span>
                <span>total: {h.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
