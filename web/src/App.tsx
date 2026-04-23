import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthInit } from './hooks/useAuth'
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'
import { useHabits, useToggleCompletion } from './hooks/useHabits'
import { NavBar } from './components/NavBar'
import { StreakCelebration } from './components/StreakCelebration'
import { ProtectedRoute } from './components/ProtectedRoute'
import { InstallPrompt } from './components/InstallPrompt'
import { OnboardingModal, hasCompletedOnboarding } from './components/OnboardingModal'
import { syncNotificationsToSW, scheduleWeeklySummary } from './hooks/useNotifications'

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
  const toggleMutation = useToggleCompletion()
  const navigate = useNavigate()
  const habitsRef = useRef(habits)
  habitsRef.current = habits

  const [showOnboarding, setShowOnboarding] = useState(() => !hasCompletedOnboarding())

  // Sync notification schedules to SW whenever habits load
  useEffect(() => {
    if (habits.length > 0) syncNotificationsToSW(habits)
  }, [habits])

  // Schedule weekly summary on app load + whenever habits change
  useEffect(() => {
    scheduleWeeklySummary(habits)
  }, [habits])

  // Handle COMPLETE_HABIT message from SW notification action
  useEffect(() => {
    function handleSWMessage(event: MessageEvent) {
      if (event.data?.type === 'COMPLETE_HABIT') {
        const { habitId, date } = event.data as { habitId: string; date: string }
        const habit = habitsRef.current.find(h => h.id === habitId)
        if (habit && !habit.completions?.includes(date)) {
          toggleMutation.mutate({ habit, date })
        }
      }
    }
    navigator.serviceWorker?.addEventListener('message', handleSWMessage)
    return () => navigator.serviceWorker?.removeEventListener('message', handleSWMessage)
  }, [toggleMutation])

  // Handle ?complete=habitId&date=date URL params (from SW notification click)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const completeId = params.get('complete')
    const completeDate = params.get('date')
    if (completeId && completeDate) {
      window.history.replaceState({}, '', '/habits')
      navigate('/habits', { replace: true })
      // Wait for habits to load
      const interval = setInterval(() => {
        const habit = habitsRef.current.find(h => h.id === completeId)
        if (habit) {
          clearInterval(interval)
          if (!habit.completions?.includes(completeDate)) {
            toggleMutation.mutate({ habit, date: completeDate })
          }
        }
      }, 200)
      setTimeout(() => clearInterval(interval), 5000)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Award streak shield on 30-day milestones
  useEffect(() => {
    habits.forEach(h => {
      const s = h.streak?.current_streak ?? 0
      if (s > 0 && s % 30 === 0 && streakShields < 3) addShield()
    })
  }, [habits]) // eslint-disable-line react-hooks/exhaustive-deps

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
      <StreakCelebration />
      <InstallPrompt />
      <AnimatePresence>
        {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      </AnimatePresence>
    </>
  )
}

export default function App() {
  useAuthInit()
  const { session } = useAuthStore()
  const { darkMode, setDarkMode, isManualOverrideActive } = useUIStore()

  // Apply dark/light mode class
  useEffect(() => {
    document.body.classList.toggle('light-mode', !darkMode)
  }, [darkMode])

  // Sync with OS preference on first load + system changes
  // — but ONLY if the user hasn't manually toggled within the last hour
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const stored = localStorage.getItem('habitat-ui')
    if (!stored) setDarkMode(mq.matches)
    function handleChange(e: MediaQueryListEvent) {
      if (!isManualOverrideActive()) setDarkMode(e.matches)
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
