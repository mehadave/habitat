import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useHabits, useAddHabit, useUpdateHabit, useDeleteHabit, useToggleCompletion } from '../hooks/useHabits'
import { useUIStore } from '../store/uiStore'
import { HabitCard } from '../components/HabitCard'
import { MonthlyHabitTracker } from '../components/MonthlyHabitTracker'
import { ArchivedHabitsSection } from '../components/ArchivedHabitsSection'
import {
  getHabitPref,
  setHabitPref,
  requestNotificationPermission,
  syncNotificationsToSW,
} from '../hooks/useNotifications'
import type { HabitWithStreak } from '../lib/types'

// Quick-access emojis shown in the horizontal strip
const QUICK_EMOJIS = ['⭐','🏃','📚','💧','🧘','💪','🍎','😴','🎯','✍️','🎸','🌱','🧹','💊','☀️','🐬','🌊','🏊','🦋','🔥']

// Full emoji grid picker data — supports flags, ZWJ sequences, everything
const EMOJI_CATS: { icon: string; name: string; emojis: string[] }[] = [
  { icon: '😀', name: 'Smileys', emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'] },
  { icon: '🏃', name: 'People', emojis: [
    // Hands & gestures — default + skin tones
    '👋','👋🏻','👋🏼','👋🏽','👋🏾','👋🏿',
    '✋','✋🏻','✋🏼','✋🏽','✋🏾','✋🏿',
    '👍','👍🏻','👍🏼','👍🏽','👍🏾','👍🏿',
    '👎','👎🏻','👎🏼','👎🏽','👎🏾','👎🏿',
    '✊','✊🏻','✊🏼','✊🏽','✊🏾','✊🏿',
    '👏','👏🏻','👏🏼','👏🏽','👏🏾','👏🏿',
    '🙏','🙏🏻','🙏🏼','🙏🏽','🙏🏾','🙏🏿',
    '💪','💪🏻','💪🏼','💪🏽','💪🏾','💪🏿',
    '✍️','✍🏻','✍🏼','✍🏽','✍🏾','✍🏿',
    '🤝','🤜','🤛','🤙','🤙🏻','🤙🏽','🤙🏿',
    // People — running/walking/standing with skin tones
    '🏃','🏃🏻','🏃🏼','🏃🏽','🏃🏾','🏃🏿',
    '🏃‍♀️','🏃🏻‍♀️','🏃🏼‍♀️','🏃🏽‍♀️','🏃🏾‍♀️','🏃🏿‍♀️',
    '🏃‍♂️','🏃🏻‍♂️','🏃🏼‍♂️','🏃🏽‍♂️','🏃🏾‍♂️','🏃🏿‍♂️',
    '🚶','🚶🏻','🚶🏼','🚶🏽','🚶🏾','🚶🏿',
    '🚶‍♀️','🚶🏻‍♀️','🚶🏼‍♀️','🚶🏽‍♀️','🚶🏾‍♀️','🚶🏿‍♀️',
    '🧘','🧘🏻','🧘🏼','🧘🏽','🧘🏾','🧘🏿',
    '🧘‍♀️','🧘🏻‍♀️','🧘🏼‍♀️','🧘🏽‍♀️','🧘🏾‍♀️','🧘🏿‍♀️',
    '🏊','🏊🏻','🏊🏼','🏊🏽','🏊🏾','🏊🏿',
    '🏊‍♀️','🏊🏻‍♀️','🏊🏼‍♀️','🏊🏽‍♀️','🏊🏾‍♀️','🏊🏿‍♀️',
    '🚴','🚴🏻','🚴🏼','🚴🏽','🚴🏾','🚴🏿',
    '🚴‍♀️','🚴🏻‍♀️','🚴🏼‍♀️','🚴🏽‍♀️','🚴🏾‍♀️','🚴🏿‍♀️',
    // Faces with hair
    '👩','👩🏻','👩🏼','👩🏽','👩🏾','👩🏿',
    '👨','👨🏻','👨🏼','👨🏽','👨🏾','👨🏿',
    '👱‍♀️','👱🏻‍♀️','👱🏼‍♀️','👱🏽‍♀️','👱🏾‍♀️','👱🏿‍♀️',
    '👩‍🦱','👩🏻‍🦱','👩🏼‍🦱','👩🏽‍🦱','👩🏾‍🦱','👩🏿‍🦱',
    '👩‍🦰','👩🏻‍🦰','👩🏼‍🦰','👩🏽‍🦰','👩🏾‍🦰','👩🏿‍🦰',
    '👩‍🦳','👩🏻‍🦳','👩🏼‍🦳','👩🏽‍🦳','👩🏾‍🦳','👩🏿‍🦳',
    '👩‍🦲','👩🏻‍🦲','👩🏼‍🦲','👩🏽‍🦲','👩🏾‍🦲','👩🏿‍🦲',
    '👨‍🦱','👨🏻‍🦱','👨🏼‍🦱','👨🏽‍🦱','👨🏾‍🦱','👨🏿‍🦱',
    '👨‍🦰','👨🏻‍🦰','👨🏼‍🦰','👨🏽‍🦰','👨🏾‍🦰','👨🏿‍🦰',
    '🧔','🧔🏻','🧔🏼','🧔🏽','🧔🏾','🧔🏿',
    '🧓','👴','👴🏻','👴🏼','👴🏽','👴🏾','👴🏿','👵','👵🏻','👵🏼','👵🏽','👵🏾','👵🏿',
    // Roles
    '👮','💂','🥷','👷','🤴','👸','👳','🧕','🤵','👰','🤰','🤱','👼','🎅','🤶','🦸','🦹','🧙','🧝','🧚',
    '🧑‍⚕️','🧑‍🎓','🧑‍🏫','🧑‍🌾','🧑‍🍳','🧑‍🔧','🧑‍💼','🧑‍🔬','🧑‍🎨','🧑‍✈️','🧑‍🚀','🧑‍🚒','🧑‍💻',
    // Groups
    '👫','👬','👭','💏','💑','👨‍👩‍👦','👨‍👩‍👧','👪',
  ] },
  { icon: '🐶', name: 'Animals', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🦂','🐢','🐍','🦎','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿','🦔'] },
  { icon: '🍔', name: 'Food', emojis: ['🍎','🍊','🍋','🍇','🍓','🫐','🍈','🍉','🍌','🍍','🥭','🍑','🍒','🍐','🥝','🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶','🫑','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🫓','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫔','🌮','🌯','🥙','🧆','🍜','🍝','🍛','🍲','🫕','🍣','🍱','🥟','🍤','🍙','🍚','🍘','🍥','🥮','🍢','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','☕','🫖','🍵','🧃','🥤','🧋','🍺','🍷','🥂','🍾','🥃','🍸','🍹','🧊','🧂'] },
  { icon: '⚽', name: 'Sports', emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸','🥌','🎿','⛷','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🏇','🧘','🏄','🏊','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🎖','🏅','🎗','🎪','🎭','🎨','🎬','🎤','🎧','🎼','🎵','🎶','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','🎲','♟','🎯','🎳','🎮','🎰','🧩','🎠','🎡','🎢'] },
  { icon: '❤️', name: 'Symbols', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','⭐','🌟','✨','💫','🔥','💧','🌊','🌈','⚡','❄️','🌙','☀️','🌸','🌺','🌻','🌹','🌷','🍀','🌿','🍃','🍂','🍁','🌱','🌾','🎁','🎀','🎊','🎉','🎈','🎆','🎇','✅','❌','❓','❗','💯','🔴','🟡','🟢','🔵','⚫','⚪','🏆','🎯','🔮','💎','🔑','🗝','🔐','🔒','🔓','⚙️','🔧','🔨','⚒️','🛠','⛏','🪚','🔩','🧲','💡','🔦','🕯','🪔','🧨','🎤','📱','💻','🖥','⌨️','🖨','🖱','💾','💿','📀','📸','📷','🎥','📞','☎️','📟','📠','📺','📻','🧭','⏰','⌚','📡','🔭','🔬','💊','🩺','🩹','🧪','🧫','🧬'] },
  { icon: '🇺🇸', name: 'Flags', emojis: ['🇦🇫','🇦🇱','🇩🇿','🇦🇩','🇦🇴','🇦🇬','🇦🇷','🇦🇲','🇦🇺','🇦🇹','🇦🇿','🇧🇸','🇧🇭','🇧🇩','🇧🇧','🇧🇾','🇧🇪','🇧🇿','🇧🇯','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇷','🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇨🇻','🇰🇭','🇨🇲','🇨🇦','🇨🇫','🇹🇩','🇨🇱','🇨🇳','🇨🇴','🇰🇲','🇨🇬','🇨🇩','🇨🇷','🇨🇮','🇭🇷','🇨🇺','🇨🇾','🇨🇿','🇩🇰','🇩🇯','🇩🇲','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇬🇶','🇪🇷','🇪🇪','🇸🇿','🇪🇹','🇫🇯','🇫🇮','🇫🇷','🇬🇦','🇬🇲','🇬🇪','🇩🇪','🇬🇭','🇬🇷','🇬🇩','🇬🇹','🇬🇳','🇬🇼','🇬🇾','🇭🇹','🇭🇳','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇱','🇮🇹','🇯🇲','🇯🇵','🇯🇴','🇰🇿','🇰🇪','🇰🇮','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇮','🇱🇹','🇱🇺','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇭','🇲🇷','🇲🇺','🇲🇽','🇫🇲','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇦','🇲🇿','🇲🇲','🇳🇦','🇳🇷','🇳🇵','🇳🇱','🇳🇿','🇳🇮','🇳🇪','🇳🇬','🇲🇰','🇳🇴','🇴🇲','🇵🇰','🇵🇼','🇵🇸','🇵🇦','🇵🇬','🇵🇾','🇵🇪','🇵🇭','🇵🇱','🇵🇹','🇶🇦','🇷🇴','🇷🇺','🇷🇼','🇰🇳','🇱🇨','🇻🇨','🇼🇸','🇸🇲','🇸🇹','🇸🇦','🇸🇳','🇷🇸','🇸🇨','🇸🇱','🇸🇬','🇸🇰','🇸🇮','🇸🇧','🇸🇴','🇿🇦','🇸🇸','🇪🇸','🇱🇰','🇸🇩','🇸🇷','🇸🇪','🇨🇭','🇸🇾','🇹🇼','🇹🇯','🇹🇿','🇹🇭','🇹🇱','🇹🇬','🇹🇴','🇹🇹','🇹🇳','🇹🇷','🇹🇲','🇹🇻','🇺🇬','🇺🇦','🇦🇪','🇬🇧','🇺🇸','🇺🇾','🇺🇿','🇻🇺','🇻🇪','🇻🇳','🇾🇪','🇿🇲','🇿🇼'] },
]

const ALL_EMOJIS = EMOJI_CATS.flatMap(c => c.emojis)

function EmojiPicker({ t, onSelect, onClose }: {
  t: ReturnType<typeof buildTokens>
  onSelect: (e: string) => void
  onClose: () => void
}) {
  return (
    <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: `1px solid ${t.cardBorder}`, background: t.sheetBg }}>
      {/* Flat emoji grid — all categories combined */}
      <div
        className="grid overflow-y-auto px-2 py-2"
        style={{ gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, maxHeight: 240 }}
      >
        {ALL_EMOJIS.map((e, i) => (
          <button
            key={`${e}-${i}`}
            onClick={() => { onSelect(e); onClose() }}
            className="text-2xl flex items-center justify-center rounded-xl transition-all"
            style={{ height: 40, background: 'transparent' }}
            onMouseEnter={ev => { (ev.currentTarget as HTMLButtonElement).style.background = t.inputBg }}
            onMouseLeave={ev => { (ev.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}

const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa']

interface HabitFormData {
  name: string
  emoji: string
  description: string
  star_rating: number
  is_private: boolean
}

interface FormWithNotif extends HabitFormData {
  notifEnabled: boolean
  notifTime: string
  notifDays: number[]
}

function buildTokens(darkMode: boolean) {
  return darkMode ? {
    bg: '#0B1120',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.45)',
    textSub: 'rgba(255,255,255,0.3)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.09)',
    inputBg: 'rgba(255,255,255,0.07)',
    inputBorder: '1px solid rgba(255,255,255,0.12)',
    inputColor: '#fff',
    divider: 'rgba(255,255,255,0.1)',
    sheetBg: '#0F1B45',
  } : {
    bg: '#F0F4FF',
    text: '#0B1437',
    textMuted: 'rgba(11,20,55,0.88)',
    textSub: 'rgba(11,20,55,0.78)',
    cardBg: 'rgba(255,255,255,0.85)',
    cardBorder: 'rgba(11,20,55,0.18)',
    inputBg: 'rgba(11,20,55,0.09)',
    inputBorder: '1px solid rgba(11,20,55,0.15)',
    inputColor: '#0B1437',
    divider: 'rgba(11,20,55,0.1)',
    sheetBg: '#EEF3FF',
  }
}

function AddEditSheet({
  habitId,
  initial,
  onSave,
  onClose,
  t,
  isSaving,
}: {
  habitId?: string
  initial?: Partial<FormWithNotif>
  onSave: (data: FormWithNotif) => void
  onClose: () => void
  t: ReturnType<typeof buildTokens>
  isSaving?: boolean
}) {
  const existingPref = habitId ? getHabitPref(habitId) : { enabled: false, time: '09:00', days: [] }

  const [form, setForm] = useState<FormWithNotif>({
    name: initial?.name ?? '',
    emoji: initial?.emoji ?? '⭐',
    description: initial?.description ?? '',
    star_rating: initial?.star_rating ?? 0,
    is_private: initial?.is_private ?? false,
    notifEnabled: initial?.notifEnabled ?? existingPref.enabled,
    notifTime: initial?.notifTime ?? existingPref.time,
    notifDays: initial?.notifDays ?? existingPref.days,
  })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  function toggleDay(d: number) {
    setForm(f => ({
      ...f,
      notifDays: f.notifDays.includes(d)
        ? f.notifDays.filter(x => x !== d)
        : [...f.notifDays, d],
    }))
  }

  async function handleNotifToggle() {
    if (!form.notifEnabled) {
      const granted = await requestNotificationPermission()
      if (!granted) return
    }
    setForm(f => ({ ...f, notifEnabled: !f.notifEnabled }))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4 pb-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        className="w-full max-w-md rounded-3xl p-6"
        style={{
          background: t.sheetBg,
          border: `1px solid ${t.cardBorder}`,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: t.text }}>
            {initial?.name ? 'Edit habit' : 'New habit'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg leading-none"
            style={{ background: t.inputBg, color: t.textMuted, border: t.inputBorder }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Quick emoji strip + picker toggle */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 py-2 px-1">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => { setForm(f => ({ ...f, emoji: e })); setShowEmojiPicker(false) }}
              className="text-2xl flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: form.emoji === e ? 'rgba(37,99,235,0.25)' : t.inputBg,
                border: form.emoji === e ? '1.5px solid #2563EB' : t.inputBorder,
                transform: form.emoji === e ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {e}
            </button>
          ))}
          {/* More button — opens full emoji grid */}
          <button
            onClick={() => setShowEmojiPicker(v => !v)}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all font-semibold text-lg"
            style={{
              background: !QUICK_EMOJIS.includes(form.emoji) ? 'rgba(37,99,235,0.25)' : showEmojiPicker ? 'rgba(37,99,235,0.15)' : t.inputBg,
              border: !QUICK_EMOJIS.includes(form.emoji) ? '1.5px solid #2563EB' : showEmojiPicker ? '1.5px solid rgba(37,99,235,0.5)' : t.inputBorder,
              color: t.textMuted,
            }}
            title="Browse all emoji"
          >
            {!QUICK_EMOJIS.includes(form.emoji) ? form.emoji : '＋'}
          </button>
        </div>

        {/* Full emoji grid picker */}
        {showEmojiPicker && (
          <EmojiPicker
            t={t}
            onSelect={(e) => setForm(f => ({ ...f, emoji: e }))}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        <input
          placeholder="Habit name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
          style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }}
        />

        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3 resize-none"
          style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }}
        />

        {/* Priority — High / Medium / Low pill buttons */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs flex-shrink-0" style={{ color: t.textMuted }}>Priority:</span>
          <div className="flex gap-1.5">
            {([
              { label: 'High',   value: 5, color: '#F87171', bg: 'rgba(248,113,113,0.13)', border: 'rgba(248,113,113,0.35)' },
              { label: 'Medium', value: 3, color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.35)'  },
              { label: 'Low',    value: 1, color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.30)'  },
            ] as const).map(({ label, value, color, bg, border }) => {
              const sel = (label === 'High' && form.star_rating >= 4)
                       || (label === 'Medium' && form.star_rating >= 2 && form.star_rating < 4)
                       || (label === 'Low' && form.star_rating < 2)
              return (
                <button
                  key={label}
                  onClick={() => setForm({ ...form, star_rating: value })}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: sel ? bg : t.inputBg,
                    border: `1px solid ${sel ? border : 'transparent'}`,
                    color: sel ? color : t.textSub,
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Privacy toggle */}
        <div className="flex items-center justify-between mb-4 py-3 rounded-xl px-3"
          style={{ background: t.inputBg, border: t.inputBorder }}>
          <div>
            <p className="text-sm font-medium" style={{ color: t.text }}>Private</p>
            <p className="text-xs" style={{ color: t.textMuted }}>Blurs name & emoji</p>
          </div>
          <button
            onClick={() => setForm({ ...form, is_private: !form.is_private })}
            className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
            style={{ background: form.is_private ? '#2563EB' : t.cardBorder }}
          >
            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ left: form.is_private ? '22px' : '2px' }} />
          </button>
        </div>

        {/* Reminder section */}
        <div className="rounded-xl mb-5 overflow-hidden" style={{ border: t.inputBorder }}>
          <div className="flex items-center justify-between px-3 py-3"
            style={{ background: t.inputBg }}>
            <div>
              <p className="text-sm font-medium" style={{ color: t.text }}>Daily reminder</p>
              <p className="text-xs" style={{ color: t.textMuted }}>
                {form.notifEnabled ? `Notifies at ${form.notifTime}` : 'Off'}
              </p>
            </div>
            <button
              onClick={handleNotifToggle}
              className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
              style={{ background: form.notifEnabled ? '#2563EB' : t.cardBorder }}
            >
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                style={{ left: form.notifEnabled ? '22px' : '2px' }} />
            </button>
          </div>

          {form.notifEnabled && (
            <div className="px-3 pb-3 pt-2" style={{ background: t.inputBg, borderTop: `1px solid ${t.divider}` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs" style={{ color: t.textMuted }}>Time</span>
                <input
                  type="time"
                  value={form.notifTime}
                  onChange={(e) => setForm({ ...form, notifTime: e.target.value })}
                  className="px-3 py-1.5 rounded-lg text-sm outline-none"
                  style={{ background: t.cardBg, border: t.inputBorder, color: t.inputColor }}
                />
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: t.textMuted }}>
                  Days {form.notifDays.length === 0 ? '(every day)' : ''}
                </p>
                <div className="flex gap-1.5">
                  {DAY_LABELS.map((label, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: form.notifDays.includes(i) ? 'rgba(37,99,235,0.3)' : t.cardBg,
                        border: form.notifDays.includes(i) ? '1.5px solid #2563EB' : t.inputBorder,
                        color: form.notifDays.includes(i) ? '#93C5FD' : t.textMuted,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => { if (form.name.trim() && !isSaving) onSave(form) }}
          disabled={!form.name.trim() || isSaving}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
          style={{
            background: form.name.trim() && !isSaving ? '#2563EB' : t.inputBg,
            opacity: form.name.trim() && !isSaving ? 1 : 0.5,
          }}
        >
          {isSaving ? 'Saving…' : initial?.name ? 'Save changes' : 'Add habit'}
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function Habits() {
  const { data: habits = [], isLoading } = useHabits()
  const { darkMode } = useUIStore()
  const addMutation = useAddHabit()
  const updateMutation = useUpdateHabit()
  const deleteMutation = useDeleteHabit()
  const toggleMutation = useToggleCompletion()

  const [showAdd, setShowAdd] = useState(false)
  const [editHabit, setEditHabit] = useState<HabitWithStreak | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'default' | 'streak' | 'name' | 'priority'>('default')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const [manualOrder, setManualOrder] = useState<HabitWithStreak[]>([])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const t = buildTokens(darkMode)

  const activeHabits = habits.filter((h) => h.is_active !== false)

  // Keep manual order in sync when habits load/change
  const orderedHabits = useMemo(() => {
    if (manualOrder.length === 0 || sortBy !== 'default') return activeHabits
    const idOrder = manualOrder.map(h => h.id)
    return [...activeHabits].sort((a, b) => {
      const ai = idOrder.indexOf(a.id), bi = idOrder.indexOf(b.id)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
  }, [activeHabits, manualOrder, sortBy])

  const displayHabits = useMemo(() => {
    if (sortBy === 'streak') return [...orderedHabits].sort((a, b) => (b.streak?.current_streak ?? 0) - (a.streak?.current_streak ?? 0))
    if (sortBy === 'name') return [...orderedHabits].sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'priority') return [...orderedHabits].sort((a, b) => (b.star_rating ?? 0) - (a.star_rating ?? 0))
    return orderedHabits
  }, [orderedHabits, sortBy])

  async function handleAdd(data: FormWithNotif) {
    const habit = await addMutation.mutateAsync({
      name: data.name,
      emoji: data.emoji,
      description: data.description,
      star_rating: data.star_rating,
      is_private: data.is_private,
      sort_order: activeHabits.length,
    })
    if (habit && data.notifEnabled) {
      setHabitPref(habit.id, { enabled: true, time: data.notifTime, days: data.notifDays })
      syncNotificationsToSW([...habits, habit as HabitWithStreak])
    }
    setShowAdd(false)
  }

  async function handleEdit(data: FormWithNotif) {
    if (!editHabit) return
    await updateMutation.mutateAsync({
      id: editHabit.id,
      name: data.name,
      emoji: data.emoji,
      description: data.description,
      star_rating: data.star_rating,
      is_private: data.is_private,
    })
    setHabitPref(editHabit.id, { enabled: data.notifEnabled, time: data.notifTime, days: data.notifDays })
    syncNotificationsToSW(habits)
    setEditHabit(null)
  }

  function handleToggle(habitId: string, date: string) {
    const habit = habits.find(h => h.id === habitId)
    if (habit) toggleMutation.mutate({ habit, date })
  }

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 76, paddingBottom: 80 }}>
      <div className="px-4 pt-8 page-inner">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: t.text }}>Your habits</h1>
            <p className="text-sm mt-1" style={{ color: t.textMuted }}>
              {activeHabits.length} / 15 active
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => activeHabits.length < 15 && setShowAdd(true)}
            disabled={activeHabits.length >= 15}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{
              background: activeHabits.length >= 15 ? t.inputBg : '#2563EB',
              opacity: activeHabits.length >= 15 ? 0.5 : 1,
              boxShadow: activeHabits.length < 15 ? '0 2px 8px rgba(37,99,235,0.35)' : 'none',
            }}
          >
            + Add
          </motion.button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
          </div>
        ) : activeHabits.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🐬</p>
            <p className="text-sm font-semibold mb-1" style={{ color: t.text }}>No habits yet</p>
            <p className="text-xs mb-5" style={{ color: t.textMuted }}>Your first habit is one tap away.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#2563EB', boxShadow: '0 2px 8px rgba(37,99,235,0.35)' }}
            >
              Add your first habit
            </button>
          </div>
        ) : (
          <>
            {/* Monthly tracker at the top */}
            <MonthlyHabitTracker habits={activeHabits} onToggle={handleToggle} />

            {/* Sort bar */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: t.textMuted }}>
                Your Habits
              </p>
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setShowSortDropdown(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: showSortDropdown ? 'rgba(37,99,235,0.20)' : t.inputBg,
                    border: showSortDropdown ? '1px solid rgba(37,99,235,0.45)' : t.inputBorder,
                    color: t.textMuted,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                  </svg>
                  Sort
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: showSortDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {showSortDropdown && (
                  <div
                    className="absolute right-0 top-full mt-1.5 rounded-2xl overflow-hidden z-30"
                    style={{
                      background: t.sheetBg,
                      border: `1px solid ${t.cardBorder}`,
                      boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
                      minWidth: 148,
                    }}
                  >
                    {([
                      { key: 'default',  label: 'Default',       icon: 'M4 6h16M4 12h16M4 18h16' },
                      { key: 'streak',   label: 'Streak',        icon: 'M12 2C8 8 5 10 5 14a7 7 0 0014 0c0-4-3-6-7-12z' },
                      { key: 'name',     label: 'Name (A–Z)',    icon: 'M3 5h12M3 10h9M3 15h5' },
                      { key: 'priority', label: 'Priority',      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
                    ] as const).map(({ key, label, icon }) => (
                      <button
                        key={key}
                        onClick={() => { setSortBy(key); setShowSortDropdown(false) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-left transition-all"
                        style={{
                          color: sortBy === key ? '#93C5FD' : t.textMuted,
                          background: sortBy === key ? 'rgba(37,99,235,0.18)' : 'transparent',
                        }}
                        onMouseEnter={ev => { if (sortBy !== key) (ev.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}
                        onMouseLeave={ev => { (ev.currentTarget as HTMLButtonElement).style.background = sortBy === key ? 'rgba(37,99,235,0.18)' : 'transparent' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={icon}/>
                        </svg>
                        {label}
                        {sortBy === key && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Habit cards — draggable when sort is default */}
            {sortBy === 'default' ? (
              <Reorder.Group
                axis="y"
                values={displayHabits}
                onReorder={(newOrder) => setManualOrder(newOrder)}
                className="space-y-3"
                style={{ listStyle: 'none', padding: 0, margin: 0 }}
              >
                {displayHabits.map((habit) => (
                  <Reorder.Item key={habit.id} value={habit} style={{ listStyle: 'none' }}>
                    <HabitCard
                      habit={habit}
                      onToggle={handleToggle}
                      onEdit={(h) => setEditHabit(h)}
                      onDelete={(id) => setDeleteConfirm(id)}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              <div className="space-y-3">
                {displayHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggle={handleToggle}
                    onEdit={(h) => setEditHabit(h)}
                    onDelete={(id) => setDeleteConfirm(id)}
                  />
                ))}
              </div>
            )}

            {/* Archived habits section */}
            <ArchivedHabitsSection />
          </>
        )}
      </div>

      {/* Add sheet */}
      <AnimatePresence>
        {showAdd && (
          <AddEditSheet onSave={handleAdd} onClose={() => setShowAdd(false)} t={t} isSaving={addMutation.isPending} />
        )}
      </AnimatePresence>

      {/* Edit sheet */}
      <AnimatePresence>
        {editHabit && (
          <AddEditSheet
            habitId={editHabit.id}
            initial={editHabit as Partial<FormWithNotif>}
            onSave={handleEdit}
            onClose={() => setEditHabit(null)}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)' }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 8 }}
              className="w-full max-w-xs rounded-2xl p-6"
              style={{
                background: t.sheetBg,
                border: `1px solid ${t.cardBorder}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              }}
            >
              <h3 className="text-sm font-semibold mb-1" style={{ color: t.text }}>Archive this habit?</h3>
              <p className="text-xs mb-5" style={{ color: t.textMuted }}>
                Your history will be preserved. You can re-add it any time.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                  style={{ background: t.inputBg, color: t.textMuted }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { deleteMutation.mutate(deleteConfirm); setDeleteConfirm(null) }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(248,113,113,0.18)', color: '#F87171' }}
                >
                  Archive
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
