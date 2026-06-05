import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Link } from 'react-router-dom'

/* ─── Fonts (same as app) ───────────────────────────
   Body:    Plus Jakarta Sans (400 500 600 700 800)
   Display: DM Serif Display
   Both loaded in index.html via Google Fonts
─────────────────────────────────────────────────── */

const BRAND   = '#2563eb'
const BRAND_L = '#60a5fa'
const BG      = '#080E26'

/* ─── Parallax background — clean deep navy, two soft orbs, no dots ── */
function ParallaxBg({ scrollY }: { scrollY: ReturnType<typeof useSpring> }) {
  const y1 = useTransform(scrollY, v => v * 0.28)
  const y2 = useTransform(scrollY, v => v * 0.16)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0A1228 0%, #0C1540 55%, #08102A 100%)` }} />
      <motion.div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', top: -260, left: '30%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(37,99,235,0.13) 0%, transparent 68%)', filter: 'blur(60px)', y: y1 }} />
      <motion.div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', bottom: '5%', right: '-10%', background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 65%)', filter: 'blur(70px)', y: y2 }} />
    </div>
  )
}

/* ─── Word-by-word headline ── */
function AnimWord({ text, gradient }: { text: string; gradient?: boolean }) {
  return (
    <motion.span initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.09 } } }} style={{ display: 'inline' }}>
      {text.split(' ').map((w, i) => (
        <motion.span key={i}
          variants={{ hidden: { opacity: 0, y: 24, filter: 'blur(4px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)' } }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'inline-block', marginRight: '0.26em',
            ...(gradient ? { background: `linear-gradient(125deg, ${BRAND_L} 0%, #a78bfa 60%, #38bdf8 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}),
          }}>{w}</motion.span>
      ))}
    </motion.span>
  )
}

/* ─── CTA button ── */
function Btn({ to, children, outline }: { to: string; children: React.ReactNode; outline?: boolean }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'inline-block' }}>
      <motion.div whileHover={{ scale: 1.035 }} whileTap={{ scale: 0.97 }} style={{
        position: 'relative', overflow: 'hidden',
        padding: outline ? '12px 26px' : '13px 32px',
        borderRadius: 14,
        background: outline ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, #1d4ed8, ${BRAND}, #3b82f6)`,
        border: outline ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(96,165,250,0.35)',
        boxShadow: outline ? 'none' : '0 0 32px rgba(37,99,235,0.40)',
        fontSize: 14, fontWeight: 700,
        color: outline ? 'rgba(255,255,255,0.70)' : '#fff',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {!outline && (
          <motion.div animate={{ x: ['-100%', '220%'] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'linear', repeatDelay: 1.6 }}
            style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)', width: '55%', zIndex: 1 }} />
        )}
        <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
      </motion.div>
    </Link>
  )
}

/* ─── Feature card — marketing-friendly, emoji-led ── */
function FeatureCard({ emoji, color, title, body, delay = 0 }: {
  emoji: string; color: string; title: string; body: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 22,
        padding: '28px 24px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 16, marginBottom: 18,
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26,
        boxShadow: `0 8px 24px ${color.replace('0.18', '0.28')}`,
      }}>{emoji}</div>
      <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 800, color: 'rgba(255,255,255,0.95)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", lineHeight: 1.3 }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.56)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{body}</p>
    </motion.div>
  )
}

/* ─── Step card ── */
function StepCard({ n, title, desc, delay = 0 }: { n: string; title: string; desc: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}
    >
      <div style={{
        flexShrink: 0, width: 46, height: 46, borderRadius: '50%',
        background: `linear-gradient(135deg, #1d4ed8, ${BRAND_L})`,
        boxShadow: '0 0 24px rgba(37,99,235,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, color: '#fff',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}>{n}</div>
      <div style={{ paddingTop: 8 }}>
        <h4 style={{ margin: '0 0 7px', fontSize: 17, fontWeight: 800, color: 'rgba(255,255,255,0.94)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{title}</h4>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.54)', lineHeight: 1.7, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{desc}</p>
      </div>
    </motion.div>
  )
}

/* ─── Habit row (week preview) ── */
function HabitRow({ emoji, name, days, delay = 0 }: { emoji: string; name: string; days: number[]; delay?: number }) {
  const DAY = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.45 }}
      style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}
    >
      <span style={{ fontSize: 17, width: 22 }}>{emoji}</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.70)', width: 82, flexShrink: 0, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{name}</span>
      <div style={{ display: 'flex', gap: 5 }}>
        {DAY.map((d, j) => (
          <motion.div key={j}
            initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
            transition={{ delay: delay + j * 0.03 + 0.15, duration: 0.28, type: 'spring', stiffness: 280 }}
            style={{
              width: 27, height: 27, borderRadius: 8,
              background: days[j] ? `linear-gradient(135deg, rgba(37,99,235,0.80), rgba(96,165,250,0.60))` : 'rgba(255,255,255,0.05)',
              border: days[j] ? '1px solid rgba(96,165,250,0.30)' : '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9.5, fontWeight: 700, color: days[j] ? '#fff' : 'rgba(255,255,255,0.22)',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}>{d}</motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Main ── */
export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null)
  const raw = useMotionValue(0)
  const scrollY = useSpring(raw, { stiffness: 80, damping: 30 })

  useEffect(() => {
    const fn = () => raw.set(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [raw])

  const { scrollYProgress } = useScroll({ target: containerRef })
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const heroY = useTransform(scrollY, v => v * 0.18)

  return (
    <div ref={containerRef} style={{ minHeight: '100vh', overflowX: 'hidden', background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes pulse-btn { 0%,100%{box-shadow:0 0 28px rgba(37,99,235,0.38)} 50%{box-shadow:0 0 44px rgba(37,99,235,0.60)} }
        @media(max-width:768px){
          .l-two-col{grid-template-columns:1fr!important}
          .l-three-col{grid-template-columns:1fr!important}
          .l-hero-visual{display:none!important}
          .l-stats{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

      {/* Progress bar */}
      <motion.div style={{ position: 'fixed', top: 0, left: 0, height: 2, zIndex: 200, background: `linear-gradient(90deg,${BRAND},#818cf8,#38bdf8)`, width: bar, transformOrigin: 'left' }} />

      <ParallaxBg scrollY={scrollY} />

      {/* ── Nav ─────────────────────────────── */}
      <motion.nav
        initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 36px', height: 62,
          background: 'rgba(8,14,38,0.78)',
          backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.img src="/favicon.svg" alt="Habitat" width={30} height={30}
            style={{ borderRadius: 8 }}
            whileHover={{ rotate: [-4, 4, 0], transition: { duration: 0.4 } }} />
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.02em' }}>Habit·at</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/login" style={{ fontSize: 13.5, fontWeight: 600, padding: '8px 18px', borderRadius: 10, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.90)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
          >Sign in</Link>
          <Link to="/signup" style={{
            fontSize: 13.5, fontWeight: 700, padding: '9px 22px', borderRadius: 12, color: '#fff', textDecoration: 'none',
            background: `linear-gradient(135deg, #1d4ed8, ${BRAND})`,
            animation: 'pulse-btn 3s ease-in-out infinite',
          }}>Get started →</Link>
        </div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 24px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: 56 }}>

          {/* Text */}
          <motion.div style={{ flex: 1, y: heroY }}>
            <motion.div initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, delay: 0.05 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 100, background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.24)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: BRAND_L, textTransform: 'uppercase', marginBottom: 30 }}>
              <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>✦</motion.span>
              The habit app you'll actually use
            </motion.div>

            <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(44px, 6.2vw, 80px)', lineHeight: 1.06, letterSpacing: '-0.028em', margin: '0 0 24px', color: '#fff' }}>
              <AnimWord text="Small habits." /><br />
              <AnimWord text="Big changes." gradient />
            </h1>

            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.56 }}
              style={{ fontSize: 17, lineHeight: 1.78, maxWidth: 460, color: 'rgba(255,255,255,0.65)', margin: '0 0 40px', fontWeight: 400 }}>
              Track habits, build your daily routines, and journal your progress — beautifully designed for people who want to actually change.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.70 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <Btn to="/signup">Start for free →</Btn>
              <Btn to="/login" outline>Sign in</Btn>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
              style={{ display: 'flex', gap: 24, marginTop: 28, flexWrap: 'wrap' }}>
              {[['✦', 'Free forever'], ['🔒', 'Private & secure'], ['📱', 'Works on all devices']].map(([icon, label]) => (
                <span key={label} style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.40)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: BRAND_L }}>{icon}</span>{label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero visual — floating habit cards */}
          <div className="l-hero-visual" style={{ position: 'relative', width: 310, flexShrink: 0 }}>
            <div style={{ position: 'absolute', width: 300, height: 240, background: 'radial-gradient(ellipse, rgba(37,99,235,0.28), transparent)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(48px)', pointerEvents: 'none' }} />
            {([
              { emoji: '🧘', name: 'Morning meditation', streak: '21 day streak 🔥', done: true,  top: 0,   left: 20,  delay: 0.3,  dur: 4.2 },
              { emoji: '💧', name: 'Drink 2L of water',  streak: '8 day streak 🔥',  done: true,  top: 110, left: 0,   delay: 0.5,  dur: 5.0 },
              { emoji: '📚', name: 'Read 20 pages',      streak: '5 day streak',     done: false, top: 220, left: 28,  delay: 0.7,  dur: 3.8 },
              { emoji: '🏃', name: 'Run 3km',            streak: '12 day streak 🔥', done: true,  top: 326, left: 8,   delay: 0.9,  dur: 4.6 },
            ] as const).map(({ emoji, name, streak, done, top, left, delay, dur }) => (
              <motion.div key={name} style={{ position: 'absolute', top, left }}
                animate={{ y: [0, -10, 0] }} transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: dur * 0.3 }}
                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                // @ts-expect-error framer delay
                transition2={{ delay, duration: 0.6 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 15px', borderRadius: 16, minWidth: 230, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.28)' }}>
                  <span style={{ fontSize: 22 }}>{emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>{name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: BRAND_L, fontWeight: 600 }}>{streak}</p>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? 'rgba(74,222,128,0.20)' : 'rgba(255,255,255,0.06)', border: done ? '1.5px solid rgba(74,222,128,0.55)' : '1.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#4ade80', fontWeight: 700 }}>{done ? '✓' : ''}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div animate={{ y: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2.2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.26)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em' }}>
          <span>SCROLL</span>
          <svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M1 1l6 7 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.div>
      </section>

      {/* ── Social proof / stats ─────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="l-stats"
          style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, borderRadius: 22, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
          {[
            { n: '21 days', sub: 'to form a lasting habit' },
            { n: 'Free', sub: 'forever, no hidden fees' },
            { n: '1 tap', sub: 'to complete any habit' },
          ].map(({ n, sub }) => (
            <div key={sub} style={{ padding: '30px 20px', textAlign: 'center', background: 'rgba(8,14,38,0.75)' }}>
              <p style={{ margin: '0 0 6px', fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 34, fontWeight: 700, color: '#fff' }}>{n}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.42)', fontWeight: 600, letterSpacing: '0.03em' }}>{sub}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features — marketing-friendly ────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 24px 96px' }}>
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.48 }}
          style={{ textAlign: 'center', marginBottom: 60, maxWidth: 540, margin: '0 auto 60px' }}>
          <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.09em', color: BRAND_L, textTransform: 'uppercase', marginBottom: 14 }}>Why Habitat?</p>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(30px, 4vw, 50px)', letterSpacing: '-0.022em', color: '#fff', margin: '0 0 14px', lineHeight: 1.12 }}>
            Everything you need to grow.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, margin: 0, fontWeight: 400 }}>Simple enough to open every day. Powerful enough to actually change your life.</p>
        </motion.div>

        <div className="l-three-col" style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          <FeatureCard delay={0}    emoji="🔥" color="rgba(234,88,12,0.18)"   title="Watch your streaks grow"        body="Every day you show up, your streak climbs. That number becomes your motivation to keep going — no willpower needed." />
          <FeatureCard delay={0.07} emoji="🗓️" color="rgba(37,99,235,0.18)"   title="See your whole year at a glance" body="A beautiful calendar view shows you exactly which days you showed up. Spotting your patterns makes it easy to stay consistent." />
          <FeatureCard delay={0.14} emoji="🎯" color="rgba(124,58,237,0.18)"  title="Group habits into routines"      body="Build a morning flow, an evening wind-down — whatever fits your life. Habit·at groups your habits so your day runs itself." />
          <FeatureCard delay={0.21} emoji="📓" color="rgba(5,150,105,0.18)"   title="Journal without the pressure"    body="A clean, private space to write what's on your mind. Pair your daily check-in with a short reflection and grow faster." />
          <FeatureCard delay={0.28} emoji="📈" color="rgba(6,182,212,0.18)"   title="Progress you can actually see"   body="Simple, clear analytics show how you're trending week to week — no confusing dashboards, just the insight you need." />
          <FeatureCard delay={0.35} emoji="🔒" color="rgba(99,102,241,0.18)"  title="Private when it matters"         body="Some habits are personal. One tap keeps sensitive habits hidden and blurred — only you decide what's visible." />
        </div>
      </section>

      {/* ── How it works ─────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 24px 100px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 640, height: 500, background: 'radial-gradient(ellipse, rgba(99,102,241,0.10), transparent)', bottom: '-5%', right: '-8%', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <div className="l-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

            {/* Steps */}
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
              <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.09em', color: BRAND_L, textTransform: 'uppercase', marginBottom: 16 }}>How it works</p>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.022em', color: '#fff', margin: '0 0 48px', lineHeight: 1.15 }}>
                Up and running<br />in 60 seconds.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { n: '01', title: 'Pick your habits', desc: 'Add anything — from drinking water to learning Spanish. Give it an emoji, and you\'re done.' },
                  { n: '02', title: 'Tap to complete', desc: 'Open the app every day, tap the circle. That\'s it. Watch your streak tick up.' },
                  { n: '03', title: 'See yourself improve', desc: 'Your calendar fills in. Your streaks compound. Progress you can actually feel.' },
                ].map((s, i) => (
                  <div key={s.n} style={{ paddingBottom: i < 2 ? 36 : 0, position: 'relative' }}>
                    {i < 2 && (
                      <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.12 + 0.28, duration: 0.5 }}
                        style={{ position: 'absolute', left: 22, top: 46, bottom: 0, width: 1, background: 'linear-gradient(to bottom, rgba(37,99,235,0.45), transparent)', transformOrigin: 'top' }} />
                    )}
                    <StepCard delay={i * 0.12} {...s} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Week preview card */}
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.1 }}
              style={{ borderRadius: 24, padding: '28px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(18px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'rgba(255,255,255,0.62)' }}>This week</p>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.12)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(74,222,128,0.25)' }}>4 of 5 ✓</span>
              </div>
              <HabitRow emoji="🧘" name="Meditation"  days={[1,1,1,1,1,0,0]} delay={0.1} />
              <HabitRow emoji="💧" name="Hydration"   days={[1,1,0,1,1,1,0]} delay={0.2} />
              <HabitRow emoji="🏃" name="Run 3km"     days={[1,0,1,0,1,0,0]} delay={0.3} />
              <HabitRow emoji="📚" name="Reading"     days={[1,1,1,1,0,0,0]} delay={0.4} />

              {/* Streak highlight */}
              <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.7, duration: 0.45 }}
                style={{ marginTop: 20, padding: '14px 16px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(99,102,241,0.14))', border: '1px solid rgba(96,165,250,0.22)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 26 }}>🔥</span>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>21-day streak!</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.48)', fontWeight: 500 }}>You're building something real.</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 24px 120px' }}>
        <div style={{ position: 'absolute', width: 700, height: 480, background: 'radial-gradient(ellipse, rgba(37,99,235,0.18), transparent)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ maxWidth: 660, margin: '0 auto', textAlign: 'center', position: 'relative', padding: '64px 40px', borderRadius: 32, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(24px)', overflow: 'hidden' }}>

          {/* Sweep shimmer */}
          <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.55), transparent)', width: '45%' }} />

          {/* Brand identity — text, not small icon */}
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <img src="/icon-192.svg" alt="" width={48} height={48} style={{ borderRadius: 14, boxShadow: '0 0 32px rgba(37,99,235,0.40)' }} />
            <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 38, fontWeight: 700, color: '#fff', letterSpacing: '-0.025em' }}>Habit·at</span>
          </motion.div>

          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(28px, 4.2vw, 52px)', letterSpacing: '-0.025em', color: '#fff', margin: '0 0 16px', lineHeight: 1.12 }}>
            Your best self<br />starts today.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.52)', margin: '0 auto 36px', maxWidth: 360, lineHeight: 1.78, fontWeight: 400 }}>
            Small steps. Every day. That's how lives actually change.
          </p>
          <Btn to="/signup">Get started — it's free →</Btn>
          <p style={{ margin: '18px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.24)', fontWeight: 500 }}>No credit card · No limits · No excuses</p>
        </motion.div>
      </section>

      {/* ── Footer — matches app Footer component ── */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.07)', padding: '18px 32px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.30)', fontWeight: 500 }}>Made with ❤️ in California</p>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.22)', fontWeight: 400 }}>Copyright © Habitat 2026. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
          <a href="mailto:davemeha60@gmail.com" style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.72)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.30)')}>Contact</a>
          <Link to="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.72)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.30)')}>Privacy</Link>
          <Link to="/terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.72)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.30)')}>Terms</Link>
        </div>
      </footer>
    </div>
  )
}
