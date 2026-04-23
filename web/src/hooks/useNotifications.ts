import type { HabitWithStreak } from '../lib/types'
import { localDateStr } from './useHabits'

export interface NotifPref {
  enabled: boolean
  time: string     // "HH:MM"
  days: number[]   // 0=Sun…6=Sat, empty = every day
}

const STORAGE_KEY = 'habitat-notifications'
const WEEKLY_SUMMARY_KEY = 'habitat-weekly-summary-enabled'

function getAll(): Record<string, NotifPref> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveAll(prefs: Record<string, NotifPref>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export function getHabitPref(habitId: string): NotifPref {
  return getAll()[habitId] ?? { enabled: false, time: '09:00', days: [] }
}

export function setHabitPref(habitId: string, pref: NotifPref) {
  const all = getAll()
  all[habitId] = pref
  saveAll(all)
}

export function removeHabitPref(habitId: string) {
  const all = getAll()
  delete all[habitId]
  saveAll(all)
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

/** Send scheduled notifications to the service worker. Call on app load and when prefs change. */
export async function syncNotificationsToSW(habits: HabitWithStreak[]) {
  if (!('serviceWorker' in navigator)) return
  try {
    // Wait for the SW to be active — controller can be null on first load
    const reg = await navigator.serviceWorker.ready
    const target = reg.active
    if (!target) return
    const all = getAll()
    const toSchedule = habits
      .filter((h) => all[h.id]?.enabled)
      .map((h) => ({
        id: h.id,
        name: h.name,
        emoji: h.emoji ?? '⭐',
        time: all[h.id].time,
        days: all[h.id].days,
      }))
    target.postMessage({ type: 'SCHEDULE_NOTIFICATIONS', habits: toSchedule })
  } catch { /* SW not available */ }
}

// ─── Weekly summary ─────────────────────────────────────────────────────────

export function isWeeklySummaryEnabled(): boolean {
  return localStorage.getItem(WEEKLY_SUMMARY_KEY) === 'true'
}

export function setWeeklySummaryEnabled(enabled: boolean) {
  localStorage.setItem(WEEKLY_SUMMARY_KEY, enabled ? 'true' : 'false')
}

/** Compute week stats from the last 7 days (inclusive of today). */
function computeWeekStats(habits: HabitWithStreak[]) {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 6)
  const weekStartStr = localDateStr(weekStart)
  const todayStr = localDateStr()

  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    days.push(localDateStr(d))
  }

  let totalCompleted = 0
  let possible = 0
  const perfectDays = days.filter(day => {
    if (day > todayStr) return false
    return habits.length > 0 && habits.every(h => h.completions?.includes(day))
  }).length

  habits.forEach(h => {
    const completedThisWeek = (h.completions ?? []).filter(
      d => d >= weekStartStr && d <= todayStr
    ).length
    totalCompleted += completedThisWeek
    possible += 7
  })

  const pct = possible > 0 ? Math.round((totalCompleted / possible) * 100) : 0
  const topHabit = [...habits]
    .map(h => ({
      name: h.name,
      emoji: h.emoji ?? '⭐',
      count: (h.completions ?? []).filter(d => d >= weekStartStr && d <= todayStr).length,
    }))
    .sort((a, b) => b.count - a.count)[0]

  return { pct, totalCompleted, perfectDays, topHabit, habitCount: habits.length }
}

/** Schedule a weekly summary notification for Sunday at 9:00 AM local time. */
export async function scheduleWeeklySummary(habits: HabitWithStreak[]) {
  if (!('serviceWorker' in navigator)) return
  try {
    const reg = await navigator.serviceWorker.ready
    const target = reg.active
    if (!target) return

    if (!isWeeklySummaryEnabled()) {
      target.postMessage({ type: 'CANCEL_WEEKLY_SUMMARY' })
      return
    }

    const stats = computeWeekStats(habits)
    target.postMessage({ type: 'SCHEDULE_WEEKLY_SUMMARY', stats })
  } catch { /* SW not available */ }
}
