import { useState, useEffect } from 'react'
import { useUIStore } from '../store/uiStore'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

export function InstallPrompt() {
  const { darkMode } = useUIStore()
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null)

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('pwa-prompt-dismissed')) return

    // Don't show if already running as installed PWA
    const isStandalone =
      ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
      window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua)

    if (isIOS) {
      setPlatform('ios')
      setTimeout(() => setShow(true), 4000)
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      setPlatform('android')
      setTimeout(() => setShow(true), 4000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  function dismiss() {
    sessionStorage.setItem('pwa-prompt-dismissed', '1')
    setShow(false)
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      deferredPrompt = null
      setShow(false)
    }
  }

  if (!show || !platform) return null

  const t = darkMode
    ? { bg: '#0F1B45', text: '#ffffff', muted: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.1)' }
    : { bg: '#ffffff', text: '#0B1437', muted: 'rgba(11,20,55,0.55)', border: 'rgba(11,20,55,0.12)' }

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl p-4"
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/icon-192.png" alt="Habitat" className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div>
            <p className="text-sm font-medium" style={{ color: t.text }}>
              Install Habit·at
            </p>
            {platform === 'ios' ? (
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: t.muted }}>
                Tap <strong style={{ color: t.text }}>Share</strong> then{' '}
                <strong style={{ color: t.text }}>Add to Home Screen</strong>
              </p>
            ) : (
              <p className="text-xs mt-0.5" style={{ color: t.muted }}>
                Add to home screen for the best experience
              </p>
            )}
          </div>
        </div>
        <button
          onClick={dismiss}
          className="text-base flex-shrink-0 mt-0.5"
          style={{ color: t.muted }}
        >
          ✕
        </button>
      </div>

      {platform === 'android' && (
        <button
          onClick={install}
          className="mt-3 w-full py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: '#2563EB' }}
        >
          Install
        </button>
      )}

      {platform === 'ios' && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(11,20,55,0.04)' }}>
          <span style={{ fontSize: 18 }}>⬆️</span>
          <p className="text-xs" style={{ color: t.muted }}>
            Use the Share button at the bottom of Safari
          </p>
        </div>
      )}
    </div>
  )
}
