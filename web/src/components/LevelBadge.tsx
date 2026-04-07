interface LevelBadgeProps {
  level: number
  name: string
  compact?: boolean
}

export function LevelBadge({ level, name, compact }: LevelBadgeProps) {
  if (compact) {
    return (
      <span
        className="px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: 'rgba(37,99,235,0.2)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.35)' }}
      >
        Lv.{level}
      </span>
    )
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}
    >
      <span className="text-sm">🌊</span>
      <span className="text-xs font-medium" style={{ color: '#93C5FD' }}>
        Lv.{level} · {name}
      </span>
    </div>
  )
}
