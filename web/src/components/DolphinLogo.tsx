interface DolphinLogoProps {
  size?: number
  className?: string
  color?: 'blue' | 'pink'
}

export function DolphinLogo({ size = 40, className, color = 'blue' }: DolphinLogoProps) {
  const isPink = color === 'pink'

  const bodyBase  = isPink ? '#9d174d' : '#1e3a8a'
  const bodyTop   = isPink ? '#ec4899' : '#2563eb'
  const dorsalFin = isPink ? '#f9a8d4' : '#93c5fd'
  const tailColor = isPink ? '#be185d' : '#1d4ed8'
  const eyeBg     = isPink ? '#fce7f3' : '#dbeafe'
  const eyePupil  = isPink ? '#9d174d' : '#1e3a8a'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Body - dark base */}
      <ellipse cx="28" cy="34" rx="18" ry="13" fill={bodyBase} />

      {/* Upper body - bright highlight */}
      <path
        d="M12 28 Q18 18 28 20 Q38 18 44 28 Q38 26 28 27 Q18 26 12 28Z"
        fill={bodyTop}
      />

      {/* Dorsal fin - sky / pink swept back */}
      <path
        d="M26 20 Q30 10 38 14 Q34 18 30 21Z"
        fill={dorsalFin}
      />

      {/* Left flipper */}
      <path
        d="M13 34 Q8 38 10 44 Q14 40 16 36Z"
        fill={bodyBase}
      />

      {/* Right flipper */}
      <path
        d="M42 34 Q46 37 45 42 Q42 39 40 36Z"
        fill={bodyBase}
      />

      {/* Tail - forked */}
      <path
        d="M44 38 Q52 32 56 26 Q52 30 48 34 Q54 26 56 18 Q50 24 46 32Z"
        fill={tailColor}
      />

      {/* Eye white */}
      <ellipse cx="22" cy="27" rx="4" ry="3.5" fill={eyeBg} />

      {/* Pupil */}
      <circle cx="22.5" cy="27" r="2" fill={eyePupil} />

      {/* Eye highlight */}
      <circle cx="23.5" cy="25.8" r="0.8" fill="#ffffff" />

      {/* Smile */}
      <path
        d="M17 31 Q20 33 23 31"
        stroke={tailColor}
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Book - white rounded rectangle */}
      <rect x="10" y="36" width="14" height="10" rx="1.5" fill="#ffffff" />

      {/* Book spine */}
      <line x1="17" y1="36" x2="17" y2="46" stroke="#cbd5e1" strokeWidth="0.8" />

      {/* Book pages open V at top */}
      <path d="M10 37 Q13.5 34 17 37" stroke="#cbd5e1" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      <path d="M17 37 Q20.5 34 24 37" stroke="#cbd5e1" strokeWidth="0.7" fill="none" strokeLinecap="round" />

      {/* Book text lines left page */}
      <rect x="11.5" y="39" width="4" height="1" rx="0.4" fill="#94a3b8" />
      <rect x="11.5" y="41" width="4" height="1" rx="0.4" fill="#cbd5e1" />
      <rect x="11.5" y="43" width="3" height="1" rx="0.4" fill="#cbd5e1" />

      {/* Book text lines right page */}
      <rect x="18" y="39" width="4" height="1" rx="0.4" fill="#94a3b8" />
      <rect x="18" y="41" width="4" height="1" rx="0.4" fill="#cbd5e1" />
      <rect x="18" y="43" width="3" height="1" rx="0.4" fill="#cbd5e1" />
    </svg>
  )
}
