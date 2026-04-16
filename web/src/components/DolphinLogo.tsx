interface DolphinLogoProps {
  size?: number
  className?: string
  color?: 'blue' | 'pink'
}

export function DolphinLogo({ size = 40, className, color = 'blue' }: DolphinLogoProps) {
  const isPink = color === 'pink'
  const body    = isPink ? '#F9A8D4' : '#60A5FA'
  const bodyMid = isPink ? '#F472B6' : '#38BDF8'
  const bodyDark = isPink ? '#EC4899' : '#2563EB'
  const belly   = isPink ? '#FDE8F3' : '#DBEAFE'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 68 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ── Body — sleek torpedo profile, facing right ── */}
      {/* Upper edge: tail root → shoulder → back → head */}
      {/* Lower edge: head → belly → tail root */}
      <path
        d="M62,22
           C58,17 52,14 44,14
           C36,14 28,15 20,17
           C14,18 10,21 8,25
           C10,29 14,32 20,33
           C28,35 36,36 44,36
           C52,36 58,33 62,28
           Z"
        fill={body}
      />

      {/* ── Belly highlight ── lighter ventral strip */}
      <path
        d="M60,27
           C56,32 50,35 44,36
           C36,37 28,36 20,34
           C14,33 10,31 8,29
           C12,30 18,32 26,33
           C36,34 48,33 56,29
           Z"
        fill={belly}
        opacity="0.65"
      />

      {/* ── Beak / rostrum ── long pointed snout */}
      <path
        d="M62,22
           C60,19 58,17 56,17
           C54,17 52,18 52,18
           L66,20
           L66,24
           L52,23
           C52,23 54,24 56,25
           C58,26 60,24 62,28
           Z"
        fill={bodyMid}
      />

      {/* ── Dorsal fin ── prominent swept-back triangle */}
      <path
        d="M42,14
           C40,8 36,2 34,2
           C32,4 31,10 33,14
           Z"
        fill={bodyDark}
      />

      {/* ── Tail flukes ── forked */}
      {/* Upper lobe */}
      <path
        d="M8,25
           C6,21 2,18 2,16
           C4,17 7,21 9,24
           Z"
        fill={bodyDark}
      />
      {/* Lower lobe */}
      <path
        d="M8,25
           C6,29 2,34 2,36
           C4,35 7,31 9,27
           Z"
        fill={bodyDark}
      />

      {/* ── Pectoral flipper ── */}
      <path
        d="M30,33
           C26,40 20,45 18,43
           C20,41 26,37 28,33
           Z"
        fill={bodyDark}
        opacity="0.7"
      />

      {/* ── Eye ── */}
      <ellipse cx="54" cy="20" rx="2.8" ry="2.4" fill="white" />
      <circle cx="54.5" cy="20" r="1.5" fill="#1a2744" />
      <circle cx="55.2" cy="19.3" r="0.55" fill="white" />

      {/* ── Melon highlight ── subtle sheen on forehead */}
      <ellipse
        cx="55" cy="17" rx="5" ry="3"
        fill="white"
        opacity="0.12"
        transform="rotate(-10 55 17)"
      />

      {/* ── Smile ── */}
      <path
        d="M60,26 Q57,28 55,27"
        stroke={bodyDark}
        strokeWidth="0.85"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
