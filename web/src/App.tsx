import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthInit } from './hooks/useAuth'
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'
import { useHabits } from './hooks/useHabits'
import { NavBar } from './components/NavBar'
import { Footer } from './components/Footer'
import { XPToastContainer } from './components/XPToast'
import { StreakCelebration } from './components/StreakCelebration'
import { ProtectedRoute } from './components/ProtectedRoute'

// Auth pages
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'

// App pages
import Dashboard from './pages/Dashboard'
import Habits from './pages/Habits'
import Calendar from './pages/Calendar'
import Analytics from './pages/Analytics'
import Journal from './pages/Journal'
import Profile from './pages/Profile'

function AppShell() {
  const { data: habits = [] } = useHabits()
  const { streakShields, addShield } = useUIStore()

  // 8pm nudge: check at 8pm if habits are incomplete
  useEffect(() => {
    function scheduleNudge() {
      const now = new Date()
      const nudge = new Date()
      nudge.setHours(20, 0, 0, 0)
      if (now > nudge) nudge.setDate(nudge.getDate() + 1)
      const ms = nudge.getTime() - now.getTime()
      return setTimeout(() => {
        const todayStr = new Date().toISOString().split('T')[0]
        const incomplete = habits.filter(h => !h.completions?.includes(todayStr))
        if (incomplete.length > 0 && 'Notification' in window) {
          Notification.requestPermission().then(p => {
            if (p === 'granted') {
              new Notification('Habit·at', {
                body: `Your ${incomplete[0]?.streak?.current_streak ?? 0}-day streak needs you.`,
                icon: '/icon-192.svg',
              })
            }
          })
        }
      }, ms)
    }
    const t = scheduleNudge()
    return () => clearTimeout(t)
  }, [habits])

  // Award streak shield on 30-day milestones
  useEffect(() => {
    habits.forEach(h => {
      const s = h.streak?.current_streak ?? 0
      if (s > 0 && s % 30 === 0 && streakShields < 3) {
        addShield()
      }
    })
  }, [habits])

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
      <XPToastContainer />
      <StreakCelebration />
    </>
  )
}

export default function App() {
  useAuthInit()
  const { session } = useAuthStore()
  const { darkMode } = useUIStore()

  // Apply dark/light mode class
  useEffect(() => {
    document.body.classList.toggle('light-mode', !darkMode)
  }, [darkMode])

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={session ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
