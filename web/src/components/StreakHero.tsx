interface StreakHeroProps {
  streak: number
  startDate?: string
}

export function StreakHero({ streak, startDate }: StreakHeroProps) {
  const daysIn = startDate
    ? Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const formattedStart = startDate
    ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="flex flex-col items-center py-6">
      <span
        className="font-medium leading-none"
        style={{ fontSize: 56, color: '#ffffff' }}
      >
        {streak}
      </span>
      <span
        className="uppercase tracking-widest mt-1"
        style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '1px' }}
      >
        Day Streak
      </span>
      {formattedStart && daysIn !== null && (
        <span
          className="mt-1"
          style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}
        >
          Started {formattedStart} · {daysIn} day{daysIn !== 1 ? 's' : ''} in
        </span>
      )}
    </div>
  )
}
