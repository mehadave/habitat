import React, { useState } from 'react'
import { useHabits, localDateStr } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

type Range = '7d' | '30d' | '90d' | 'all'

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return localDateStr(d)
}

function RingProgress({
  pct, size = 88, strokeWidth = 8, color = '#2563EB', children,
}: {
  pct: number; size?: number; strokeWidth?: number; color?: string; children?: React.ReactNode
}) {
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(pct, 100) / 100) * c
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}

const RANGES: Range[] = ['7d', '30d', '90d', 'all']

export default function Analytics() {
  const { data: habits = [] } = useHabits()
  const { darkMode } = useUIStore()
  const [range, setRange] = useState<Range>('30d')

  const t = {
    bg: 'var(--bg-app)',
    text: 'var(--text-1)',
    muted: 'var(--text-2)',
    sub: 'var(--text-3)',
    card: 'var(--surface)',
    border: 'var(--border)',
    tint: 'var(--surface-tint)',
    alt: 'var(--surface-alt)',
    divider: 'var(--divider)',
  }

  const todayStr = localDateStr()
  const totalHabits = habits.length

  const doneToday = habits.filter(h => h.completions?.includes(todayStr)).length
  const todayPct = totalHabits > 0 ? Math.round((doneToday / totalHabits) * 100) : 0
  const todayColor = todayPct >= 80 ? '#4ADE80' : todayPct >= 50 ? '#38BDF8' : '#F87171'

  const rangeStart = range === '7d' ? daysAgo(7)
    : range === '30d' ? daysAgo(30)
    : range === '90d' ? daysAgo(90)
    : '2000-01-01'

  const chartDays = range === '7d' ? 7 : range === '30d' ? 30 : 90

  const chartData = Array.from({ length: chartDays }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (chartDays - 1 - i))
    const ds = localDateStr(d)
    const count = habits.reduce((sum, h) => sum + (h.completions?.includes(ds) ? 1 : 0), 0)
    const pct = totalHabits > 0 ? Math.round((count / totalHabits) * 100) : 0
    return {
      date: d.toLocaleDateString('en-US', range === '7d' ? { weekday: 'short' } : { month: 'short', day: 'numeric' }),
      count,
      pct,
      ds,
    }
  })

  // Week summary
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i); return localDateStr(d)
  })
  const weekDone = habits.reduce((sum, h) => sum + weekDates.filter(d => h.completions?.includes(d)).length, 0)
  const weekMax = totalHabits * 7
  const weekPct = weekMax > 0 ? Math.round(weekDone / weekMax * 100) : 0

  // Month total
  const monthStart = localDateStr(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const monthDone = habits.reduce((sum, h) => sum + (h.completions?.filter(d => d >= monthStart).length ?? 0), 0)

  // Best streak
  const bestStreak = habits.reduce<typeof habits[0] | null>((best, h) => {
    const s = h.streak?.current_streak ?? 0
    return s > (best?.streak?.current_streak ?? 0) ? h : best
  }, null)

  // Per-habit stats
  const habitStats = habits.map(h => {
    const comps = h.completions?.filter(d => d >= rangeStart) ?? []
    const daysInRange = Math.max(
      Math.ceil((Date.now() - new Date(Math.max(new Date(rangeStart).getTime(), new Date(h.created_at).getTime())).getTime()) / (1000 * 60 * 60 * 24)),
      1
    )
    const rate = Math.round((comps.length / daysInRange) * 100)
    return {
      ...h,
      comps: comps.length,
      rate,
      streak: h.streak?.current_streak ?? 0,
      best: h.streak?.longest_streak ?? 0,
      total: h.completions?.length ?? 0,
      doneToday: h.completions?.includes(todayStr) ?? false,
    }
  }).sort((a, b) => b.rate - a.rate)

  // Day-of-week analysis
  const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const dowData = DAY_LABELS.map((day, dow) => {
    const comps = habits.flatMap(h =>
      (h.completions?.filter(d => d >= rangeStart && new Date(d + 'T12:00').getDay() === dow) ?? [])
    ).length
    const start = new Date(rangeStart < '2000-01-02' ? daysAgo(90) : rangeStart)
    let possible = 0
    const cur = new Date(start)
    while (cur <= new Date()) {
      if (cur.getDay() === dow) possible += totalHabits
      cur.setDate(cur.getDate() + 1)
    }
    const rate = possible > 0 ? Math.round((comps / possible) * 100) : 0
    return { day, rate }
  })
  const maxDow = Math.max(...dowData.map(d => d.rate), 1)

  // 14-day heatmap
  const heatmapDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 13 + i)
    const ds = localDateStr(d)
    return { ds, label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1), isToday: ds === todayStr }
  })

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-xl px-3 py-2 text-xs" style={{ background: t.alt, border: `1px solid ${t.border}`, color: t.text }}>
        <p style={{ color: '#93C5FD', marginBottom: 2 }}>{label}</p>
        <p>{payload[0].value}{payload[0].name === 'pct' ? '%' : ' completions'}</p>
      </div>
    )
  }

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 76, paddingBottom: 100 }}>
      <div className="px-4 pt-6 page-inner">

        {/* Header + range selector */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: '#38BDF8' }}>Your Data</p>
            <h1 className="text-2xl font-bold" style={{ color: t.text, letterSpacing: '-0.02em' }}>Statistics</h1>
          </div>
          <div className="flex gap-1 rounded-2xl p-1" style={{ background: t.tint, border: `1px solid ${t.border}` }}>
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: range === r ? '#2563EB' : 'transparent',
                  color: range === r ? '#fff' : t.muted,
                  boxShadow: range === r ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                }}>
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Today's pulse — hero card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-5 mb-4 relative overflow-hidden"
          style={{
            background: darkMode
              ? 'linear-gradient(135deg, rgba(37,99,235,0.22) 0%, rgba(56,189,248,0.10) 100%)'
              : 'linear-gradient(135deg, rgba(37,99,235,0.10) 0%, rgba(147,197,253,0.18) 100%)',
            border: '1px solid rgba(56,189,248,0.22)',
            boxShadow: darkMode ? '0 0 40px rgba(37,99,235,0.12)' : '0 4px 24px rgba(37,99,235,0.10)',
          }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.14) 0%, transparent 70%)', transform: 'translate(25%, -25%)' }} />

          <p className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: '#38BDF8' }}>Today's Pulse</p>

          <div className="flex items-center gap-5">
            <RingProgress pct={todayPct} size={92} strokeWidth={9} color={todayColor}>
              <span style={{ fontSize: 19, fontWeight: 800, color: t.text, letterSpacing: '-0.02em' }}>{todayPct}%</span>
              <span style={{ fontSize: 9, color: t.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>today</span>
            </RingProgress>

            <div className="flex-1 min-w-0">
              <p className="text-3xl font-bold mb-0.5" style={{ color: t.text, letterSpacing: '-0.03em' }}>
                {doneToday}
                <span className="text-base font-semibold ml-0.5" style={{ color: t.muted }}>/{totalHabits}</span>
              </p>
              <p className="text-xs mb-3" style={{ color: t.muted }}>habits done today</p>
              <div className="flex flex-wrap gap-1.5">
                {habits.map(h => (
                  <div key={h.id}
                    className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{
                      background: h.completions?.includes(todayStr)
                        ? 'rgba(74,222,128,0.18)'
                        : darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(11,20,55,0.06)',
                      border: h.completions?.includes(todayStr)
                        ? '1px solid rgba(74,222,128,0.38)'
                        : `1px solid ${t.border}`,
                    }}>
                    <span style={{ fontSize: 13 }}>{h.emoji || '⭐'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3-stat quick summary */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { label: 'This Week', value: `${weekPct}%`, sub: `${weekDone} sessions`, color: '#FBBF24', icon: '📅' },
            { label: 'This Month', value: monthDone, sub: 'completions', color: '#4ADE80', icon: '🗓' },
            {
              label: 'Top Streak',
              value: bestStreak ? `${bestStreak.streak?.current_streak ?? 0}d` : '—',
              sub: bestStreak ? bestStreak.name : 'No habits',
              color: '#38BDF8',
              icon: '🔥',
            },
          ].map(({ label, value, sub, color, icon }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="rounded-2xl p-3"
              style={{ background: t.card, border: `1px solid ${t.border}` }}
            >
              <span className="text-lg leading-none">{icon}</span>
              <p className="text-xl font-bold mt-1 mb-0" style={{ color, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</p>
              <p className="text-[9px] font-semibold tracking-wide uppercase mt-0.5" style={{ color: t.muted }}>{label}</p>
              <p className="text-[9px] mt-0.5 truncate" style={{ color: t.sub }}>{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Area chart — completion trend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 mb-4"
          style={{ background: t.card, border: `1px solid ${t.border}` }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold" style={{ color: t.text }}>Completion Trend</p>
            <p className="text-[10px]" style={{ color: t.sub }}>% of habits per day</p>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <AreaChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={darkMode ? 0.38 : 0.22} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: t.sub as string, fontSize: 8 }}
                tickLine={false}
                axisLine={false}
                interval={range === '7d' ? 0 : range === '30d' ? 5 : 14}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: t.sub as string, fontSize: 8 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="pct" name="pct"
                stroke="#2563EB" strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={range === '7d' ? { fill: '#38BDF8', r: 3.5, strokeWidth: 0 } : false}
                activeDot={{ fill: '#38BDF8', r: 4.5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 14-day heatmap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="rounded-2xl p-4 mb-4"
          style={{ background: t.card, border: `1px solid ${t.border}` }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: t.text }}>14-Day Heatmap</p>
          {habits.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: t.muted }}>No habits yet.</p>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <div style={{ minWidth: Math.max(habits.length > 0 ? 320 : 0, 0) }}>
                {/* Date header */}
                <div className="flex gap-1 mb-2">
                  <div style={{ width: 68, flexShrink: 0 }} />
                  {heatmapDates.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <span style={{ fontSize: 8, fontWeight: d.isToday ? 700 : 400, color: d.isToday ? '#38BDF8' : t.sub }}>
                        {d.label}
                      </span>
                      {d.isToday && <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#38BDF8' }} />}
                    </div>
                  ))}
                </div>
                {/* Habit rows */}
                {habits.slice(0, 8).map(h => (
                  <div key={h.id} className="flex gap-1 mb-1.5 items-center">
                    <div style={{ width: 68, flexShrink: 0, overflow: 'hidden' }}>
                      <span style={{ fontSize: 10, color: t.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                        {h.emoji} {h.name}
                      </span>
                    </div>
                    {heatmapDates.map((d, i) => {
                      const done = h.completions?.includes(d.ds)
                      return (
                        <div key={i} className="flex-1 flex items-center justify-center">
                          <div style={{
                            width: 16, height: 16, borderRadius: 4,
                            background: done
                              ? d.isToday ? '#2563EB' : darkMode ? 'rgba(37,99,235,0.72)' : 'rgba(37,99,235,0.60)'
                              : darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(11,20,55,0.06)',
                            border: done ? 'none' : `1px solid ${t.border}`,
                            boxShadow: done && d.isToday ? '0 0 6px rgba(37,99,235,0.5)' : 'none',
                          }} />
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Day-of-week patterns */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34 }}
          className="rounded-2xl p-4 mb-5"
          style={{ background: t.card, border: `1px solid ${t.border}` }}
        >
          <p className="text-xs font-semibold mb-0.5" style={{ color: t.text }}>Day-of-Week Patterns</p>
          <p className="text-[10px] mb-4" style={{ color: t.sub }}>Your consistency by day</p>
          <div className="flex items-end gap-1.5" style={{ height: 76 }}>
            {dowData.map(({ day, rate }) => {
              const barH = Math.max(Math.round((rate / maxDow) * 60), 4)
              const isTop = rate === maxDow && rate > 0
              return (
                <div key={day} className="flex-1 flex flex-col items-center justify-end gap-1.5">
                  <span style={{ fontSize: 8, fontWeight: 600, color: isTop ? '#FBBF24' : t.sub }}>{rate}%</span>
                  <div style={{
                    width: '100%', height: barH,
                    background: isTop
                      ? 'linear-gradient(180deg, #FBBF24, #F59E0B)'
                      : 'linear-gradient(180deg, #3B82F6, #2563EB)',
                    borderRadius: '4px 4px 2px 2px',
                    opacity: rate === 0 ? 0.18 : 1,
                    boxShadow: isTop ? '0 2px 8px rgba(251,191,36,0.45)' : 'none',
                    transition: 'height 0.8s ease',
                  }} />
                  <span style={{ fontSize: 9, fontWeight: isTop ? 700 : 400, color: isTop ? '#FBBF24' : t.muted }}>{day}</span>
                </div>
              )
            })}
          </div>
          {maxDow > 0 && (
            <p className="text-[10px] mt-3" style={{ color: t.muted }}>
              ⭐ Best: {dowData.find(d => d.rate === maxDow)?.day} at {maxDow}% consistency
            </p>
          )}
        </motion.div>

        {/* Habit performance */}
        <p className="text-xs font-bold mb-3" style={{ color: t.text }}>Habit Performance</p>
        {habitStats.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: t.muted }}>No habits tracked yet.</p>
        ) : (
          <div className="space-y-2.5 pb-2">
            {habitStats.map((h, i) => {
              const ringColor = h.rate >= 70 ? '#4ADE80' : h.rate >= 40 ? '#38BDF8' : '#F87171'
              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.38 + i * 0.04 }}
                  className="rounded-2xl p-4"
                  style={{ background: t.card, border: `1px solid ${t.border}` }}
                >
                  <div className="flex items-center gap-3">
                    <RingProgress pct={h.rate} size={52} strokeWidth={5} color={ringColor}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: ringColor }}>{h.rate}%</span>
                    </RingProgress>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span style={{ fontSize: 18 }}>{h.emoji}</span>
                        <span className="text-sm font-semibold truncate" style={{ color: t.text }}>{h.name}</span>
                        {h.doneToday && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                            style={{ background: 'rgba(74,222,128,0.14)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.3)' }}>
                            ✓ Done
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 flex-wrap" style={{ fontSize: 10, color: t.sub }}>
                        <span>🔥 {h.streak}d streak</span>
                        <span>🏆 {h.best}d best</span>
                        <span>📊 {h.comps} in range</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Daily completions bar chart — secondary view */}
        {chartDays <= 30 && habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-4 mt-4"
            style={{ background: t.card, border: `1px solid ${t.border}` }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: t.text }}>Daily Count</p>
            <p className="text-[10px] mb-3" style={{ color: t.sub }}>Number of completions per day</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={chartData} barSize={range === '30d' ? 6 : 14} margin={{ top: 2, right: 4, bottom: 0, left: -22 }}>
                <XAxis dataKey="date" tick={{ fill: t.sub as string, fontSize: 8 }} tickLine={false} axisLine={false}
                  interval={range === '7d' ? 0 : 4} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="count" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i}
                      fill={entry.ds === todayStr ? '#38BDF8' : entry.count === Math.max(...chartData.map(d => d.count)) && entry.count > 0 ? '#60A5FA' : '#2563EB'}
                      fillOpacity={entry.count === 0 ? 0.2 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  )
}
