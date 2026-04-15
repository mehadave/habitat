interface StreakHeroProps {
  streak: number
  startDate?: string
  darkMode?: boolean
  label?: string
  sublabel?: string
}

export function StreakHero({ streak, startDate, darkMode = true, label, sublabel }: StreakHeroProps) {
  const daysIn = startDate
    ? Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const formattedStart = startDate
    ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  const numColor = darkMode ? '#ffffff' : '#0B1437'
  const labelColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(11,20,55,0.5)'
  const subColor = darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(11,20,55,0.35)'

  return (
    <div className="flex flex-col items-center py-6">
      <span
        className="font-bold leading-none"
        style={{ fontSize: 56, color: numColor }}
      >
        {streak}
      </span>
      <span
        className="uppercase tracking-widest mt-1 font-semibold"
        style={{ fontSize: 12, color: labelColor, letterSpacing: '1px' }}
      >
        {label ?? 'Day Streak'}
      </span>
      {sublabel && (
        <span className="mt-0.5" style={{ fontSize: 11, color: subColor }}>
          {sublabel}
        </span>
      )}
      {formattedStart && daysIn !== null && (
        <span
          className="mt-1"
          style={{ fontSize: 12, color: subColor }}
        >
          Started {formattedStart} · {daysIn} day{daysIn !== 1 ? 's' : ''} in
        </span>
      )}
    </div>
  )
}
