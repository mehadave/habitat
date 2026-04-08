import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { DolphinLogo } from '../../components/DolphinLogo'
import { Footer } from '../../components/Footer'
import { useUIStore } from '../../store/uiStore'

export default function Login() {
  const navigate = useNavigate()
  const { darkMode } = useUIStore()

  const [mode, setMode] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Theme tokens
  const t = darkMode ? {
    pageBg: '#0B1437',
    pageBgImage: 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(14,165,233,0.12) 0%, transparent 50%)',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.45)',
    textSub: 'rgba(255,255,255,0.3)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: '1px solid rgba(255,255,255,0.09)',
    inputBg: 'rgba(255,255,255,0.07)',
    inputBorder: '1px solid rgba(255,255,255,0.12)',
    inputColor: '#fff',
    tabBg: 'rgba(255,255,255,0.06)',
    tabInactive: 'rgba(255,255,255,0.55)',
    divider: 'rgba(255,255,255,0.1)',
    googleBg: 'rgba(255,255,255,0.07)',
    googleBorder: '1px solid rgba(255,255,255,0.12)',
    googleText: 'rgba(255,255,255,0.85)',
    linkColor: 'rgba(255,255,255,0.45)',
  } : {
    pageBg: '#EFF4FF',
    pageBgImage: 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.09) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(14,165,233,0.07) 0%, transparent 50%)',
    text: '#0B1437',
    textMuted: 'rgba(11,20,55,0.55)',
    textSub: 'rgba(11,20,55,0.35)',
    cardBg: 'rgba(255,255,255,0.75)',
    cardBorder: '1px solid rgba(11,20,55,0.09)',
    inputBg: 'rgba(11,20,55,0.05)',
    inputBorder: '1px solid rgba(11,20,55,0.15)',
    inputColor: '#0B1437',
    tabBg: 'rgba(11,20,55,0.06)',
    tabInactive: 'rgba(11,20,55,0.45)',
    divider: 'rgba(11,20,55,0.12)',
    googleBg: 'rgba(11,20,55,0.04)',
    googleBorder: '1px solid rgba(11,20,55,0.12)',
    googleText: 'rgba(11,20,55,0.8)',
    linkColor: 'rgba(11,20,55,0.5)',
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/dashboard')
    setLoading(false)
  }

  async function handleSendOTP() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) setError(error.message)
    else setOtpSent(true)
    setLoading(false)
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    if (error) setError(error.message)
    else navigate('/dashboard')
    setLoading(false)
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
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
            Habit<span style={{ color: '#93C5FD' }}>·</span>at
          </h1>
          <p className="text-sm mt-1" style={{ color: t.textMuted }}>Small habits. Big changes.</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: t.cardBg, border: t.cardBorder }}>
          {/* Mode tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: t.tabBg }}>
            {(['email', 'phone'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize"
                style={{ background: mode === m ? '#2563EB' : 'transparent', color: mode === m ? '#fff' : t.tabInactive }}>
                {m}
              </button>
            ))}
          </div>

          {mode === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <input type="email" placeholder="Email address" value={email}
                onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }} />
              <input type="password" placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }} />
              {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity"
                style={{ background: '#2563EB', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {!otpSent ? (
                <>
                  <input type="tel" placeholder="+1 (555) 000-0000" value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }} />
                  {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}
                  <button onClick={handleSendOTP} disabled={loading || !phone}
                    className="w-full py-3 rounded-xl text-sm font-medium text-white"
                    style={{ background: '#2563EB', opacity: loading || !phone ? 0.6 : 1 }}>
                    {loading ? 'Sending…' : 'Send code'}
                  </button>
                </>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-3">
                  <p className="text-xs text-center" style={{ color: t.textMuted }}>Code sent to {phone}</p>
                  <input type="text" placeholder="6-digit code" value={otp}
                    onChange={e => setOtp(e.target.value)} maxLength={6}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none text-center tracking-widest"
                    style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }} />
                  {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}
                  <button type="submit" disabled={loading || otp.length < 6}
                    className="w-full py-3 rounded-xl text-sm font-medium text-white"
                    style={{ background: '#2563EB', opacity: loading || otp.length < 6 ? 0.6 : 1 }}>
                    {loading ? 'Verifying…' : 'Verify'}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: t.divider }} />
            <span className="text-xs" style={{ color: t.textSub }}>or</span>
            <div className="flex-1 h-px" style={{ background: t.divider }} />
          </div>

          <button onClick={handleGoogleLogin}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
            style={{ background: t.googleBg, border: t.googleBorder, color: t.googleText }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-4 text-xs" style={{ color: t.linkColor }}>
          <Link to="/signup" style={{ color: t.linkColor }}>Create account</Link>
          <span>·</span>
          <Link to="/forgot-password" style={{ color: t.linkColor }}>Forgot password</Link>
        </div>

        <Footer />
      </motion.div>
    </div>
  )
}
