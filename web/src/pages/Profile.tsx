import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { LevelBadge } from '../components/LevelBadge'
import { getLevelFromXP, getLevelName } from '../lib/gamification'
import { motion, AnimatePresence } from 'framer-motion'

export default function Profile() {
  const navigate = useNavigate()
  const { profile, logout, setProfile } = useAuthStore()
  const { darkMode, toggleDarkMode, streakShields } = useUIStore()

  const [name, setName] = useState(profile?.display_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const level = getLevelFromXP(profile?.total_xp ?? 0)
  const levelName = getLevelName(level)

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
    <div className="min-h-screen" style={{ background: '#0B1437', paddingTop: 60, paddingBottom: 80 }}>
      <div className="px-4 pt-4 max-w-lg mx-auto">

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
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: '#2563EB', border: '2px solid #0B1437' }}>
              <span style={{ fontSize: 10 }}>📷</span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

          <p className="text-base font-medium text-white mt-3">{profile?.display_name ?? 'Your name'}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{profile?.email}</p>
          <div className="mt-2">
            <LevelBadge level={level} name={levelName} />
          </div>

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
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Display name</p>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
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
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <div>
              <p className="text-sm text-white">Dark mode</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Deep navy · always looks good</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="w-12 h-6 rounded-full relative transition-colors"
              style={{ background: darkMode ? '#2563EB' : 'rgba(255,255,255,0.15)' }}
            >
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: darkMode ? '50%' : '2px' }} />
            </button>
          </div>

          {/* Password */}
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <p className="text-sm text-white mb-2">Account</p>
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
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            Sign out
          </button>

          {/* Danger zone */}
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#F87171' }}>Danger zone</p>
            <button onClick={() => setShowDeleteConfirm(true)} className="text-xs"
              style={{ color: '#F87171' }}>
              Delete my account →
            </button>
          </div>
        </div>
      </div>

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
              style={{ background: '#0F1B45', border: '1px solid rgba(248,113,113,0.3)' }}
            >
              <h3 className="text-sm font-medium mb-1" style={{ color: '#F87171' }}>Delete account?</h3>
              <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
                This is permanent. All your habits, streaks, and journal entries will be lost.
              </p>
              <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Type <strong>DELETE</strong> to confirm:
              </p>
              <input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-3"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
              />
              <div className="flex gap-2">
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                  className="flex-1 py-2 rounded-xl text-xs"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}>
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'DELETE'}
                  className="flex-1 py-2 rounded-xl text-xs font-medium"
                  style={{ background: deleteInput === 'DELETE' ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.1)', color: '#F87171' }}>
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
