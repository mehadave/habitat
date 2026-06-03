import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

/* ─────────────────────────────────────────────────────────────
   Aurora background — animated mesh gradient + parallax scroll
───────────────────────────────────────────────────────────── */
function AuroraBackground({ scrollY }: { scrollY: ReturnType<typeof useSpring> }) {
  const y = useTransform(scrollY, (v) => v * 0.35)
  return (
    <motion.div
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', y }}
      aria-hidden
    >
      {/* Base */}
      <div style={{ position: 'absolute', inset: 0, background: '#03040f' }} />
      {/* Aurora blobs */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 20% 0%, rgba(37,99,235,0.30) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 80% 10%, rgba(99,102,241,0.22) 0%, transparent 55%),
          radial-gradient(ellipse 50% 70% at 50% 80%, rgba(6,182,212,0.14) 0%, transparent 60%),
          radial-gradient(ellipse 70% 40% at 10% 70%, rgba(124,58,237,0.18) 0%, transparent 55%)
        `,
        animation: 'aurora 12s ease-in-out infinite alternate',
      }} />
      {/* Noise grain overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '180px 180px',
      }} />
      {/* Grid dots */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
        maskImage: 'radial-gradient(ellipse 85% 85% at 50% 0%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at 50% 0%, black 40%, transparent 100%)',
      }} />
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Animated headline — word-by-word stagger
───────────────────────────────────────────────────────────── */
function AnimatedHeadline({ text, gradient }: { text: string; gradient?: boolean }) {
  const words = text.split(' ')
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.095 } } }}
      style={{ display: 'inline' }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={{ hidden: { opacity: 0, y: 28, filter: 'blur(6px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)' } }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'inline-block', marginRight: '0.28em',
            ...(gradient ? {
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            } : {}),
          }}
        >
          {w}
        </motion.span>
      ))}
    </motion.span>
  )
}

/* ─────────────────────────────────────────────────────────────
   Shimmer button
───────────────────────────────────────────────────────────── */
function ShimmerButton({ children, to, outline }: { children: React.ReactNode; to: string; outline?: boolean }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'inline-block', position: 'relative' }}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{
          position: 'relative', overflow: 'hidden',
          padding: outline ? '12px 28px' : '13px 32px',
          borderRadius: 14,
          background: outline
            ? 'rgba(255,255,255,0.05)'
            : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
          border: outline ? '1px solid rgba(255,255,255,0.13)' : '1px solid rgba(96,165,250,0.4)',
          boxShadow: outline ? 'none' : '0 0 28px rgba(37,99,235,0.45), 0 0 60px rgba(37,99,235,0.15)',
          fontSize: 14, fontWeight: 700,
          color: outline ? 'rgba(255,255,255,0.65)' : '#fff',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        {!outline && (
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 1,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
              width: '60%',
            }}
          />
        )}
        <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
      </motion.div>
    </Link>
  )
}

/* ─────────────────────────────────────────────────────────────
   Bento card — glass with animated glow border
───────────────────────────────────────────────────────────── */
function BentoCard({
  children, style, className, delay = 0, span,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  delay?: number
  span?: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: 24, overflow: 'hidden',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
        border: '1px solid rgba(255,255,255,0.085)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        transition: 'border-color 0.3s',
        ...(hovered ? { borderColor: 'rgba(96,165,250,0.32)' } : {}),
        gridColumn: span,
        ...style,
      }}
      className={className}
    >
      {/* Hover glow */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.14), transparent)',
            }}
          />
        )}
      </AnimatePresence>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Habit card mockup
───────────────────────────────────────────────────────────── */
function HabitMock({ emoji, name, streak, done, delay = 0 }: {
  emoji: string; name: string; streak: number; done?: boolean; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 14,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.82)' }}>{name}</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#60a5fa' }}>{streak}d streak</p>
      </div>
      <motion.div
        animate={done ? { scale: [1, 1.2, 1] } : {}}
        transition={{ delay: delay + 0.6, duration: 0.4 }}
        style={{
          width: 24, height: 24, borderRadius: '50%',
          background: done ? 'rgba(74,222,128,0.20)' : 'rgba(255,255,255,0.06)',
          border: done ? '1.5px solid rgba(74,222,128,0.55)' : '1.5px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: '#4ade80',
        }}
      >
        {done ? '✓' : ''}
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Streak bar
───────────────────────────────────────────────────────────── */
function StreakBar({ label, pct, color, delay = 0 }: { label: string; pct: number; color: string; delay?: number }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', borderRadius: 99, background: color }}
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Calendar heat map
───────────────────────────────────────────────────────────── */
const WEEKS = Array.from({ length: 14 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => {
    const seed = (w * 7 + d) * 17 + 3
    const v = ((seed % 100) + 100) % 100
    return v > 42 ? (v > 70 ? 3 : v > 58 ? 2 : 1) : 0
  })
)
const HEAT = ['rgba(255,255,255,0.05)', 'rgba(37,99,235,0.4)', 'rgba(59,130,246,0.65)', 'rgba(96,165,250,0.85)']

function HeatMap() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {WEEKS.map((week, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {week.map((v, di) => (
            <motion.div
              key={di}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (wi * 7 + di) * 0.006, duration: 0.3 }}
              style={{
                width: 10, height: 10, borderRadius: 3,
                background: HEAT[v],
                border: v > 0 ? '1px solid rgba(96,165,250,0.15)' : '1px solid rgba(255,255,255,0.04)',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Number counter animation
───────────────────────────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef(false)
  return (
    <motion.span
      onViewportEnter={() => {
        if (ref.current) return
        ref.current = true
        let start = 0
        const step = to / 40
        const id = setInterval(() => {
          start += step
          if (start >= to) { setVal(to); clearInterval(id) }
          else setVal(Math.floor(start))
        }, 30)
      }}
    >
      {val}{suffix}
    </motion.span>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────────── */
export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rawScrollY = useMotionValue(0)
  const scrollY = useSpring(rawScrollY, { stiffness: 80, damping: 30 })

  useEffect(() => {
    const onScroll = () => rawScrollY.set(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [rawScrollY])

  // Parallax layers
  const heroY    = useTransform(scrollY, (v) => v * 0.22)
  const orb1Y    = useTransform(scrollY, (v) => v * 0.45)
  const orb2Y    = useTransform(scrollY, (v) => v * 0.28)
  const cardsY   = useTransform(scrollY, (v) => -v * 0.14)

  const { scrollYProgress } = useScroll({ target: containerRef })
  const progressBar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <div
      ref={containerRef}
      style={{ minHeight: '100vh', overflowX: 'hidden', background: '#03040f', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @keyframes aurora {
          0%   { opacity: 0.85; filter: hue-rotate(0deg); }
          50%  { opacity: 1;    filter: hue-rotate(20deg); }
          100% { opacity: 0.85; filter: hue-rotate(-10deg); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 28px rgba(37,99,235,0.42), 0 0 60px rgba(37,99,235,0.15); }
          50%      { box-shadow: 0 0 40px rgba(37,99,235,0.65), 0 0 80px rgba(37,99,235,0.25); }
        }
        @media (max-width: 768px) {
          .bento-grid { grid-template-columns: 1fr !important; }
          .hero-cards  { display: none !important; }
          .steps-grid  { grid-template-columns: 1fr !important; gap: 48px !important; }
          .stats-grid  { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Read progress bar ── */}
      <motion.div style={{
        position: 'fixed', top: 0, left: 0, height: 2, zIndex: 200,
        background: 'linear-gradient(90deg, #2563eb, #818cf8, #38bdf8)',
        width: progressBar,
        transformOrigin: 'left',
      }} />

      {/* ── Aurora parallax background ── */}
      <AuroraBackground scrollY={scrollY} />

      {/* ── Nav ──────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: 60,
          background: 'rgba(3,4,15,0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.img
            src="/favicon.svg" alt="Habitat" width={30} height={30}
            style={{ borderRadius: 8, display: 'block' }}
            whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
          />
          <span style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 19, fontWeight: 700,
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '-0.025em',
          }}>Habit·at</span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/login" style={{
            fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 10,
            color: 'rgba(255,255,255,0.52)', textDecoration: 'none',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.52)')}
          >Sign in</Link>
          <Link to="/signup" style={{
            fontSize: 13, fontWeight: 700,
            padding: '9px 22px', borderRadius: 12,
            background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
            color: '#fff', textDecoration: 'none',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}>Get started →</Link>
        </div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '80px 24px 60px',
      }}>
        {/* Extra parallax orbs in hero */}
        <motion.div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', y: orb1Y }}>
          <div style={{
            position: 'absolute', width: 640, height: 640, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
            top: -160, left: '25%', transform: 'translateX(-50%)',
            filter: 'blur(40px)',
          }} />
        </motion.div>
        <motion.div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', y: orb2Y }}>
          <div style={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
            top: '30%', right: '8%',
            filter: 'blur(50px)',
          }} />
        </motion.div>

        <div style={{ maxWidth: 1120, margin: '0 auto', width: '100%', display: 'flex', gap: 64, alignItems: 'center' }}>

          {/* Text */}
          <motion.div style={{ flex: 1, y: heroY }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '7px 16px', borderRadius: 100,
                background: 'rgba(96,165,250,0.08)',
                border: '1px solid rgba(96,165,250,0.22)',
                fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em',
                color: '#93c5fd', textTransform: 'uppercase', marginBottom: 32,
              }}
            >
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}>✦</motion.span>
              Your daily habit companion
            </motion.div>

            {/* H1 */}
            <h1 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(46px, 6.5vw, 82px)',
              lineHeight: 1.06, letterSpacing: '-0.03em',
              color: 'rgba(255,255,255,0.94)',
              margin: '0 0 26px',
            }}>
              <AnimatedHeadline text="Small habits." />
              <br />
              <AnimatedHeadline text="Big changes." gradient />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              style={{
                fontSize: 17, lineHeight: 1.75, maxWidth: 440,
                color: 'rgba(255,255,255,0.46)', margin: '0 0 44px',
              }}
            >
              Track habits, build routines, and journal your progress —<br />
              all in one beautiful, distraction-free app.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.7 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}
            >
              <ShimmerButton to="/signup">Start for free →</ShimmerButton>
              <ShimmerButton to="/login" outline>Sign in</ShimmerButton>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{ margin: '22px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.22)' }}
            >
              Free forever · No credit card · Works on all devices
            </motion.p>
          </motion.div>

          {/* Floating cards */}
          <motion.div
            className="hero-cards"
            style={{ position: 'relative', width: 300, height: 380, flexShrink: 0, y: cardsY }}
          >
            {/* Glow behind cards */}
            <div style={{
              position: 'absolute', width: 280, height: 200,
              background: 'radial-gradient(ellipse, rgba(37,99,235,0.35), transparent)',
              top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
            }} />
            <motion.div style={{ position: 'absolute', top: 0, left: 16, zIndex: 3 }}
              animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            >
              <HabitMock emoji="🧘" name="Morning meditation" streak={21} done />
            </motion.div>
            <motion.div style={{ position: 'absolute', top: 100, left: 0, zIndex: 2 }}
              animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            >
              <HabitMock emoji="💧" name="Drink 2L of water" streak={8} done />
            </motion.div>
            <motion.div style={{ position: 'absolute', top: 200, left: 24, zIndex: 1 }}
              animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            >
              <HabitMock emoji="📚" name="Read 20 pages" streak={5} />
            </motion.div>
            <motion.div style={{ position: 'absolute', top: 296, left: 8, zIndex: 0 }}
              animate={{ y: [0, -9, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            >
              <HabitMock emoji="🏃" name="Run 3km" streak={12} done />
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            color: 'rgba(255,255,255,0.24)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
          }}
        >
          <span>SCROLL</span>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path d="M1 1l7 8 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </section>

      {/* ── Stats ──────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="stats-grid"
          style={{
            maxWidth: 900, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1, overflow: 'hidden', borderRadius: 22,
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.07)',
          }}
        >
          {[
            { n: 21, suf: '', label: 'days to form a habit' },
            { n: 100, suf: '%', label: 'free to start' },
            { n: 0, suf: 'bs', label: 'no bloat, no noise' },
          ].map(({ n, suf, label }) => (
            <div key={label} style={{
              padding: '36px 24px', textAlign: 'center',
              background: 'rgba(3,4,15,0.72)',
            }}>
              <p style={{
                margin: '0 0 8px',
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 44, fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(148,163,184,0.8))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                <Counter to={n} suffix={suf} />
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Bento features ─────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 24px 100px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 60, maxWidth: 560, margin: '0 auto 60px' }}
        >
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', color: '#93c5fd', textTransform: 'uppercase', marginBottom: 14 }}>Features</p>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(30px, 4vw, 50px)', letterSpacing: '-0.025em',
            color: 'rgba(255,255,255,0.93)', margin: '0 0 16px',
          }}>Everything in one place</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.40)', lineHeight: 1.7, margin: 0 }}>
            A full habit-building toolkit that stays out of your way.
          </p>
        </motion.div>

        <div
          className="bento-grid"
          style={{
            maxWidth: 1060, margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr',
            gridTemplateRows: 'auto auto',
            gap: 14,
          }}
        >
          {/* Card 1 — Streak (tall, left) */}
          <BentoCard delay={0} style={{ gridRow: '1 / 3', padding: 28 }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#60a5fa', textTransform: 'uppercase' }}>Streak Tracking</p>
            <h3 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.90)', fontFamily: "'DM Serif Display', serif" }}>Never break<br />the chain.</h3>
            <p style={{ margin: '0 0 28px', fontSize: 13, color: 'rgba(255,255,255,0.40)', lineHeight: 1.6 }}>Watch your daily streaks compound into lasting change.</p>
            <StreakBar label="Meditation" pct={92} color="linear-gradient(90deg,#2563eb,#60a5fa)" delay={0.1} />
            <StreakBar label="Hydration" pct={78} color="linear-gradient(90deg,#0891b2,#38bdf8)" delay={0.2} />
            <StreakBar label="Reading" pct={65} color="linear-gradient(90deg,#7c3aed,#a78bfa)" delay={0.3} />
            <StreakBar label="Exercise" pct={55} color="linear-gradient(90deg,#059669,#34d399)" delay={0.4} />
            <div style={{ marginTop: 28 }}>
              <HabitMock emoji="🧘" name="Meditation" streak={21} done />
              <HabitMock emoji="💧" name="Hydration" streak={8} done delay={0.1} />
            </div>
          </BentoCard>

          {/* Card 2 — Calendar (top right) */}
          <BentoCard delay={0.1} style={{ padding: '24px 20px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#60a5fa', textTransform: 'uppercase' }}>Calendar</p>
            <h3 style={{ margin: '0 0 18px', fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>Visual history</h3>
            <div style={{ overflow: 'hidden' }}>
              <HeatMap />
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.36)', lineHeight: 1.6 }}>See every completion in a beautiful contribution graph.</p>
          </BentoCard>

          {/* Card 3 — Analytics (top right 2) */}
          <BentoCard delay={0.15} style={{ padding: '24px 20px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#a78bfa', textTransform: 'uppercase' }}>Analytics</p>
            <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>Track progress</h3>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 64 }}>
              {[45, 60, 52, 75, 68, 82, 90].map((h, i) => (
                <motion.div key={i}
                  initial={{ height: 0, opacity: 0 }}
                  whileInView={{ height: `${h}%`, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    flex: 1, borderRadius: '4px 4px 2px 2px',
                    background: i === 6
                      ? 'linear-gradient(to top, #2563eb, #60a5fa)'
                      : 'rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>Last 7 days</p>
          </BentoCard>

          {/* Card 4 — Journal */}
          <BentoCard delay={0.2} style={{ padding: '24px 22px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#34d399', textTransform: 'uppercase' }}>Journal</p>
            <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>Daily reflections</h3>
            <div style={{
              padding: '14px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontStyle: 'italic' }}>
                "Woke up early and meditated for 10 minutes. Feeling focused and ready…"
              </p>
              <p style={{ margin: '10px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.24)' }}>Today · 7:42 AM</p>
            </div>
          </BentoCard>

          {/* Card 5 — Routines */}
          <BentoCard delay={0.25} style={{ padding: '24px 22px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#fb923c', textTransform: 'uppercase' }}>Routines</p>
            <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>Group & conquer</h3>
            {[
              { emoji: '🌅', name: 'Morning', count: 4 },
              { emoji: '🌙', name: 'Evening', count: 3 },
            ].map((r, i) => (
              <motion.div key={r.name}
                initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ fontSize: 18 }}>{r.emoji}</span>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.72)' }}>{r.name}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#93c5fd',
                  background: 'rgba(96,165,250,0.12)',
                  padding: '2px 8px', borderRadius: 100,
                }}>{r.count} habits</span>
              </motion.div>
            ))}
          </BentoCard>
        </div>
      </section>

      {/* ── How it works ───────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 24px 100px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          bottom: '-10%', right: '-8%', filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', color: '#93c5fd', textTransform: 'uppercase', marginBottom: 16 }}>How it works</p>
              <h2 style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.025em',
                color: 'rgba(255,255,255,0.92)', margin: '0 0 48px', lineHeight: 1.2,
              }}>Start in minutes,<br />grow for life.</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { n: '01', title: 'Create your habits', desc: 'Pick an emoji, name it, set your goal. Done in 10 seconds.' },
                  { n: '02', title: 'Check off every day', desc: 'Open the app, tap to complete. Watch streaks build naturally.' },
                  { n: '03', title: 'Watch the pattern', desc: 'Your calendar and analytics reveal every small win compounding.' },
                ].map((s, i) => (
                  <motion.div key={s.n}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    style={{ display: 'flex', gap: 20, paddingBottom: 36, position: 'relative' }}
                  >
                    {/* Line */}
                    {i < 2 && (
                      <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.12 + 0.3, duration: 0.5 }}
                        style={{
                          position: 'absolute', left: 21, top: 44, bottom: 0,
                          width: 1,
                          background: 'linear-gradient(to bottom, rgba(37,99,235,0.5), transparent)',
                          transformOrigin: 'top',
                        }}
                      />
                    )}
                    <div style={{
                      flexShrink: 0, width: 44, height: 44, borderRadius: '50%', zIndex: 1,
                      background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                      boxShadow: '0 0 20px rgba(37,99,235,0.45)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.9)',
                    }}>{s.n}</div>
                    <div style={{ paddingTop: 10 }}>
                      <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>{s.title}</h4>
                      <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.40)', lineHeight: 1.65 }}>{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Week preview card */}
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                borderRadius: 24, padding: '28px 24px',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>This week</p>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#4ade80',
                  background: 'rgba(74,222,128,0.12)',
                  padding: '4px 10px', borderRadius: 100,
                  border: '1px solid rgba(74,222,128,0.25)',
                }}>4/5 habits ✓</span>
              </div>
              {[
                { emoji: '🧘', name: 'Meditation',  days: [1,1,1,1,1,0,0] },
                { emoji: '💧', name: 'Hydration',   days: [1,1,0,1,1,1,0] },
                { emoji: '🏃', name: 'Run 3km',     days: [1,0,1,0,1,0,0] },
                { emoji: '📚', name: 'Reading',     days: [1,1,1,1,0,0,0] },
              ].map((h, i) => (
                <motion.div key={h.name}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}
                >
                  <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{h.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.60)', width: 84 }}>{h.name}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['M','T','W','T','F','S','S'].map((d, j) => (
                      <motion.div key={j}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.06 + j * 0.025, duration: 0.3, type: 'spring' }}
                        style={{
                          width: 26, height: 26, borderRadius: 7,
                          background: h.days[j] ? 'linear-gradient(135deg, rgba(37,99,235,0.75), rgba(96,165,250,0.55))' : 'rgba(255,255,255,0.04)',
                          border: h.days[j] ? '1px solid rgba(96,165,250,0.3)' : '1px solid rgba(255,255,255,0.06)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9.5, fontWeight: 700,
                          color: h.days[j] ? '#fff' : 'rgba(255,255,255,0.2)',
                        }}>{d}</motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 24px 130px' }}>
        <div style={{
          position: 'absolute', width: 700, height: 500,
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.2) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          style={{
            maxWidth: 680, margin: '0 auto', textAlign: 'center',
            position: 'relative',
            padding: '64px 48px',
            borderRadius: 32,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(24px)',
            overflow: 'hidden',
          }}
        >
          {/* Top shimmer line */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.6), transparent)',
              width: '50%',
            }}
          />

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 68, height: 68, borderRadius: 20,
              background: 'linear-gradient(135deg, #0B1437, #1e3a8a)',
              border: '1px solid rgba(96,165,250,0.25)',
              boxShadow: '0 0 40px rgba(37,99,235,0.4)',
              marginBottom: 28,
            }}
          >
            <img src="/favicon.svg" width={38} height={38} alt="Habitat" style={{ borderRadius: 10 }} />
          </motion.div>

          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(30px, 4.5vw, 54px)', letterSpacing: '-0.025em',
            color: 'rgba(255,255,255,0.94)', margin: '0 0 16px', lineHeight: 1.12,
          }}>Your best self<br />starts today.</h2>

          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.40)', margin: '0 auto 40px', maxWidth: 380, lineHeight: 1.75 }}>
            Join thousands building better habits, one small step at a time.
          </p>

          <ShimmerButton to="/signup">Get started — it's free →</ShimmerButton>

          <p style={{ margin: '20px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>
            No credit card · No limits · No excuses
          </p>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/favicon.svg" width={18} height={18} style={{ borderRadius: 5, opacity: 0.55 }} alt="" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.30)' }}>Habit·at</span>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Sign in', '/login']].map(([l, h]) => (
            <Link key={l} to={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.27)', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.60)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.27)')}
            >{l}</Link>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.20)', margin: 0 }}>© 2026 Habit·at</p>
      </footer>
    </div>
  )
}
