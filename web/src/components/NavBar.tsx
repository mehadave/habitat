import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { DolphinLogo } from './DolphinLogo'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { supabase } from '../lib/supabase'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/habits', label: 'Habits', icon: '✅' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/journal', label: 'Journal', icon: '📓' },
  { to: '/profile', label: 'Me', icon: '👤' },
]

function ProfileDropdown({ onClose, darkMode }: { onClose: () => void; darkMode: boolean }) {
  const { profile, logout } = useAuthStore()
  const navigate = useNavigate()

  const t = darkMode ? {
    sheetBg: '#0F1B45',
    cardBorder: 'rgba(255,255,255,0.12)',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.4)',
    divider: 'rgba(255,255,255,0.08)',
    linkColor: 'rgba(255,255,255,0.75)',
    borderColor: 'rgba(255,255,255,0.06)',
  } : {
    sheetBg: '#E8EFFF',
    cardBorder: 'rgba(11,20,55,0.12)',
    text: '#0B1437',
    textMuted: 'rgba(11,20,55,0.5)',
    divider: 'rgba(11,20,55,0.08)',
    linkColor: 'rgba(11,20,55,0.75)',
    borderColor: 'rgba(11,20,55,0.1)',
  }

  const initials = (profile?.display_name ?? profile?.email ?? 'U')
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  async function handleLogout() {
    await supabase.auth.signOut()
    logout()
    navigate('/login')
    onClose()
  }

  return (
    <div
      className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden z-50 min-w-[180px]"
      style={{ background: t.sheetBg, border: `1px solid ${t.cardBorder}`, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: t.divider }}>
        <p className="text-sm font-medium truncate" style={{ color: t.text }}>{profile?.display_name ?? 'Your profile'}</p>
        <p className="text-xs truncate" style={{ color: t.textMuted }}>{profile?.email ?? ''}</p>
      </div>
      <Link
        to="/profile"
        onClick={onClose}
        className="flex items-center gap-2 px-4 py-3 text-sm transition-colors"
        style={{ color: t.linkColor }}
      >
        <span>⚙️</span> Settings
      </Link>
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors border-t"
        style={{ color: '#F87171', borderColor: t.borderColor }}
      >
        <span>🚪</span> Sign out
      </button>
    </div>
  )
}

export function NavBar() {
  const location = useLocation()
  const { profile } = useAuthStore()
  const { darkMode } = useUIStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const initials = (profile?.display_name ?? profile?.email ?? 'U')
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      {/* Top bar */}
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: darkMode ? 'rgba(11,20,55,0.85)' : 'rgba(239,244,255,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(11,20,55,0.1)'}`,
        }}
      >
        <Link to="/dashboard" className="flex items-center gap-2">
          <DolphinLogo size={32} />
          <span className="text-sm font-medium" style={{ color: darkMode ? 'white' : '#0B1437' }}>
            Habit<span style={{ color: '#93C5FD' }}>·</span>at
          </span>
        </Link>

        {/* Profile button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white transition-all"
            style={{
              background: profile?.avatar_url ? 'transparent' : '#2563EB',
              border: showDropdown ? '2px solid #60A5FA' : '2px solid transparent',
              overflow: 'hidden',
            }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </button>
          {showDropdown && <ProfileDropdown onClose={() => setShowDropdown(false)} darkMode={darkMode} />}
        </div>
      </div>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center"
        style={{
          background: darkMode ? 'rgba(11,20,55,0.92)' : 'rgba(239,244,255,0.92)',
          backdropFilter: 'blur(16px)',
          borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(11,20,55,0.1)'}`,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {NAV_ITEMS.map(({ to, label, icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-all"
              style={{ color: active ? '#93C5FD' : darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(11,20,55,0.35)' }}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: 10 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
