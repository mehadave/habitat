/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare const self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()

// Inject Workbox precache manifest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
precacheAndRoute((self as any).__WB_MANIFEST)

// ─── Runtime caching ─────────────────────────────────────────────────────────

// Supabase REST API — NetworkFirst (cached data available offline)
registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/rest/v1/'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// Supabase Storage (avatars, etc.) — CacheFirst
registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/storage/'),
  new CacheFirst({
    cacheName: 'supabase-storage',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// Google Fonts CSS
registerRoute(
  ({ url }) => url.hostname === 'fonts.googleapis.com',
  new CacheFirst({
    cacheName: 'google-fonts-css',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// Google Fonts files
registerRoute(
  ({ url }) => url.hostname === 'fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-files',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// ─── Notification click handler ───────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const data = event.notification.data as { habitId?: string; date?: string } | undefined

  if (event.action === 'yes' && data?.habitId) {
    // Complete the habit — message open windows, or open app with URL params
    event.waitUntil(
      self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients) => {
          if (clients.length > 0) {
            clients.forEach((c) =>
              c.postMessage({ type: 'COMPLETE_HABIT', habitId: data.habitId, date: data.date })
            )
            return clients[0].focus()
          }
          return self.clients.openWindow(`/?complete=${data.habitId}&date=${data.date}`)
        })
    )
  } else if (event.action === 'no') {
    // Dismissed — do nothing
  } else {
    // Tapped body — open app
    event.waitUntil(
      self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients) => {
          if (clients.length > 0) return clients[0].focus()
          return self.clients.openWindow('/')
        })
    )
  }
})

// ─── Notification scheduling ──────────────────────────────────────────────────

interface HabitNotifConfig {
  id: string
  name: string
  emoji: string
  time: string   // "HH:MM"
  days: number[] // 0=Sun … 6=Sat, empty = every day
}

const alarmTimers = new Map<string, ReturnType<typeof setTimeout>>()

function localDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function scheduleHabitNotification(habit: HabitNotifConfig): void {
  const existing = alarmTimers.get(habit.id)
  if (existing !== undefined) clearTimeout(existing)

  const [hour, min] = habit.time.split(':').map(Number)
  const now = new Date()
  const next = new Date(now)
  next.setHours(hour, min, 0, 0)
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1)

  const ms = next.getTime() - now.getTime()

  const timerId = setTimeout(async () => {
    alarmTimers.delete(habit.id)
    const dayOfWeek = new Date().getDay()
    const shouldNotify = habit.days.length === 0 || habit.days.includes(dayOfWeek)

    if (shouldNotify) {
      try {
        await self.registration.showNotification(`${habit.emoji} Time for: ${habit.name}`, {
          body: 'Did you complete it today?',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `habit-${habit.id}`,
          data: { habitId: habit.id, date: localDate() },
          actions: [
            { action: 'yes', title: '✓ Done' },
            { action: 'no', title: 'Skip' },
          ],
        } as NotificationOptions)
      } catch {
        // Notifications blocked or unsupported
      }
    }

    // Reschedule for next occurrence
    scheduleHabitNotification(habit)
  }, ms)

  alarmTimers.set(habit.id, timerId)
}

self.addEventListener('message', (event) => {
  const msg = event.data as { type: string; habits?: HabitNotifConfig[]; habitId?: string }

  if (msg?.type === 'SCHEDULE_NOTIFICATIONS' && msg.habits) {
    const newIds = new Set(msg.habits.map((h) => h.id))
    // Cancel habits that were removed
    alarmTimers.forEach((timerId, id) => {
      if (!newIds.has(id)) {
        clearTimeout(timerId)
        alarmTimers.delete(id)
      }
    })
    msg.habits.forEach((h) => scheduleHabitNotification(h))
  }

  if (msg?.type === 'CANCEL_NOTIFICATION' && msg.habitId) {
    const timerId = alarmTimers.get(msg.habitId)
    if (timerId !== undefined) {
      clearTimeout(timerId)
      alarmTimers.delete(msg.habitId)
    }
  }
})
