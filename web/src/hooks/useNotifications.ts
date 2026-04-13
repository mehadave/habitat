import type { HabitWithStreak } from '../lib/types'

export interface NotifPref {
  enabled: boolean
  time: string     // "HH:MM"
  days: number[]   // 0=Sun…6=Sat, empty = every day
}

const STORAGE_KEY = 'habitat-notifications'

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
export function syncNotificationsToSW(habits: HabitWithStreak[]) {
  const sw = navigator.serviceWorker?.controller
  if (!sw) return
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
  sw.postMessage({ type: 'SCHEDULE_NOTIFICATIONS', habits: toSchedule })
}
