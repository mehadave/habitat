import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../store/uiStore'
import { DolphinLogo } from '../../components/DolphinLogo'
import { Footer } from '../../components/Footer'

function buildTokens(darkMode: boolean) {
  return darkMode ? {
    pageBg: '#0B1120',
    pageBgImage: 'radial-gradient(ellipse at 20% 20%, rgba(56,189,248,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(14,165,233,0.10) 0%, transparent 50%)',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.5)',
    textSub: 'rgba(255,255,255,0.3)',
    cardBg: 'rgba(255,255,255,0.05)',
    cardBorder: '1px solid rgba(255,255,255,0.09)',
    inputBg: 'rgba(255,255,255,0.07)',
    inputBorder: '1px solid rgba(255,255,255,0.12)',
    inputColor: '#fff',
    divider: 'rgba(255,255,255,0.1)',
    googleBg: 'rgba(255,255,255,0.07)',
    googleBorder: '1px solid rgba(255,255,255,0.12)',
    googleText: 'rgba(255,255,255,0.85)',
    linkColor: 'rgba(255,255,255,0.45)',
  } : {
    pageBg: '#F0F4FF',
    pageBgImage: 'radial-gradient(ellipse at 20% 20%, rgba(37,99,235,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(147,197,253,0.10) 0%, transparent 50%)',
    text: '#0B1437',
    textMuted: 'rgba(11,20,55,0.55)',
    textSub: 'rgba(11,20,55,0.35)',
    cardBg: 'rgba(255,255,255,0.85)',
    cardBorder: '1px solid rgba(11,20,55,0.10)',
    inputBg: 'rgba(11,20,55,0.05)',
    inputBorder: '1px solid rgba(11,20,55,0.12)',
    inputColor: '#0B1437',
    divider: 'rgba(11,20,55,0.1)',
    googleBg: 'rgba(255,255,255,0.9)',
    googleBorder: '1px solid rgba(11,20,55,0.12)',
    googleText: 'rgba(11,20,55,0.85)',
    linkColor: 'rgba(11,20,55,0.45)',
  }
}

export default function Signup() {
  const navigate = useNavigate()
  const { darkMode } = useUIStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const t = buildTokens(darkMode)

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: t.pageBg, backgroundImage: t.pageBgImage, backgroundAttachment: 'fixed' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <div className="text-5xl mb-4">🌊</div>
          <h2 className="text-xl font-medium mb-2" style={{ color: t.text }}>Check your inbox</h2>
          <p className="text-sm" style={{ color: t.textMuted }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <button onClick={() => navigate('/login')} className="mt-6 text-sm" style={{ color: '#60A5FA' }}>
            Back to login
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: t.pageBg, backgroundImage: t.pageBgImage, backgroundAttachment: 'fixed' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="dolphin-glow rounded-full p-3 mb-4">
            <DolphinLogo size={56} />
          </div>
          <h1 className="text-2xl font-medium" style={{ color: t.text }}>
            Welcome to Habit<span style={{ color: '#93C5FD' }}>·</span>at
          </h1>
          <p className="text-sm mt-1" style={{ color: t.textMuted }}>Let's make some waves.</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: t.cardBg, border: t.cardBorder, boxShadow: darkMode ? 'none' : '0 4px 24px rgba(11,20,55,0.08)' }}>
          {/* Google */}
          <button onClick={handleGoogleSignup}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all mb-4"
            style={{ background: t.googleBg, border: t.googleBorder, color: t.googleText }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: t.divider }} />
            <span className="text-xs" style={{ color: t.textSub }}>or</span>
            <div className="flex-1 h-px" style={{ background: t.divider }} />
          </div>

          <form onSubmit={handleSignup} className="space-y-3">
            <input type="text" placeholder="Your name" value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }} />
            <input type="email" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }} />
            <input type="password" placeholder="Password (min 6 characters)" value={password}
              onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }} />
            {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-medium text-white"
              style={{ background: '#2563EB', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: t.linkColor }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#60A5FA' }}>Sign in</Link>
        </p>

        <Footer />
      </motion.div>
    </div>
  )
}
