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

  const labelColor  = darkMode ? 'rgba(255,255,255,0.42)' : 'rgba(11,20,55,0.55)'
  const subColor    = darkMode ? 'rgba(255,255,255,0.28)' : 'rgba(11,20,55,0.45)'

  // Solid color per milestone — avoids WebkitBackgroundClip:text rendering bug
  // on Android browsers (shows a gradient rectangle instead of clipping to text)
  const numColor = streak >= 30
    ? '#FBBF24'                                          // gold
    : streak >= 7
      ? '#38BDF8'                                        // sky blue
      : streak > 0
        ? darkMode ? '#93C5FD' : '#2563EB'               // soft blue / strong blue
        : darkMode ? 'rgba(255,255,255,0.45)' : 'rgba(11,20,55,0.40)'  // muted

  const glowColor = streak >= 30
    ? 'rgba(251,191,36,0.18)'
    : streak >= 7
      ? 'rgba(56,189,248,0.15)'
      : 'rgba(255,255,255,0.06)'

  return (
    <div className="flex flex-col items-center" style={{ paddingTop: 12, paddingBottom: 20 }}>
      {/* Ambient glow behind number */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          transition: 'background 0.6s ease',
        }} />

        {/* The number */}
        <span
          className="font-display leading-none relative"
          style={{
            fontSize: 'clamp(72px, 14vw, 108px)',
            color: numColor,
            letterSpacing: '-0.03em',
            transition: 'color 0.4s ease',
          }}
        >
          {streak}
        </span>
      </div>

      {/* Label */}
      <span
        className="font-sans font-semibold tracking-[0.18em] uppercase mt-2"
        style={{ fontSize: 10, color: labelColor, letterSpacing: '0.18em' }}
      >
        {label ?? 'Day Streak'}
      </span>

      {sublabel && (
        <span className="font-sans mt-1" style={{ fontSize: 11, color: subColor }}>
          {sublabel}
        </span>
      )}

      {formattedStart && daysIn !== null && (
        <span className="font-sans mt-1" style={{ fontSize: 11, color: subColor }}>
          Started {formattedStart} · {daysIn} day{daysIn !== 1 ? 's' : ''} in
        </span>
      )}
    </div>
  )
}
