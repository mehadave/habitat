import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    linkColor: 'rgba(255,255,255,0.4)',
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
    linkColor: 'rgba(11,20,55,0.45)',
  }
}

export default function ForgotPassword() {
  const { darkMode } = useUIStore()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const t = buildTokens(darkMode)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: t.pageBg, backgroundImage: t.pageBgImage, backgroundAttachment: 'fixed' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="dolphin-glow rounded-full p-3 mb-4">
            <DolphinLogo size={48} />
          </div>
          <h1 className="text-xl font-medium" style={{ color: t.text }}>Reset password</h1>
          <p className="text-sm mt-1" style={{ color: t.textMuted }}>
            We'll send a reset link to your email.
          </p>
        </div>

        {/* OAuth hint */}
        <div className="rounded-xl px-4 py-3 mb-4 text-xs text-center" style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.20)', color: darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(11,20,55,0.55)' }}>
          Signed up with Google? Just use the <strong>Continue with Google</strong> button on the login page — no password needed.
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-sm" style={{ color: t.textMuted }}>Check your inbox for the reset link.</p>
            <Link to="/login" className="block mt-4 text-sm" style={{ color: '#60A5FA' }}>Back to login</Link>
          </div>
        ) : (
          <div className="rounded-2xl p-6" style={{ background: t.cardBg, border: t.cardBorder, boxShadow: darkMode ? 'none' : '0 4px 24px rgba(11,20,55,0.08)' }}>
            <form onSubmit={handleReset} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }}
              />
              {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-medium text-white"
                style={{ background: '#2563EB', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            <Link to="/login" className="block text-center mt-3 text-xs" style={{ color: t.linkColor }}>
              Back to login
            </Link>
          </div>
        )}

        <Footer />
      </motion.div>
    </div>
  )
}
