import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useHabits, useAddHabit, useUpdateHabit, useDeleteHabit, useToggleCompletion } from '../hooks/useHabits'
import { useRoutines, useAddRoutine, useUpdateRoutine, useDeleteRoutine } from '../hooks/useRoutines'
import { HabitCard } from '../components/HabitCard'
import { RoutineSection } from '../components/RoutineSection'
import { MonthlyHabitTracker } from '../components/MonthlyHabitTracker'
import { ArchivedHabitsSection } from '../components/ArchivedHabitsSection'
import {
  getHabitPref,
  setHabitPref,
  requestNotificationPermission,
  syncNotificationsToSW,
} from '../hooks/useNotifications'
import type { HabitWithStreak, Routine } from '../lib/types'

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
  routine_id: string | null
}

function buildTokens() {
  return {
    bg: 'var(--bg-app)',
    text: 'var(--text-1)',
    textMuted: 'var(--text-2)',
    textSub: 'var(--text-3)',
    cardBg: 'var(--surface)',
    cardBorder: 'var(--border)',
    inputBg: 'var(--input-bg)',
    inputBorder: '1px solid var(--input-border)',
    inputColor: 'var(--text-1)',
    divider: 'var(--divider)',
    sheetBg: 'var(--surface-alt)',
  }
}


const DRUM_ITEM_H = 44
const DRUM_VISIBLE = 3

function DrumPicker({ items, value, onChange, width = 60 }: {
  items: string[]
  value: string
  onChange: (v: string) => void
  width?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const scrolling = useRef(false)

  useEffect(() => {
    const idx = items.indexOf(value)
    if (ref.current && idx >= 0 && !scrolling.current) {
      ref.current.scrollTop = idx * DRUM_ITEM_H
    }
  }, [value, items])

  function handleScroll() {
    scrolling.current = true
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      scrolling.current = false
      if (!ref.current) return
      const idx = Math.round(ref.current.scrollTop / DRUM_ITEM_H)
      const clamped = Math.max(0, Math.min(items.length - 1, idx))
      if (items[clamped] !== value) onChange(items[clamped])
    }, 120)
  }

  return (
    <div style={{ position: 'relative', width, height: DRUM_ITEM_H * DRUM_VISIBLE, overflow: 'hidden' }}>
      {/* Fade top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: DRUM_ITEM_H * 1,
        background: 'linear-gradient(to bottom, var(--surface-alt) 30%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2 }} />
      {/* Fade bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: DRUM_ITEM_H * 1,
        background: 'linear-gradient(to top, var(--surface-alt) 30%, transparent 100%)',
        pointerEvents: 'none', zIndex: 2 }} />
      {/* Selection band */}
      <div style={{ position: 'absolute', top: DRUM_ITEM_H * 1, left: 4, right: 4, height: DRUM_ITEM_H,
        background: 'var(--surface-tint)', borderRadius: 10,
        pointerEvents: 'none', zIndex: 1 }} />
      {/* Scroll list */}
      <div ref={ref} onScroll={handleScroll} className="no-scrollbar"
        style={{ height: '100%', overflowY: 'scroll', scrollSnapType: 'y mandatory',
          paddingTop: DRUM_ITEM_H * 1, paddingBottom: DRUM_ITEM_H * 1 }}>
        {items.map((item, i) => {
          const sel = item === value
          return (
            <div key={i}
              onClick={() => {
                onChange(item)
                ref.current?.scrollTo({ top: i * DRUM_ITEM_H, behavior: 'smooth' })
              }}
              style={{ height: DRUM_ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
                scrollSnapAlign: 'center', userSelect: 'none', cursor: 'pointer',
                fontSize: sel ? 20 : 16, fontWeight: sel ? 700 : 400,
                color: sel ? 'var(--text-1)' : 'var(--text-3)',
              }}
            >{item}</div>
          )
        })}
      </div>
    </div>
  )
}

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))
const PERIODS = ['AM', 'PM']

function AddEditSheet({
  habitId,
  initial,
  onSave,
  onClose,
  t,
  isSaving,
  routines = [],
}: {
  habitId?: string
  initial?: Partial<FormWithNotif>
  onSave: (data: FormWithNotif) => void
  onClose: () => void
  t: ReturnType<typeof buildTokens>
  isSaving?: boolean
  routines?: Routine[]
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
    routine_id: initial?.routine_id ?? null,
  })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Time picker helpers
  const [h24, mm] = form.notifTime.split(':').map(Number)
  const isPM = h24 >= 12
  const h12 = h24 % 12 || 12
  function setAmPm(pm: boolean) {
    if (pm === isPM) return
    const next = pm ? h24 + 12 : h24 - 12
    setForm(f => ({ ...f, notifTime: `${String(next).padStart(2,'0')}:${String(mm).padStart(2,'0')}` }))
  }

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

        {/* Routine picker — only shown when routines exist */}
        {routines.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs flex-shrink-0" style={{ color: t.textMuted }}>Routine:</span>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setForm(f => ({ ...f, routine_id: null }))}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background: form.routine_id === null ? 'rgba(37,99,235,0.18)' : t.inputBg,
                  border: `1px solid ${form.routine_id === null ? 'rgba(37,99,235,0.45)' : 'transparent'}`,
                  color: form.routine_id === null ? 'var(--accent-text)' : t.textSub,
                }}
              >
                None
              </button>
              {routines.map(r => (
                <button
                  key={r.id}
                  onClick={() => setForm(f => ({ ...f, routine_id: r.id }))}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: form.routine_id === r.id ? 'rgba(37,99,235,0.18)' : t.inputBg,
                    border: `1px solid ${form.routine_id === r.id ? 'rgba(37,99,235,0.45)' : 'transparent'}`,
                    color: form.routine_id === r.id ? 'var(--accent-text)' : t.textSub,
                  }}
                >
                  {r.emoji} {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

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
              {/* Drum-roll time picker */}
              <div className="flex justify-center mb-3">
                <div className="flex items-center rounded-2xl overflow-hidden"
                  style={{ background: t.cardBg, border: t.inputBorder }}>
                  <DrumPicker
                    items={HOURS}
                    value={String(h12).padStart(2, '0')}
                    onChange={v => {
                      const newH12 = parseInt(v)
                      const newH24 = isPM ? (newH12 === 12 ? 12 : newH12 + 12) : (newH12 === 12 ? 0 : newH12)
                      setForm(f => ({ ...f, notifTime: `${String(newH24).padStart(2,'0')}:${String(mm).padStart(2,'0')}` }))
                    }}
                  />
                  <div style={{ color: 'var(--text-3)', fontWeight: 700, fontSize: 20, paddingBottom: 2, flexShrink: 0 }}>:</div>
                  <DrumPicker
                    items={MINUTES}
                    value={String(Math.round(mm / 5) * 5).padStart(2, '0')}
                    onChange={v => setForm(f => ({ ...f, notifTime: `${String(h24).padStart(2,'0')}:${v}` }))}
                  />
                  <DrumPicker
                    items={PERIODS}
                    value={isPM ? 'PM' : 'AM'}
                    onChange={v => setAmPm(v === 'PM')}
                    width={52}
                  />
                </div>
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
                        color: form.notifDays.includes(i) ? 'var(--accent-text)' : t.textMuted,
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

const ROUTINE_QUICK_EMOJIS = ['🌅','☀️','🌙','⚡','💪','📚','🧘','🏃','🍎','💧','🎯','✨','🌿','🔥','❤️','🎵','🧹','💊','🛌','🧠']

function ManageRoutinesSheet({ onClose, t, initialEditId }: {
  onClose: () => void
  t: ReturnType<typeof buildTokens>
  initialEditId?: string | null
}) {
  const { data: routines = [] } = useRoutines()
  const addRoutine = useAddRoutine()
  const updateRoutine = useUpdateRoutine()
  const deleteRoutine = useDeleteRoutine()

  const [editingId, setEditingId] = useState<string | 'new' | null>(initialEditId ?? null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formEmoji, setFormEmoji] = useState('🌅')
  const [formTimeOfDay, setFormTimeOfDay] = useState('')

  useEffect(() => {
    if (initialEditId && initialEditId !== 'new') {
      const r = routines.find(x => x.id === initialEditId)
      if (r) { setFormName(r.name); setFormEmoji(r.emoji); setFormTimeOfDay(r.time_of_day ?? '') }
    }
  }, [initialEditId, routines])

  function startEdit(r: Routine) {
    setEditingId(r.id)
    setFormName(r.name)
    setFormEmoji(r.emoji)
    setFormTimeOfDay(r.time_of_day ?? '')
  }

  function startNew() {
    setEditingId('new')
    setFormName('')
    setFormEmoji('🌅')
    setFormTimeOfDay('')
  }

  function cancelForm() {
    setEditingId(null)
    setFormName('')
    setFormEmoji('🌅')
    setFormTimeOfDay('')
  }

  async function saveForm() {
    if (!formName.trim()) return
    if (editingId === 'new') {
      await addRoutine.mutateAsync({
        name: formName.trim(),
        emoji: formEmoji,
        time_of_day: formTimeOfDay.trim() || undefined,
        sort_order: routines.length,
      })
    } else if (editingId) {
      await updateRoutine.mutateAsync({
        id: editingId,
        name: formName.trim(),
        emoji: formEmoji,
        time_of_day: formTimeOfDay.trim() || undefined,
      })
    }
    cancelForm()
  }

  async function confirmDelete(id: string) {
    await deleteRoutine.mutateAsync(id)
    setDeleteConfirmId(null)
  }

  const isSaving = addRoutine.isPending || updateRoutine.isPending

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
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: t.text }}>Manage Routines</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg leading-none"
            style={{ background: t.inputBg, color: t.textMuted, border: t.inputBorder }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Routine list */}
        {routines.length === 0 && editingId === null && (
          <p className="text-sm text-center py-6" style={{ color: t.textMuted }}>
            No routines yet. Create one to start grouping your habits.
          </p>
        )}

        <div className="space-y-2 mb-3">
          {routines.map(r => (
            <div key={r.id}>
              {editingId === r.id ? (
                /* Inline edit form */
                <div className="rounded-2xl p-4" style={{ background: t.inputBg, border: t.inputBorder }}>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3 py-1">
                    {ROUTINE_QUICK_EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => setFormEmoji(e)}
                        className="text-xl flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{
                          background: formEmoji === e ? 'rgba(37,99,235,0.25)' : t.cardBg,
                          border: formEmoji === e ? '1.5px solid #2563EB' : t.inputBorder,
                          transform: formEmoji === e ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <input
                    placeholder="Routine name"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-2"
                    style={{ background: t.cardBg, border: t.inputBorder, color: t.inputColor }}
                    autoFocus
                  />
                  <input
                    placeholder="Time label (e.g. Morning, 6 AM)"
                    value={formTimeOfDay}
                    onChange={e => setFormTimeOfDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-3"
                    style={{ background: t.cardBg, border: t.inputBorder, color: t.inputColor }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={cancelForm}
                      className="flex-1 py-2 rounded-xl text-xs font-medium"
                      style={{ background: t.cardBg, color: t.textMuted }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveForm}
                      disabled={!formName.trim() || isSaving}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-white"
                      style={{
                        background: formName.trim() && !isSaving ? '#2563EB' : t.inputBg,
                        opacity: formName.trim() && !isSaving ? 1 : 0.5,
                      }}
                    >
                      {isSaving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : deleteConfirmId === r.id ? (
                /* Delete confirm */
                <div className="rounded-2xl p-4" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: t.text }}>Delete "{r.name}"?</p>
                  <p className="text-xs mb-3" style={{ color: t.textMuted }}>
                    Habits in this routine become uncategorized. No habit data is lost.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 py-2 rounded-xl text-xs font-medium"
                      style={{ background: t.inputBg, color: t.textMuted }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => confirmDelete(r.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(248,113,113,0.18)', color: '#F87171' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                /* Routine row */
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                  style={{ background: t.inputBg, border: t.inputBorder }}
                >
                  <span className="text-lg leading-none flex-shrink-0">{r.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: t.text }}>{r.name}</p>
                    {r.time_of_day && (
                      <p className="text-xs" style={{ color: t.textMuted }}>{r.time_of_day}</p>
                    )}
                  </div>
                  <button
                    onClick={() => startEdit(r)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: t.cardBg, color: t.textMuted }}
                    title="Edit"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(r.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(248,113,113,0.10)', color: '#F87171' }}
                    title="Delete"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new routine form / button */}
        {editingId === 'new' ? (
          <div className="rounded-2xl p-4" style={{ background: t.inputBg, border: t.inputBorder }}>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3 py-1">
              {ROUTINE_QUICK_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setFormEmoji(e)}
                  className="text-xl flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: formEmoji === e ? 'rgba(37,99,235,0.25)' : t.cardBg,
                    border: formEmoji === e ? '1.5px solid #2563EB' : t.inputBorder,
                    transform: formEmoji === e ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              placeholder="Routine name"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-2"
              style={{ background: t.cardBg, border: t.inputBorder, color: t.inputColor }}
              autoFocus
            />
            <input
              placeholder="Time label (e.g. Morning, 6 AM)"
              value={formTimeOfDay}
              onChange={e => setFormTimeOfDay(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-3"
              style={{ background: t.cardBg, border: t.inputBorder, color: t.inputColor }}
            />
            <div className="flex gap-2">
              <button
                onClick={cancelForm}
                className="flex-1 py-2 rounded-xl text-xs font-medium"
                style={{ background: t.cardBg, color: t.textMuted }}
              >
                Cancel
              </button>
              <button
                onClick={saveForm}
                disabled={!formName.trim() || isSaving}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white"
                style={{
                  background: formName.trim() && !isSaving ? '#2563EB' : t.inputBg,
                  opacity: formName.trim() && !isSaving ? 1 : 0.5,
                }}
              >
                {isSaving ? 'Saving…' : 'Add Routine'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={startNew}
            className="w-full py-2.5 rounded-2xl text-sm font-semibold transition-all"
            style={{
              background: 'rgba(37,99,235,0.12)',
              color: 'var(--accent-text)',
              border: '1px solid rgba(37,99,235,0.25)',
            }}
          >
            + New Routine
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function Habits() {
  const { data: habits = [], isLoading } = useHabits()
  const addMutation = useAddHabit()
  const updateMutation = useUpdateHabit()
  const deleteMutation = useDeleteHabit()
  const toggleMutation = useToggleCompletion()

  const { data: routines = [] } = useRoutines()

  const [showAdd, setShowAdd] = useState(false)
  const [editHabit, setEditHabit] = useState<HabitWithStreak | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'default' | 'streak' | 'name' | 'priority'>('default')
  const [showManageRoutines, setShowManageRoutines] = useState(false)
  const [manageRoutinesEditId, setManageRoutinesEditId] = useState<string | null>(null)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const [manualOrder, setManualOrder] = useState<HabitWithStreak[]>([])
  const [orderReady, setOrderReady] = useState(false)
  const orderInitialized = useRef(false)

  const HABIT_ORDER_KEY = 'habitat_habit_order'

  // Restore saved order once habits load
  useEffect(() => {
    if (habits.length === 0 || orderInitialized.current) return
    orderInitialized.current = true
    let restored: HabitWithStreak[] | null = null
    try {
      const saved = localStorage.getItem(HABIT_ORDER_KEY)
      if (saved) {
        const savedIds: string[] = JSON.parse(saved)
        const active = habits.filter(h => h.is_active !== false)
        restored = [...active].sort((a, b) => {
          const ai = savedIds.indexOf(a.id)
          const bi = savedIds.indexOf(b.id)
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
        })
      }
    } catch { /* localStorage unavailable */ }
    // React 18 batches these two updates — no cascading render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (restored) setManualOrder(restored)
    setOrderReady(true)
  }, [habits])

  function handleReorder(newOrder: HabitWithStreak[]) {
    setManualOrder(newOrder)
    try {
      localStorage.setItem(HABIT_ORDER_KEY, JSON.stringify(newOrder.map(h => h.id)))
    } catch { /* localStorage unavailable */ }
  }

  function handleSectionReorder(newSectionOrder: HabitWithStreak[]) {
    const sectionIds = new Set(newSectionOrder.map(h => h.id))
    const base = manualOrder.length > 0 ? manualOrder : activeHabits
    const newOrder = [...base]
    let si = 0
    for (let i = 0; i < newOrder.length; i++) {
      if (sectionIds.has(newOrder[i].id)) newOrder[i] = newSectionOrder[si++]
    }
    const missing = newSectionOrder.filter(h => !base.find(b => b.id === h.id))
    const final = [...newOrder, ...missing]
    setManualOrder(final)
    try {
      localStorage.setItem(HABIT_ORDER_KEY, JSON.stringify(final.map(h => h.id)))
    } catch { /* localStorage unavailable */ }
  }

  function openManageRoutines(editId?: string) {
    setManageRoutinesEditId(editId ?? null)
    setShowManageRoutines(true)
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const t = buildTokens()

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
      routine_id: data.routine_id,
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
      routine_id: data.routine_id,
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
              <div className="flex items-center gap-2">
              {/* Routines button */}
              <button
                onClick={() => openManageRoutines()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: routines.length > 0 ? 'rgba(37,99,235,0.15)' : t.inputBg,
                  border: routines.length > 0 ? '1px solid rgba(37,99,235,0.35)' : t.inputBorder,
                  color: routines.length > 0 ? 'var(--accent-text)' : t.textMuted,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                Routines{routines.length > 0 ? ` (${routines.length})` : ''}
              </button>
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
                          color: sortBy === key ? 'var(--accent-text)' : t.textMuted,
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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </div>{/* end flex gap-2 */}
            </div>

            {/* Habit cards — hidden until saved order is restored to prevent shuffle */}
            {orderReady && (() => {
              const useGrouped = routines.length > 0 && sortBy === 'default'

              if (useGrouped) {
                // Group habits by routine_id
                const routineHabits = (routineId: string | null) =>
                  displayHabits.filter(h => (h.routine_id ?? null) === routineId)
                const visibleRoutines = routines.filter(r => routineHabits(r.id).length > 0)
                const uncategorized = routineHabits(null)

                return (
                  <div>
                    {visibleRoutines.map(routine => (
                      <RoutineSection
                        key={routine.id}
                        routine={routine}
                        habits={routineHabits(routine.id)}
                        isDefaultSort={true}
                        onEdit={h => setEditHabit(h)}
                        onDelete={id => setDeleteConfirm(id)}
                        onEditRoutine={r => openManageRoutines(r.id)}
                        onReorder={handleSectionReorder}
                      />
                    ))}
                    {uncategorized.length > 0 && (
                      <div>
                        {visibleRoutines.length > 0 && (
                          <p className="text-xs font-semibold tracking-wide uppercase px-1 mb-2 mt-3"
                            style={{ color: 'var(--text-3)' }}>
                            Other
                          </p>
                        )}
                        <Reorder.Group
                          axis="y"
                          values={uncategorized}
                          onReorder={handleSectionReorder}
                          className="space-y-3"
                          style={{ listStyle: 'none', padding: 0, margin: 0 }}
                        >
                          {uncategorized.map(habit => (
                            <Reorder.Item
                              key={habit.id}
                              value={habit}
                              initial={false}
                              layout
                              dragMomentum={false}
                              dragElastic={0}
                              style={{ listStyle: 'none' }}
                            >
                              <HabitCard
                                habit={habit}
                                onEdit={h => setEditHabit(h)}
                                onDelete={id => setDeleteConfirm(id)}
                              />
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                      </div>
                    )}
                  </div>
                )
              }

              // Flat view (no routines, or non-default sort)
              return sortBy === 'default' ? (
                <Reorder.Group
                  axis="y"
                  values={displayHabits}
                  onReorder={handleReorder}
                  className="space-y-3"
                  style={{ listStyle: 'none', padding: 0, margin: 0 }}
                >
                  {displayHabits.map((habit) => (
                    <Reorder.Item
                      key={habit.id}
                      value={habit}
                      initial={false}
                      layout
                      dragMomentum={false}
                      dragElastic={0}
                      style={{ listStyle: 'none' }}
                    >
                      <HabitCard
                        habit={habit}
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
                      onEdit={(h) => setEditHabit(h)}
                      onDelete={(id) => setDeleteConfirm(id)}
                    />
                  ))}
                </div>
              )
            })()}

            {/* Archived habits section */}
            <ArchivedHabitsSection />
          </>
        )}
      </div>

      {/* Add sheet */}
      <AnimatePresence>
        {showAdd && (
          <AddEditSheet
            onSave={handleAdd}
            onClose={() => setShowAdd(false)}
            t={t}
            isSaving={addMutation.isPending}
            routines={routines}
          />
        )}
      </AnimatePresence>

      {/* Edit sheet */}
      <AnimatePresence>
        {editHabit && (
          <AddEditSheet
            habitId={editHabit.id}
            initial={{ ...editHabit, routine_id: editHabit.routine_id ?? null } as Partial<FormWithNotif>}
            onSave={handleEdit}
            onClose={() => setEditHabit(null)}
            t={t}
            routines={routines}
          />
        )}
      </AnimatePresence>

      {/* Manage Routines sheet */}
      <AnimatePresence>
        {showManageRoutines && (
          <ManageRoutinesSheet
            onClose={() => { setShowManageRoutines(false); setManageRoutinesEditId(null) }}
            t={t}
            initialEditId={manageRoutinesEditId}
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
                Your history will be preserved. You can re-add it any time. To permanently delete, remove it from the Archived section at the bottom of the Habits tab.
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
