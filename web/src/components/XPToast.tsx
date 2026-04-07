import { AnimatePresence, motion } from 'framer-motion'
import { useGamificationStore } from '../store/gamificationStore'

export function XPToastContainer() {
  const { toasts } = useGamificationStore()

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium"
            style={{
              background: toast.bonus ? 'rgba(37,99,235,0.9)' : 'rgba(37,99,235,0.75)',
              border: '1px solid rgba(147,197,253,0.4)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
            }}
          >
            {toast.bonus && <span>🐬</span>}
            <span>+{toast.xp} XP{toast.bonus ? ' Bonus!' : ''}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
