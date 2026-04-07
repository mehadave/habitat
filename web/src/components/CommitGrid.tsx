import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CommitGridProps {
  habitId?: string
  habitName: string
  completions: string[]
  onToggle: (date: string) => void
  isLoading?: boolean
}

function getDateString(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function CommitGrid({ habitName, completions, onToggle, isLoading }: CommitGridProps) {
  const [confirmDate, setConfirmDate] = useState<string | null>(null)
  const [burstCell, setBurstCell] = useState<string | null>(null)

  const todayStr = getDateString(0)

  // Build 91-day grid (13 columns × 7 rows), newest right
  const cells: string[] = []
  for (let i = 90; i >= 0; i--) {
    cells.push(getDateString(i))
  }

  function getCellColor(dateStr: string, isOnARoll: boolean): string {
    const done = completions.includes(dateStr)
    if (done && isOnARoll) return '#93C5FD'
    if (done) return '#2563EB'
    return 'rgba(255,255,255,0.07)'
  }

  function getCellBorder(dateStr: string, isOnARoll: boolean): string {
    if (dateStr === todayStr) return '1px solid #60A5FA'
    const done = completions.includes(dateStr)
    if (!done) return '1px solid rgba(255,255,255,0.12)'
    if (isOnARoll) return '1px solid #93C5FD'
    return '1px solid #2563EB'
  }

  function isOnARoll(dateStr: string): boolean {
    const idx = cells.indexOf(dateStr)
    if (idx < 0) return false
    let count = 0
    for (let i = idx; i < cells.length; i++) {
      if (completions.includes(cells[i])) count++
      else break
    }
    return count >= 5
  }

  function handleCellClick(dateStr: string) {
    if (dateStr > todayStr) return // future
    if (dateStr === todayStr) {
      // Toggle today directly
      setBurstCell(dateStr)
      setTimeout(() => setBurstCell(null), 400)
      onToggle(dateStr)
      return
    }
    // Past date — confirm
    setConfirmDate(dateStr)
  }

  const columns: string[][] = []
  for (let col = 0; col < 13; col++) {
    columns.push(cells.slice(col * 7, col * 7 + 7))
  }

  const totalCompletions = completions.length
  const bestStreak = (() => {
    let best = 0, cur = 0
    for (let i = 0; i < cells.length; i++) {
      if (completions.includes(cells[i])) {
        cur++
        if (cur > best) best = cur
      } else {
        cur = 0
      }
    }
    return best
  })()

  return (
    <div>
      {/* Grid */}
      <div className="flex gap-[2.5px]" style={{ opacity: isLoading ? 0.5 : 1 }}>
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[2.5px]">
            {col.map((dateStr) => {
              const isFuture = dateStr > todayStr
              const roll = isOnARoll(dateStr)
              const isBursting = burstCell === dateStr
              return (
                <motion.div
                  key={dateStr}
                  className="commit-cell"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: getCellColor(dateStr, roll),
                    border: getCellBorder(dateStr, roll),
                    opacity: isFuture ? 0.3 : 1,
                    cursor: isFuture ? 'not-allowed' : 'pointer',
                  }}
                  animate={isBursting ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleCellClick(dateStr)}
                  title={isFuture ? 'Not yet!' : formatDate(dateStr)}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Stats */}
      <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
              style={{ background: '#0F1B45', border: '1px solid rgba(255,255,255,0.12)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-medium text-white mb-1">Log past completion?</h3>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Log <strong>{habitName}</strong> for {formatDate(confirmDate)}?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDate(null)}
                  className="flex-1 py-2 rounded-xl text-xs"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}
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
