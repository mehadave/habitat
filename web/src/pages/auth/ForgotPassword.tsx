import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile`,
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0B1437' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <h1 className="text-xl font-medium text-white text-center mb-2">Reset password</h1>
        <p className="text-sm text-center mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
          We'll send a reset link to your email.
        </p>

        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Check your inbox for the reset link.</p>
            <Link to="/login" className="block mt-4 text-sm" style={{ color: '#60A5FA' }}>Back to login</Link>
          </div>
        ) : (
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <form onSubmit={handleReset} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
              />
              {error && <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-medium text-white"
                style={{ background: '#2563EB', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <Link to="/login" className="block text-center mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Back to login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
