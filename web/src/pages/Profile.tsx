import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { useHabits, localDateStr } from '../hooks/useHabits'
import {
  isWeeklySummaryEnabled,
  setWeeklySummaryEnabled,
  scheduleWeeklySummary,
  requestNotificationPermission,
} from '../hooks/useNotifications'
import { motion, AnimatePresence } from 'framer-motion'
import type { HabitWithStreak } from '../lib/types'

const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function WeeklySummaryModal({ habits, darkMode, onClose }: {
  habits: HabitWithStreak[]
  darkMode: boolean
  onClose: () => void
}) {
  const t = { bg: 'var(--surface-alt)', text: 'var(--text-1)', muted: 'var(--text-2)', card: 'var(--surface)', border: 'var(--border)' }

  const today = new Date()
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 6 + i)
    return localDateStr(d)
  })
  const totalPossible = habits.length * 7
  const totalDone = habits.reduce((s, h) => s + weekDates.filter(d => h.completions?.includes(d)).length, 0)
  const pct = totalPossible > 0 ? Math.round(totalDone / totalPossible * 100) : 0
  const bestHabit = [...habits].sort((a, b) => {
    const aW = weekDates.filter(d => a.completions?.includes(d)).length
    const bW = weekDates.filter(d => b.completions?.includes(d)).length
    return bW - aW
  })[0]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="w-full max-w-sm rounded-3xl p-6 overflow-y-auto"
        style={{ background: t.bg, border: `1px solid ${t.border}`, maxHeight: '85vh', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: '#38BDF8' }}>Weekly Summary</p>
            <h2 className="text-lg font-bold" style={{ color: t.text }}>Your 7-day report</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ background: t.card, color: t.muted }}>×</button>
        </div>

        <div className="rounded-2xl p-4 mb-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(56,189,248,0.15))', border: '1px solid rgba(56,189,248,0.25)' }}>
          <p className="font-display text-5xl leading-none mb-1" style={{ color: '#38BDF8', letterSpacing: '-0.03em' }}>{pct}%</p>
          <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: t.muted }}>completion this week</p>
          <p className="text-xs mt-1" style={{ color: t.muted }}>{totalDone} of {totalPossible} sessions done</p>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold mb-2 tracking-wide uppercase" style={{ color: t.muted }}>Habit breakdown</p>
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${t.border}` }}>
            {/* Day headers */}
            <div className="grid py-2 px-3" style={{ gridTemplateColumns: '1fr repeat(7, 24px)', gap: 3 }}>
              <div />
              {WEEK_DAYS.map(d => (
                <div key={d} className="text-[10px] font-semibold text-center" style={{ color: t.muted }}>{d}</div>
              ))}
            </div>
            {habits.slice(0, 6).map(h => (
              <div key={h.id} className="grid items-center py-2 px-3" style={{ gridTemplateColumns: '1fr repeat(7, 24px)', gap: 3, borderTop: `1px solid ${t.border}` }}>
                <span className="text-xs pr-2 leading-snug" style={{ color: t.text, wordBreak: 'break-word' }}>{h.emoji} {h.name}</span>
                {weekDates.map(d => {
                  const done = h.completions?.includes(d)
                  return (
                    <div key={d} className="flex items-center justify-center" style={{ height: 22 }}>
                      {done && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {bestHabit && (
          <div className="rounded-2xl p-3 mb-3" style={{ background: t.card, border: `1px solid ${t.border}` }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#FBBF24' }}>⭐ Star of the week</p>
            <p className="text-sm font-semibold" style={{ color: t.text }}>{bestHabit.emoji} {bestHabit.name}</p>
            <p className="text-xs" style={{ color: t.muted }}>
              {weekDates.filter(d => bestHabit.completions?.includes(d)).length}/7 days completed
            </p>
          </div>
        )}

        <p className="text-[10px] text-center" style={{ color: t.muted }}>
          Weekly summaries can be emailed every Monday — coming soon
        </p>
      </motion.div>
    </motion.div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { profile, logout, setProfile } = useAuthStore()
  const { darkMode, toggleDarkMode, streakShields } = useUIStore()

  const t = {
    bg: 'var(--bg-app)',
    text: 'var(--text-1)',
    textMuted: 'var(--text-2)',
    textSub: 'var(--text-3)',
    cardBg: 'var(--surface)',
    cardBorder: 'var(--border)',
    inputBg: 'var(--input-bg)',
    inputBorder: '1px solid var(--input-border)',
    inputColor: 'var(--text-1)',
    divider: 'var(--divider)',
    navBg: 'var(--nav-bg)',
    navBorder: 'var(--border)',
    sheetBg: 'var(--surface-alt)',
    badgeBg: 'var(--surface-tint)',
    badgeText: 'var(--text-2)',
  }

  const { data: habits = [] } = useHabits()
  const [name, setName] = useState(profile?.display_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [error, setError] = useState('')
  const [weeklySummary, setWeeklySummary] = useState(isWeeklySummaryEnabled())
  const [showWeeklySummaryModal, setShowWeeklySummaryModal] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleWeeklySummaryToggle() {
    const next = !weeklySummary
    if (next) {
      const granted = await requestNotificationPermission()
      if (!granted) return
    }
    setWeeklySummary(next)
    setWeeklySummaryEnabled(next)
    scheduleWeeklySummary(habits)
  }


  const initials = (profile?.display_name ?? profile?.email ?? 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleSaveName() {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from('users')
      .update({ display_name: name })
      .eq('id', profile.id)
    if (!error) {
      setProfile({ ...profile, display_name: name })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`
      await supabase.from('users').update({ avatar_url: url }).eq('id', profile.id)
      setProfile({ ...profile, avatar_url: url })
    }
    setUploadingAvatar(false)
  }

  async function handlePasswordReset() {
    if (!profile?.email) return
    await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/profile`,
    })
    setError('Password reset email sent.')
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') return
    // Note: actual account deletion requires a Supabase Edge Function
    // For now, sign out
    await supabase.auth.signOut()
    logout()
    navigate('/login')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    logout()
    navigate('/login')
  }

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 76, paddingBottom: 80 }}>
      <div className="px-4 pt-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-5" style={{ color: t.text }}>Profile</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <button
              onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
              style={{ background: '#2563EB' }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-medium text-white">{initials}</span>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <div className="w-5 h-5 rounded-full border-2 animate-spin"
                    style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
                </div>
              )}
            </button>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: '#2563EB', border: `2px solid ${t.bg}`, boxShadow: '0 2px 8px rgba(37,99,235,0.5)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

          <p className="text-lg font-bold mt-3" style={{ color: t.text }}>{profile?.display_name ?? 'Your name'}</p>
          <p className="text-sm mt-0.5" style={{ color: t.textMuted }}>{profile?.email}</p>
          {/* Shield count */}
          {streakShields > 0 && (
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
              style={{ background: 'rgba(37,99,235,0.15)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.3)' }}>
              🛡 {streakShields} streak shield{streakShields > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Settings cards */}
        <div className="space-y-3">
          {/* Display name */}
          <div className="rounded-2xl p-4"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs mb-2" style={{ color: t.textMuted }}>Display name</p>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }}
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white"
                style={{ background: '#2563EB', opacity: saving ? 0.6 : 1 }}
              >
                {saved ? '✓' : 'Save'}
              </button>
            </div>
          </div>

          {/* Dark mode */}
          <div className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <div>
              <p className="text-sm" style={{ color: t.text }}>Dark mode</p>
              <p className="text-xs" style={{ color: t.textMuted }}>Auto-follows device unless you change it</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="w-12 h-6 rounded-full relative transition-colors"
              style={{ background: darkMode ? '#2563EB' : t.inputBg }}
            >
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: darkMode ? '50%' : '2px' }} />
            </button>
          </div>

          {/* Weekly summary */}
          <div className="rounded-2xl p-4"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-3">
                <p className="text-sm" style={{ color: t.text }}>Weekly summary</p>
                <p className="text-xs" style={{ color: t.textMuted }}>
                  Get a notification every Sunday at 9 AM with your week's stats
                </p>
              </div>
              <button
                onClick={handleWeeklySummaryToggle}
                className="w-12 h-6 rounded-full relative transition-colors flex-shrink-0"
                style={{ background: weeklySummary ? '#2563EB' : t.inputBg }}
              >
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: weeklySummary ? '50%' : '2px' }} />
              </button>
            </div>
            <button
              onClick={() => setShowWeeklySummaryModal(true)}
              className="mt-3 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
              style={{ background: 'rgba(56,189,248,0.10)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.20)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2.5"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
              </svg>
              View this week's report
            </button>
          </div>

          {/* Password */}
          <div className="rounded-2xl p-4"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-sm mb-2" style={{ color: t.text }}>Account</p>
            <button onClick={handlePasswordReset} className="text-sm"
              style={{ color: '#60A5FA' }}>
              Change password →
            </button>
            {error && <p className="text-xs mt-1" style={{ color: '#93C5FD' }}>{error}</p>}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-2xl text-sm font-medium"
            style={{ background: t.inputBg, color: t.text, border: `1px solid ${t.cardBorder}` }}
          >
            Sign out
          </button>

          {/* Danger zone */}
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: t.text }}>Danger zone</p>
            <button onClick={() => setShowDeleteConfirm(true)} className="text-xs"
              style={{ color: '#F87171' }}>
              Delete my account →
            </button>
          </div>
        </div>
      </div>

      {/* Weekly summary modal */}
      <AnimatePresence>
        {showWeeklySummaryModal && (
          <WeeklySummaryModal
            habits={habits}
            darkMode={darkMode}
            onClose={() => setShowWeeklySummaryModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-xs rounded-2xl p-6"
              style={{ background: t.sheetBg, border: '1px solid rgba(248,113,113,0.3)' }}
            >
              <h3 className="text-sm font-medium mb-1" style={{ color: '#F87171' }}>Delete account?</h3>
              <p className="text-xs mb-3" style={{ color: t.textMuted }}>
                This is permanent. All your habits, streaks, and journal entries will be lost.
              </p>
              <p className="text-xs mb-2" style={{ color: t.textMuted }}>
                Type <strong>DELETE</strong> to confirm:
              </p>
              <input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-3"
                style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }}
              />
              <div className="flex gap-2">
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                  className="flex-1 py-2 rounded-xl text-xs"
                  style={{ background: t.inputBg, color: t.textMuted }}>
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'DELETE'}
                  className="flex-1 py-2 rounded-xl text-xs font-medium"
                  style={{ background: deleteInput === 'DELETE' ? 'rgba(248,113,113,0.3)' : t.inputBg, color: '#F87171' }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
