import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../store/uiStore'
import { localDateStr } from '../hooks/useHabits'

interface CommitGridProps {
  habitId?: string
  habitName: string
  completions: string[]
  onToggle: (date: string) => void
  isLoading?: boolean
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const DOW_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function CommitGrid({ habitName, completions, onToggle, isLoading }: CommitGridProps) {
  const { darkMode } = useUIStore()
  const [confirmDate, setConfirmDate] = useState<string | null>(null)
  const [burstCell, setBurstCell] = useState<string | null>(null)

  const todayLocal = new Date()
  const todayStr = localDateStr(todayLocal)

  // Month navigation — default to current month
  const [viewYear, setViewYear] = useState(todayLocal.getFullYear())
  const [viewMonth, setViewMonth] = useState(todayLocal.getMonth())

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    // Don't allow navigating past the current month
    if (viewYear === todayLocal.getFullYear() && viewMonth >= todayLocal.getMonth()) return
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const isCurrentMonth = viewYear === todayLocal.getFullYear() && viewMonth === todayLocal.getMonth()

  // Build calendar cells for viewYear/viewMonth
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDOW = new Date(viewYear, viewMonth, 1).getDay() // 0 = Sunday

  // Padding + days + trailing padding to fill last week
  const cells: (string | null)[] = Array(firstDOW).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(
      `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    )
  }
  while (cells.length % 7 !== 0) cells.push(null)

  // Split into week rows
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  // Stats (all-time, not just visible month)
  const totalCompletions = completions.length
  const sorted = completions.slice().sort()
  const bestStreak = (() => {
    let best = 0, cur = 0, prev = ''
    for (const d of sorted) {
      if (prev) {
        const diff = (new Date(d + 'T00:00:00').getTime() - new Date(prev + 'T00:00:00').getTime()) / 86400000
        cur = diff === 1 ? cur + 1 : 1
      } else {
        cur = 1
      }
      if (cur > best) best = cur
      prev = d
    }
    return best
  })()

  // Colours
  const emptyBg = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(11,20,55,0.13)'
  const emptyBorder = darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(11,20,55,0.20)'
  const sheetBg = darkMode ? '#0F1B45' : '#E8EFFF'
  const sheetBorder = darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(11,20,55,0.20)'
  const textColor = darkMode ? 'white' : '#0B1437'
  const textMuted = darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(11,20,55,0.72)'
  const statsMuted = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(11,20,55,0.62)'
  const cancelBg = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(11,20,55,0.13)'
  const cancelColor = darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(11,20,55,0.72)'
  const labelColor = darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(11,20,55,0.3)'
  const navBg = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(11,20,55,0.11)'

  function getCellColor(dateStr: string): string {
    return completions.includes(dateStr) ? '#2563EB' : emptyBg
  }
  function getCellBorder(dateStr: string): string {
    if (dateStr === todayStr) return '1px solid #60A5FA'
    return completions.includes(dateStr) ? '1px solid #2563EB' : emptyBorder
  }

  function handleCellClick(dateStr: string) {
    if (dateStr > todayStr) return
    if (dateStr === todayStr) {
      setBurstCell(dateStr)
      setTimeout(() => setBurstCell(null), 400)
      onToggle(dateStr)
      return
    }
    setConfirmDate(dateStr)
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  return (
    <div style={{ opacity: isLoading ? 0.5 : 1 }}>
      {/* Month nav header */}
      <div className="flex items-center justify-between mb-1.5">
        <button
          onClick={prevMonth}
          className="w-5 h-5 rounded flex items-center justify-center text-xs"
          style={{ background: navBg, color: textMuted }}
        >
          ‹
        </button>
        <span className="text-[10px] font-semibold" style={{ color: labelColor }}>
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          className="w-5 h-5 rounded flex items-center justify-center text-xs"
          style={{
            background: navBg,
            color: isCurrentMonth ? 'rgba(255,255,255,0.15)' : textMuted,
            cursor: isCurrentMonth ? 'not-allowed' : 'pointer',
          }}
        >
          ›
        </button>
      </div>

      {/* Unified grid — fixed 12px columns so it stays compact on any screen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 12px)', gap: 3 }}>
        {/* Day-of-week labels */}
        {DOW_LABELS.map(l => (
          <div key={l} style={{ width: 12, fontSize: 7, color: labelColor, textAlign: 'center', lineHeight: '10px', paddingBottom: 2 }}>
            {l}
          </div>
        ))}

        {/* All cells — flat list, grid wraps into rows of 7 automatically */}
        {weeks.flat().map((dateStr, idx) => {
          if (!dateStr) {
            return <div key={`pad-${idx}`} style={{ width: 12, height: 12, borderRadius: 2 }} />
          }
          const isFuture = dateStr > todayStr
          const isBursting = burstCell === dateStr
          return (
            <motion.div
              key={dateStr}
              className="commit-cell"
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: getCellColor(dateStr),
                border: getCellBorder(dateStr),
                opacity: isFuture ? 0.25 : 1,
                cursor: isFuture ? 'not-allowed' : 'pointer',
                flexShrink: 0,
              }}
              animate={isBursting ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleCellClick(dateStr)}
              title={isFuture ? 'Not yet!' : formatDate(dateStr)}
            />
          )
        })}
      </div>

      {/* Stats */}
      <p className="text-xs mt-2" style={{ color: statsMuted }}>
        {totalCompletions} completion{totalCompletions !== 1 ? 's' : ''} · best streak: {bestStreak} day{bestStreak !== 1 ? 's' : ''}
      </p>

      {/* Confirm dialog */}
      <AnimatePresence>
        {confirmDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setConfirmDate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="rounded-2xl p-6 w-full max-w-xs"
              style={{ background: sheetBg, border: sheetBorder }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-medium mb-1" style={{ color: textColor }}>Log past completion?</h3>
              <p className="text-xs mb-4" style={{ color: textMuted }}>
                Log <strong>{habitName}</strong> for {formatDate(confirmDate)}?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDate(null)}
                  className="flex-1 py-2 rounded-xl text-xs"
                  style={{ background: cancelBg, color: cancelColor }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onToggle(confirmDate)
                    setConfirmDate(null)
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-medium text-white"
                  style={{ background: '#2563EB' }}
                >
                  Log it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
