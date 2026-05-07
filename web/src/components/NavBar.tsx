import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { DolphinLogo } from './DolphinLogo'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { supabase } from '../lib/supabase'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home',     icon: 'home'     },
  { to: '/habits',    label: 'Habits',   icon: 'habits'   },
  { to: '/calendar',  label: 'Calendar', icon: 'calendar' },
  { to: '/journal',   label: 'Journal',  icon: 'journal'  },
  { to: '/profile',   label: 'Me',       icon: 'profile'  },
]

function NavIcon({ name, size = 22 }: { name: string; size?: number }) {
  const s: React.SVGProps<SVGSVGElement> = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  switch (name) {
    case 'home':
      return (
        <svg {...s}>
          <path d="M3 12L12 3l9 9" />
          <path d="M5 10v11h5v-5h4v5h5V10" />
        </svg>
      )
    case 'habits':
      return (
        <svg {...s}>
          <path d="M12 2C8 8 5 10 5 14a7 7 0 0014 0c0-4-3-6-7-12z" />
          <path d="M9 17c.5 1.5 1.5 2 3 2s2.5-.5 3-2" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...s}>
          <rect x="3" y="4" width="18" height="18" rx="2.5" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <circle cx="8"  cy="15" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
          <circle cx="16" cy="15" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'journal':
      return (
        <svg {...s}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      )
    case 'profile':
      return (
        <svg {...s}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-3.87 3.58-7 8-7s8 3.13 8 7" />
        </svg>
      )
    default:
      return null
  }
}

function ProfileDropdown({ onClose, darkMode }: { onClose: () => void; darkMode: boolean }) {
  const { profile, logout } = useAuthStore()
  const { toggleDarkMode } = useUIStore()
  const navigate = useNavigate()

  const t = {
    sheetBg: 'var(--surface-alt)',
    cardBorder: 'var(--border)',
    text: 'var(--text-1)',
    textMuted: 'var(--text-2)',
    divider: 'var(--divider)',
    linkColor: 'var(--text-2)',
    borderColor: 'var(--border)',
    rowHover: 'var(--surface-tint)',
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    logout()
    navigate('/login')
    onClose()
  }

  return (
    <div
      className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden z-50 min-w-[200px]"
      style={{
        background: t.sheetBg,
        border: `1px solid ${t.cardBorder}`,
        boxShadow: '0 16px 48px rgba(0,0,0,0.36), 0 4px 16px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Profile header */}
      <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${t.divider}` }}>
        <p className="text-sm font-semibold truncate" style={{ color: t.text }}>{profile?.display_name ?? 'Your profile'}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: t.textMuted }}>{profile?.email ?? ''}</p>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="w-full flex items-center justify-between px-4 py-3 text-sm"
        style={{ color: t.linkColor, borderBottom: `1px solid ${t.divider}` }}
      >
        <div className="flex items-center gap-2.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {darkMode
              ? <><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></>
              : <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>
            }
          </svg>
          <span>{darkMode ? 'Dark mode' : 'Light mode'}</span>
        </div>
        <div style={{
          width: 36, height: 20, borderRadius: 10,
          background: darkMode ? '#2563EB' : 'rgba(11,20,55,0.18)',
          position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 2,
            left: darkMode ? 18 : 2,
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          }} />
        </div>
      </button>

      <Link
        to="/analytics"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-3 text-sm"
        style={{ color: t.linkColor, borderBottom: `1px solid ${t.divider}` }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        Statistics
      </Link>

      <Link
        to="/profile"
        onClick={onClose}
        className="flex items-center gap-2.5 px-4 py-3 text-sm"
        style={{ color: t.linkColor, borderBottom: `1px solid ${t.divider}` }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 015.07 19.07M4.93 4.93A10 10 0 0019.07 19.07"/>
        </svg>
        Settings
      </Link>

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm"
        style={{ color: '#F87171' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
        </svg>
        Sign out
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

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const topBarBg = darkMode
    ? 'linear-gradient(180deg, rgba(8,14,28,0.72) 0%, rgba(8,14,28,0.60) 100%)'
    : 'linear-gradient(180deg, rgba(248,250,255,0.97) 0%, rgba(240,244,255,0.92) 100%)'
  const topBarBorder = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(11,20,55,0.09)'
  const tabActiveBg  = darkMode ? 'rgba(56,189,248,0.13)' : 'rgba(37,99,235,0.10)'
  const tabActiveText = darkMode ? '#38BDF8' : '#2563EB'
  const tabInactiveText = darkMode ? 'rgba(255,255,255,0.38)' : 'rgba(11,20,55,0.55)'
  const pillBg = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(11,20,55,0.07)'
  const brandColor = darkMode ? 'white' : '#0B1437'

  return (
    <>
      {/* ── Top bar ── */}
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 nav-bar-top"
        style={{
          background: topBarBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${topBarBorder}`,
        }}
      >
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <DolphinLogo size={38} />
          <span className="text-base font-bold tracking-tight" style={{ color: brandColor, letterSpacing: '-0.01em' }}>
            Habit<span style={{ color: '#38BDF8' }}>·</span>at
          </span>
        </Link>

        {/* Desktop tabs — pill container */}
        <div
          className="desktop-nav-tabs items-center gap-0.5 rounded-full px-1.5 py-1.5"
          style={{ background: pillBg, display: 'none', border: `1px solid ${topBarBorder}` }}
        >
          {NAV_ITEMS.map(({ to, label, icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: active ? tabActiveBg : 'transparent',
                  color: active ? tabActiveText : tabInactiveText,
                  letterSpacing: '-0.01em',
                }}
              >
                <NavIcon name={icon} size={16} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>

        {/* Profile button */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white transition-all"
            style={{
              background: profile?.avatar_url
                ? 'transparent'
                : 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)',
              border: showDropdown
                ? '2px solid #38BDF8'
                : `2px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(11,20,55,0.12)'}`,
              overflow: 'hidden',
              boxShadow: showDropdown ? '0 0 0 4px rgba(56,189,248,0.15)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : initials}
          </button>
          {showDropdown && <ProfileDropdown onClose={() => setShowDropdown(false)} darkMode={darkMode} />}
        </div>
      </div>

      {/* ── Bottom nav — mobile only ── */}
      <nav
        className="bottom-nav-mobile fixed bottom-0 left-0 right-0 z-40 nav-bar-bottom"
        style={{
          background: darkMode ? 'rgba(8,14,28,0.95)' : 'rgba(248,250,255,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(11,20,55,0.09)'}`,
          paddingBottom: 'env(safe-area-inset-bottom)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {NAV_ITEMS.map(({ to, label, icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center py-2.5 gap-1 transition-all mx-1 rounded-2xl"
              style={{
                color: active ? tabActiveText : tabInactiveText,
                background: active ? tabActiveBg : 'transparent',
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
            >
              <NavIcon name={icon} size={21} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: '0.02em' }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
