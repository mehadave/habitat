interface DolphinLogoProps {
  size?: number
  className?: string
}

export function DolphinLogo({ size = 40, className }: DolphinLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ====== BUBBLE 1: Open Book — upper left ====== */}
      <circle cx="9" cy="9" r="7.5" fill="rgba(147,197,253,0.2)" stroke="#93c5fd" strokeWidth="0.65"/>
      {/* Left page */}
      <rect x="4.8" y="5.8" width="3.5" height="5.5" rx="0.5" fill="white" opacity="0.9"/>
      {/* Right page */}
      <rect x="8.3" y="5.8" width="3.5" height="5.5" rx="0.5" fill="white" opacity="0.75"/>
      {/* Spine */}
      <line x1="8.3" y1="5.8" x2="8.3" y2="11.3" stroke="#93c5fd" strokeWidth="0.5"/>
      {/* V open pages at top */}
      <path d="M4.8 6.5 Q6.5 4.8 8.3 6.5" stroke="#cbd5e1" strokeWidth="0.5" fill="none" strokeLinecap="round"/>
      <path d="M8.3 6.5 Q10 4.8 11.8 6.5" stroke="#cbd5e1" strokeWidth="0.5" fill="none" strokeLinecap="round"/>
      {/* Text lines — left page */}
      <rect x="5.4" y="7.8" width="2.2" height="0.65" rx="0.3" fill="#94a3b8" opacity="0.85"/>
      <rect x="5.4" y="9.1" width="2.2" height="0.65" rx="0.3" fill="#94a3b8" opacity="0.65"/>
      <rect x="5.4" y="10.3" width="1.5" height="0.65" rx="0.3" fill="#94a3b8" opacity="0.5"/>
      {/* Text lines — right page */}
      <rect x="8.9" y="7.8" width="2.2" height="0.65" rx="0.3" fill="#94a3b8" opacity="0.85"/>
      <rect x="8.9" y="9.1" width="2.2" height="0.65" rx="0.3" fill="#94a3b8" opacity="0.65"/>
      <rect x="8.9" y="10.3" width="1.5" height="0.65" rx="0.3" fill="#94a3b8" opacity="0.5"/>

      {/* ====== BUBBLE 2: Two 5lb Dumbbells — upper right ====== */}
      <circle cx="51" cy="9" r="7.5" fill="rgba(147,197,253,0.2)" stroke="#93c5fd" strokeWidth="0.65"/>
      {/* Bar */}
      <rect x="44.5" y="8.3" width="13" height="1.4" rx="0.7" fill="#93c5fd"/>
      {/* Left plate outer */}
      <rect x="43.2" y="6.8" width="2.6" height="4.4" rx="1" fill="#60a5fa"/>
      {/* Left plate inner */}
      <rect x="43.8" y="7.6" width="1.4" height="2.8" rx="0.5" fill="#2563eb"/>
      {/* Right plate outer */}
      <rect x="56.2" y="6.8" width="2.6" height="4.4" rx="1" fill="#60a5fa"/>
      {/* Right plate inner */}
      <rect x="56.8" y="7.6" width="1.4" height="2.8" rx="0.5" fill="#2563eb"/>
      {/* "5" label on left weight (tiny rects approximating "5") */}
      <rect x="44.1" y="8.4" width="0.9" height="0.5" rx="0.2" fill="white" opacity="0.7"/>
      <rect x="44.1" y="9.1" width="0.9" height="0.5" rx="0.2" fill="white" opacity="0.7"/>
      <rect x="44.1" y="9.8" width="0.9" height="0.5" rx="0.2" fill="white" opacity="0.7"/>
      {/* "5" label on right weight */}
      <rect x="57.0" y="8.4" width="0.9" height="0.5" rx="0.2" fill="white" opacity="0.7"/>
      <rect x="57.0" y="9.1" width="0.9" height="0.5" rx="0.2" fill="white" opacity="0.7"/>
      <rect x="57.0" y="9.8" width="0.9" height="0.5" rx="0.2" fill="white" opacity="0.7"/>

      {/* ====== BUBBLE 3: Veggie Meal Plate — lower right ====== */}
      <circle cx="52" cy="51" r="7.5" fill="rgba(147,197,253,0.2)" stroke="#93c5fd" strokeWidth="0.65"/>
      {/* Plate outer rim */}
      <circle cx="52" cy="51" r="5.8" fill="white" opacity="0.88"/>
      {/* Plate inner */}
      <circle cx="52" cy="51" r="4.8" fill="#f0fdf4"/>
      {/* Broccoli top center — green blob */}
      <circle cx="52" cy="48.2" r="1.5" fill="#22c55e"/>
      <circle cx="50.8" cy="48.8" r="0.9" fill="#16a34a"/>
      <circle cx="53.2" cy="48.8" r="0.9" fill="#16a34a"/>
      {/* Carrot — right, orange oval */}
      <ellipse cx="54.8" cy="52.2" rx="0.7" ry="1.6" fill="#f97316" transform="rotate(25 54.8 52.2)"/>
      {/* Tomato — left, red circle */}
      <circle cx="49.4" cy="52.5" r="1.3" fill="#ef4444"/>
      <circle cx="49.1" cy="52.1" r="0.45" fill="#fca5a5" opacity="0.7"/>
      {/* Corn — bottom center, yellow */}
      <ellipse cx="52.5" cy="54.2" rx="0.9" ry="0.6" fill="#eab308"/>
      <circle cx="51.8" cy="54.2" r="0.4" fill="#ca8a04" opacity="0.6"/>
      <circle cx="53.2" cy="54.2" r="0.4" fill="#ca8a04" opacity="0.6"/>
      {/* Peas — tiny greens */}
      <circle cx="50.8" cy="50.5" r="0.5" fill="#4ade80"/>
      <circle cx="53.8" cy="50.2" r="0.5" fill="#4ade80"/>
      {/* Fork beside plate */}
      <line x1="58.8" y1="48" x2="58.8" y2="54.5" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="58.2" y1="48.5" x2="58.2" y2="51.2" stroke="#94a3b8" strokeWidth="0.45" strokeLinecap="round"/>
      <line x1="59.4" y1="48.5" x2="59.4" y2="51.2" stroke="#94a3b8" strokeWidth="0.45" strokeLinecap="round"/>

      {/* ====== DOLPHIN — front-facing, wiggly tail ====== */}

      {/* Head */}
      <ellipse cx="29" cy="25" rx="12" ry="11" fill="#1e3a8a"/>
      {/* Forehead bright blue highlight */}
      <ellipse cx="29" cy="20" rx="10" ry="6.5" fill="#2563eb"/>
      {/* Chin/belly lighter patch */}
      <ellipse cx="29" cy="31" rx="7" ry="4" fill="#2563eb" opacity="0.35"/>

      {/* Dorsal fin — swept back top */}
      <path d="M31 14 Q37 4 44 8 Q40 13 35 15.5Z" fill="#93c5fd"/>

      {/* Body */}
      <path d="M19 32 Q24 38 29 39.5 Q34 38 39 32 Q37 45 29 48.5 Q21 45 19 32Z" fill="#1e3a8a"/>
      {/* Body belly highlight */}
      <path d="M23 33 Q27 37 29 37.5 Q31 37 35 33 Q33 42 29 44.5 Q25 42 23 33Z" fill="#2563eb" opacity="0.35"/>

      {/* Left flipper */}
      <path d="M18 31 Q9 35 8 44 Q15 38 20 34Z" fill="#1d4ed8"/>
      {/* Right flipper */}
      <path d="M40 31 Q49 35 50 44 Q43 38 38 34Z" fill="#1d4ed8"/>

      {/* Wiggly tail — bent, forked */}
      {/* Left lobe */}
      <path d="M22 48 Q16 53 12 57 Q17 52 23 50Z" fill="#1d4ed8"/>
      {/* Right lobe */}
      <path d="M36 48 Q43 53 47 57 Q42 51 35 50Z" fill="#1d4ed8"/>
      {/* Tail connection arc (the wiggle) */}
      <path d="M22 48 Q29 55 36 48" fill="#1d4ed8" opacity="0.7"/>
      {/* Wiggle highlight */}
      <path d="M23 49.5 Q29 55.5 35 49.5" stroke="#2563eb" strokeWidth="0.9" fill="none" opacity="0.5" strokeLinecap="round"/>

      {/* ====== FACE ====== */}

      {/* LEFT EYE */}
      <ellipse cx="21.5" cy="23" rx="4.5" ry="4.5" fill="#dbeafe"/>
      <circle cx="21.5" cy="23" r="3.2" fill="#1e3a8a"/>
      <circle cx="21.5" cy="23" r="2.5" fill="#2563eb"/>
      <circle cx="21.8" cy="23.3" r="1.5" fill="#0f172a"/>
      <circle cx="23" cy="21.7" r="1.1" fill="white"/>
      <circle cx="20.3" cy="24.3" r="0.45" fill="rgba(255,255,255,0.65)"/>
      {/* Left eyelash */}
      <path d="M17.5 20.2 Q21.5 17.5 25.5 20.2" stroke="#1e3a8a" strokeWidth="1" strokeLinecap="round" fill="none"/>

      {/* RIGHT EYE */}
      <ellipse cx="36.5" cy="23" rx="4.5" ry="4.5" fill="#dbeafe"/>
      <circle cx="36.5" cy="23" r="3.2" fill="#1e3a8a"/>
      <circle cx="36.5" cy="23" r="2.5" fill="#2563eb"/>
      <circle cx="36.8" cy="23.3" r="1.5" fill="#0f172a"/>
      <circle cx="38" cy="21.7" r="1.1" fill="white"/>
      <circle cx="35.3" cy="24.3" r="0.45" fill="rgba(255,255,255,0.65)"/>
      {/* Right eyelash */}
      <path d="M32.5 20.2 Q36.5 17.5 40.5 20.2" stroke="#1e3a8a" strokeWidth="1" strokeLinecap="round" fill="none"/>

      {/* Nose dots */}
      <circle cx="27.5" cy="29.5" r="0.65" fill="#1e3a8a" opacity="0.5"/>
      <circle cx="30.5" cy="29.5" r="0.65" fill="#1e3a8a" opacity="0.5"/>

      {/* Smile */}
      <path d="M22 31 Q29 36.5 36 31" stroke="#1d4ed8" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M22 31 Q29 36.5 36 31 Q32 34.5 29 35 Q26 34.5 22 31Z" fill="#1d4ed8" opacity="0.18"/>

      {/* Blush both cheeks */}
      <ellipse cx="16.5" cy="27" rx="2.5" ry="1.5" fill="#f9a8d4" opacity="0.5"/>
      <ellipse cx="41.5" cy="27" rx="2.5" ry="1.5" fill="#f9a8d4" opacity="0.5"/>

      {/* Teeny water bubbles floating near dolphin */}
      <circle cx="46" cy="20" r="1.3" fill="none" stroke="#93c5fd" strokeWidth="0.6" opacity="0.55"/>
      <circle cx="48.5" cy="16" r="0.75" fill="none" stroke="#93c5fd" strokeWidth="0.5" opacity="0.45"/>
      <circle cx="10" cy="19" r="0.9" fill="none" stroke="#93c5fd" strokeWidth="0.5" opacity="0.45"/>
    </svg>
  )
}
