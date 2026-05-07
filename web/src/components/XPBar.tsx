import { useEffect, useState } from 'react'

interface XPBarProps {
  current: number
  max: number
  level: number
  levelName: string
}

export function XPBar({ current, max, level, levelName }: XPBarProps) {
  const [width, setWidth] = useState(0)
  const pct = Math.min((current / max) * 100, 100)

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: 'var(--accent-text)' }}>
          Lv.{level} {levelName}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>
          {current} / {max} XP
        </span>
      </div>
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--surface-tint)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: 'linear-gradient(90deg, #2563EB, #60A5FA)',
          }}
        />
      </div>
    </div>
  )
}
