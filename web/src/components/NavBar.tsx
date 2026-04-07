import { Link, useLocation } from 'react-router-dom'
import { DolphinLogo } from './DolphinLogo'
import { LevelBadge } from './LevelBadge'
import { useAuthStore } from '../store/authStore'
import { getLevelName } from '../lib/gamification'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/habits', label: 'Habits', icon: '✅' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/journal', label: 'Journal', icon: '📓' },
  { to: '/profile', label: 'Me', icon: '👤' },
]

export function NavBar() {
  const location = useLocation()
  const { profile } = useAuthStore()
  const level = profile?.level ?? 1
  const levelName = getLevelName(level)

  return (
    <>
      {/* Top bar */}
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(11,20,55,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link to="/dashboard" className="flex items-center gap-2">
          <DolphinLogo size={32} />
          <span className="text-sm font-medium text-white">
            Habit<span style={{ color: '#93C5FD' }}>·</span>at
          </span>
        </Link>
        <LevelBadge level={level} name={levelName} compact />
      </div>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center"
        style={{
          background: 'rgba(11,20,55,0.92)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
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
              style={{ color: active ? '#93C5FD' : 'rgba(255,255,255,0.35)' }}
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
