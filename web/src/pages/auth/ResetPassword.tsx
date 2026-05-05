import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
    cardBg: 'rgba(255,255,255,0.85)',
    cardBorder: '1px solid rgba(11,20,55,0.10)',
    inputBg: 'rgba(11,20,55,0.05)',
    inputBorder: '1px solid rgba(11,20,55,0.12)',
    inputColor: '#0B1437',
    linkColor: 'rgba(11,20,55,0.45)',
  }
}

export default function ResetPassword() {
  const { darkMode } = useUIStore()
  const navigate = useNavigate()
  const t = buildTokens(darkMode)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase processes the URL hash automatically and fires PASSWORD_RECOVERY
    // when a valid recovery token is present.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      await supabase.auth.signOut()
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: t.pageBg, backgroundImage: t.pageBgImage }}
    >
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="dolphin-glow rounded-full p-3 mb-4">
            <DolphinLogo size={48} />
          </div>
          <h1 className="text-xl font-medium" style={{ color: t.text }}>Set new password</h1>
          <p className="text-sm mt-1" style={{ color: t.textMuted }}>
            {ready ? 'Choose a strong new password.' : 'Verifying your reset link…'}
          </p>
        </div>

        {done ? (
          <div className="text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm" style={{ color: t.textMuted }}>Password updated! Redirecting to login…</p>
          </div>
        ) : !ready ? (
          /* Waiting for Supabase to fire PASSWORD_RECOVERY */
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div
            className="rounded-2xl p-6"
            style={{ background: t.cardBg, border: t.cardBorder, boxShadow: darkMode ? 'none' : '0 4px 24px rgba(11,20,55,0.08)' }}
          >
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
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
                {loading ? 'Updating…' : 'Update password'}
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
