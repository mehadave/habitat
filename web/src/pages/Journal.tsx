import { useState, useRef, useCallback } from 'react'
import { useJournalEntries, useUpsertJournal, useDeleteJournalEntry } from '../hooks/useJournal'
import { useUIStore } from '../store/uiStore'
import { DolphinLogo } from '../components/DolphinLogo'
import { motion, AnimatePresence } from 'framer-motion'
import type { JournalEntry } from '../lib/types'

/* ── Categories ──────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'brain-dump',   label: 'Dump',    emoji: '🧠', color: '#60A5FA', bg: 'rgba(96,165,250,0.15)',   border: 'rgba(96,165,250,0.38)'   },
  { id: 'journalling',  label: 'Journal', emoji: '📖', color: '#93C5FD', bg: 'rgba(147,197,253,0.13)',  border: 'rgba(147,197,253,0.32)'  },
  { id: 'vent',         label: 'Vent',    emoji: '🌀', color: '#A78BFA', bg: 'rgba(167,139,250,0.13)',  border: 'rgba(167,139,250,0.32)'  },
  { id: 'ideas',        label: 'Ideas',   emoji: '💡', color: '#FBBF24', bg: 'rgba(251,191,36,0.13)',   border: 'rgba(251,191,36,0.32)'   },
  { id: 'morning-frog', label: 'Frog',    emoji: '🐸', color: '#34D399', bg: 'rgba(52,211,153,0.13)',   border: 'rgba(52,211,153,0.32)'   },
  { id: 'to-do',        label: 'To-do',   emoji: '✅', color: '#6EE7B7', bg: 'rgba(110,231,183,0.13)',  border: 'rgba(110,231,183,0.32)'  },
] as const
type CategoryId = typeof CATEGORIES[number]['id']

function catById(id?: string) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0]
}

/* ── Mood options ────────────────────────────────────────────────────────── */
const MOODS = [
  { emoji: '😔', label: 'Low',   score: 2 },
  { emoji: '😐', label: 'Meh',   score: 4 },
  { emoji: '🙂', label: 'Okay',  score: 6 },
  { emoji: '😊', label: 'Good',  score: 8 },
  { emoji: '🤩', label: 'Great', score: 10 },
]

/* ── Voice blob hook ─────────────────────────────────────────────────────── */
function useVoiceBlob(onText: (text: string) => void) {
  const [recording, setRecording] = useState(false)
  const recognitionRef = useRef<any>(null)

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-US'
    r.onresult = (e: any) => {
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
      }
      if (final) onText(final)
    }
    r.start()
    recognitionRef.current = r
    setRecording(true)
  }, [onText])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setRecording(false)
  }, [])

  return { recording, start, stop }
}

/* ── Typewriter append ───────────────────────────────────────────────────── */
function typewriterAppend(
  existing: string,
  incoming: string,
  setter: (v: string) => void,
  delay = 22,
) {
  const prefix = existing ? existing + ' ' : ''
  let i = 0
  const tick = () => {
    i++
    setter(prefix + incoming.slice(0, i))
    if (i < incoming.length) setTimeout(tick, delay)
  }
  tick()
}

/* ── Timeline entry card ─────────────────────────────────────────────────── */
function TimelineEntry({
  entry,
  onDelete,
  onEdit,
  isFirst,
  darkMode,
  t,
}: {
  entry: JournalEntry
  onDelete: (id: string) => void
  onEdit: (entry: JournalEntry) => void
  isFirst: boolean
  darkMode: boolean
  t: Record<string, string>
}) {
  const [expanded, setExpanded] = useState(false)
  const cat = catById(entry.category)
  const preview = entry.content.slice(0, 110)
  const needsExpand = entry.content.length > 110

  const dateLabel = new Date(entry.created_at).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
  const timeLabel = new Date(entry.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 16 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: cat.color,
            boxShadow: isFirst ? `0 0 8px ${cat.color}` : 'none',
            border: `2px solid ${t.bg}`,
            flexShrink: 0,
            marginTop: 4,
          }}
        />
        {/* Spine line — rendered by parent */}
      </div>

      {/* Card */}
      <div className="flex-1 pb-4">
        {/* Date + actions */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: isFirst ? cat.color : t.textMuted }}
            >
              {isFirst ? `Today · ${dateLabel}` : dateLabel}
            </span>
            <span className="text-[9px]" style={{ color: t.textSub }}>{timeLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Category chip */}
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
            >
              {cat.emoji} {cat.label}
            </span>
            <button
              onClick={() => onEdit(entry)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
              style={{ background: t.inputBg, color: t.textSub }}
            >
              <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>✏️</span>
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
              style={{ background: t.inputBg, color: t.textSub }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="rounded-xl p-3"
          style={{
            background: isFirst ? cat.bg : t.cardBg,
            border: `1px solid ${isFirst ? cat.border : t.cardBorder}`,
          }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: t.text }}>
            {expanded ? entry.content : preview}
            {needsExpand && !expanded && '…'}
          </p>
          {needsExpand && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs mt-1.5"
              style={{ color: cat.color }}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function Journal() {
  const { data: entries = [] } = useJournalEntries()
  const { darkMode } = useUIStore()
  const upsertMutation = useUpsertJournal()
  const deleteMutation = useDeleteJournalEntry()

  /* theme */
  const t = darkMode ? {
    bg: '#0B1120',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.45)',
    textSub: 'rgba(255,255,255,0.3)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.09)',
    inputBg: 'rgba(255,255,255,0.07)',
    inputBorder: '1px solid rgba(255,255,255,0.12)',
    inputColor: '#fff',
    sheetBg: '#0F1B45',
    spineBg: 'rgba(37,99,235,0.25)',
  } : {
    bg: '#F0F4FF',
    text: '#0B1437',
    textMuted: 'rgba(11,20,55,0.72)',
    textSub: 'rgba(11,20,55,0.62)',
    cardBg: 'rgba(255,255,255,0.75)',
    cardBorder: 'rgba(11,20,55,0.18)',
    inputBg: 'rgba(11,20,55,0.09)',
    inputBorder: '1px solid rgba(11,20,55,0.15)',
    inputColor: '#0B1437',
    sheetBg: '#E8EFFF',
    spineBg: 'rgba(37,99,235,0.15)',
  }

  /* editor state */
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<number>(6)
  const [category, setCategory] = useState<CategoryId>('brain-dump')
  const [currentId, setCurrentId] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  /* search */
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  /* edit modal */
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)

  /* delete confirm */
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  /* voice blob */
  const { recording, start: startRec, stop: stopRec } = useVoiceBlob((text) => {
    typewriterAppend(content, text, setContent)
  })
  const voiceSupported = !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  )

  /* save / new */
  async function handleSave() {
    if (!content.trim()) return
    setSaving(true)
    await upsertMutation.mutateAsync({ id: currentId, content, mood_score: mood, category })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
    setContent('')
    setMood(6)
    setCategory('brain-dump')
    setCurrentId(undefined)
  }

  async function handleSaveEdit() {
    if (!editingEntry?.content.trim()) return
    setSaving(true)
    await upsertMutation.mutateAsync({
      id: editingEntry.id,
      content: editingEntry.content,
      mood_score: editingEntry.mood_score,
      category: editingEntry.category,
    })
    setSaving(false)
    setEditingEntry(null)
  }

  const filtered = entries.filter(e =>
    !search || e.content.toLowerCase().includes(search.toLowerCase())
  )

  const activeCat = catById(category)

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <div className="px-4 pt-4">

        {/* Header */}
        <div className="flex flex-col items-center mb-5">
          <DolphinLogo size={44} color="pink" />
          <h1 className="text-2xl font-bold mt-3" style={{ color: t.text }}>brain dump. no filter.</h1>
        </div>

        {/* ── Editor card ── */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{
            background: t.cardBg,
            border: `1px solid ${activeCat.border}`,
            transition: 'border-color 0.25s ease',
          }}
        >
          {/* Category chips — all 6 equal-width on one line */}
          <div className="flex gap-1.5 mb-3">
            {CATEGORIES.map(cat => {
              const sel = category === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl font-semibold transition-all"
                  style={{
                    background: sel ? cat.bg : t.inputBg,
                    color: sel ? cat.color : t.textSub,
                    border: `1px solid ${sel ? cat.border : 'transparent'}`,
                    boxShadow: sel ? `0 0 8px ${cat.color}33` : 'none',
                    fontSize: 9,
                    minWidth: 0,
                  }}
                >
                  <span style={{ fontSize: 15 }}>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Textarea + voice blob row */}
          <div className="relative">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={`${activeCat.emoji}  ${
                category === 'vent' ? "Let it all out…" :
                category === 'ideas' ? "What's the idea?" :
                category === 'morning-frog' ? "What's the one thing?" :
                category === 'to-do' ? "What needs doing?" :
                category === 'journalling' ? "Write it out…" :
                "What's on your mind?"
              }`}
              rows={5}
              className="w-full bg-transparent outline-none text-sm leading-relaxed resize-none pr-14"
              style={{ color: t.text }}
            />
            {/* Voice blob — absolute top-right of textarea */}
            {voiceSupported && (
              <button
                onMouseDown={startRec}
                onMouseUp={stopRec}
                onTouchStart={startRec}
                onTouchEnd={stopRec}
                className={`absolute top-0 right-0 w-10 h-10 rounded-full flex items-center justify-center text-lg select-none ${
                  recording ? 'voice-blob-recording' : 'voice-blob-idle'
                }`}
                style={{
                  background: recording
                    ? 'radial-gradient(circle at 35% 35%, #f87171, #dc2626)'
                    : 'radial-gradient(circle at 35% 35%, #3b82f6, #1d4ed8)',
                  border: 'none',
                  cursor: 'pointer',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
                title="Hold to dictate"
              >
                {recording ? '⏹' : '🎙'}
              </button>
            )}
          </div>

          {content.trim() && (
            <div className="text-right mb-1">
              <span className="text-[9px]" style={{ color: t.textSub }}>{content.length} chars</span>
            </div>
          )}

          {/* Bottom row: mood left, save right */}
          <div className="flex items-center justify-between gap-3 mt-3">
            {/* Mood — compact emoji row */}
            <div className="flex flex-col gap-1">
              <p className="text-[9px] font-semibold" style={{ color: t.textMuted }}>How are you feelin'?</p>
              <div className="flex gap-1">
                {MOODS.map(m => {
                  const sel = mood === m.score
                  return (
                    <button
                      key={m.score}
                      onClick={() => setMood(m.score)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        background: sel ? 'rgba(37,99,235,0.20)' : t.inputBg,
                        border: `1px solid ${sel ? 'rgba(96,165,250,0.45)' : 'transparent'}`,
                        boxShadow: sel ? '0 0 8px rgba(37,99,235,0.25)' : 'none',
                        fontSize: 18,
                      }}
                      title={m.label}
                    >
                      {m.emoji}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Save */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[9px]" style={{ color: saved ? '#93C5FD' : 'transparent' }}>✓ Saved!</span>
              <button
                onClick={handleSave}
                disabled={!content.trim() || saving}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: content.trim() ? activeCat.color : t.inputBg,
                  color: content.trim() ? '#fff' : t.textSub,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'Saving…' : '+ Save entry'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Search bar — centered, expands on focus ── */}
        <div className="flex justify-center mb-4">
          <motion.div
            animate={{ width: searchFocused || search ? '100%' : '60%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ position: 'relative' }}
          >
            <span
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 13,
                pointerEvents: 'none',
                color: t.textSub,
              }}
            >
              🔍
            </span>
            <input
              ref={searchRef}
              placeholder="Search entries…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-8 pr-4 py-2 rounded-full text-xs outline-none text-center transition-all"
              style={{
                background: t.inputBg,
                border: searchFocused ? `1px solid rgba(96,165,250,0.4)` : `1px solid transparent`,
                color: t.inputColor,
                textAlign: searchFocused || search ? 'left' : 'center',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 11,
                  color: t.textSub,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            )}
          </motion.div>
        </div>

        {/* ── Timeline ── */}
        {filtered.length === 0 ? (
          <p className="text-center text-sm py-8" style={{ color: t.textSub }}>
            {search ? 'No entries match.' : 'Your thoughts will appear here.'}
          </p>
        ) : (
          <div className="relative pl-4">
            {/* Vertical spine line */}
            <div
              style={{
                position: 'absolute',
                left: 11,
                top: 4,
                bottom: 0,
                width: 1.5,
                background: `linear-gradient(to bottom, ${t.spineBg}, transparent)`,
                borderRadius: 2,
              }}
            />
            <div className="space-y-0">
              {filtered.map((entry, i) => (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  isFirst={i === 0}
                  onDelete={id => setDeleteConfirmId(id)}
                  onEdit={e => setEditingEntry({ ...e })}
                  darkMode={darkMode}
                  t={t}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Delete confirm modal ── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.88, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 16, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="w-full max-w-xs rounded-3xl p-6"
              style={{ background: t.sheetBg, border: '1px solid rgba(248,113,113,0.25)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-2 mb-5">
                <span style={{ fontSize: 36 }}>🗑️</span>
                <p className="text-base font-bold" style={{ color: t.text }}>Delete this entry?</p>
                <p className="text-xs" style={{ color: t.textMuted }}>This can't be undone. Gone for good.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: t.inputBg, color: t.textMuted }}
                >
                  Nope, keep it
                </button>
                <button
                  onClick={() => {
                    deleteMutation.mutate(deleteConfirmId)
                    setDeleteConfirmId(null)
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
                >
                  Yes, delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit modal ── */}
      <AnimatePresence>
        {editingEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4 pb-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setEditingEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              className="w-full max-w-md rounded-3xl p-5"
              style={{ background: t.sheetBg, border: `1px solid ${catById(editingEntry.category).border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.45)', maxHeight: '80vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold" style={{ color: t.text }}>Edit entry</span>
                <button onClick={() => setEditingEntry(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: t.inputBg, color: t.textMuted, fontSize: 16 }}>×</button>
              </div>

              {/* Category */}
              <div className="flex gap-1.5 mb-3">
                {CATEGORIES.map(cat => {
                  const sel = editingEntry.category === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setEditingEntry({ ...editingEntry, category: cat.id })}
                      className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl font-semibold transition-all"
                      style={{
                        background: sel ? cat.bg : t.inputBg,
                        color: sel ? cat.color : t.textSub,
                        border: `1px solid ${sel ? cat.border : 'transparent'}`,
                        fontSize: 9,
                        minWidth: 0,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>

              <textarea
                value={editingEntry.content}
                onChange={e => setEditingEntry({ ...editingEntry, content: e.target.value })}
                rows={6}
                className="w-full bg-transparent outline-none text-sm leading-relaxed resize-none mb-3"
                style={{ color: t.text, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: 12 }}
              />

              {/* Mood */}
              <p className="text-xs mb-2" style={{ color: t.textMuted }}>How are you feelin'?</p>
              <div className="flex gap-2 mb-4">
                {MOODS.map(m => {
                  const sel = editingEntry.mood_score === m.score
                  return (
                    <button
                      key={m.score}
                      onClick={() => setEditingEntry({ ...editingEntry, mood_score: m.score })}
                      className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl"
                      style={{
                        background: sel ? 'rgba(37,99,235,0.18)' : t.inputBg,
                        border: `1px solid ${sel ? 'rgba(96,165,250,0.45)' : 'transparent'}`,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{m.emoji}</span>
                      <span className="text-[9px] font-semibold" style={{ color: sel ? '#93C5FD' : t.textSub }}>{m.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setEditingEntry(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs"
                  style={{ background: t.inputBg, color: t.textMuted }}>
                  Cancel
                </button>
                <button onClick={handleSaveEdit} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white"
                  style={{ background: '#2563EB', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
