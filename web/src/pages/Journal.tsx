import { useState, useRef, useCallback, useEffect } from 'react'
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

/* ── Draft persistence key ───────────────────────────────────────────────── */
const DRAFT_KEY = 'habitat-journal-draft'

/* ── Voice blob hook ─────────────────────────────────────────────────────── */
function useVoiceBlob(onText: (text: string) => void) {
  const [recording, setRecording] = useState(false)
  const [micBlocked, setMicBlocked] = useState(false)
  const recognitionRef = useRef<any>(null)
  const wakeLockRef = useRef<any>(null)
  const onTextRef = useRef(onText)
  onTextRef.current = onText

  function acquireWakeLock() {
    if ('wakeLock' in navigator) {
      ;(navigator as any).wakeLock.request('screen')
        .then((lock: any) => { wakeLockRef.current = lock })
        .catch(() => { /* not supported or denied */ })
    }
  }

  function releaseWakeLock() {
    wakeLockRef.current?.release().catch(() => {})
    wakeLockRef.current = null
  }

  const stop = useCallback(() => {
    const r = recognitionRef.current
    if (r) {
      recognitionRef.current = null
      r.onend = null  // prevent double setState from the onend event
      r.stop()
    }
    setRecording(false)
    releaseWakeLock()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = useCallback(async () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    // Check permission state if API is available
    if (navigator.permissions) {
      try {
        const perm = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        if (perm.state === 'denied') {
          setMicBlocked(true)
          return
        }
      } catch { /* browser may not support mic permission query */ }
    }

    setMicBlocked(false)
    const r = new SR()
    r.continuous = true
    r.interimResults = false  // No interim events — fewer callbacks, eliminates Android duplicate bug
    r.lang = 'en-US'

    // Track committed result indices so we never process the same result twice.
    // Android Chrome (and some other mobile browsers) can re-fire onresult for
    // the same resultIndex — either with updated text or as exact duplicates.
    // A Set keyed by index is the most robust guard: once index N is committed,
    // we ignore any future event that tries to deliver it again.
    const committedIndices = new Set<number>()

    r.onresult = (e: any) => {
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal && !committedIndices.has(i)) {
          committedIndices.add(i)
          const text = e.results[i][0].transcript.trim()
          if (text) onTextRef.current(text)
        }
      }
    }

    r.onerror = (e: any) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setMicBlocked(true)
      }
      recognitionRef.current = null
      setRecording(false)
      releaseWakeLock()
    }

    // onend fires when recognition stops (timeout, silence, or manually) —
    // if recognitionRef is still set here it means it auto-stopped (not us).
    r.onend = () => {
      recognitionRef.current = null
      setRecording(false)
      releaseWakeLock()
    }

    r.start()
    recognitionRef.current = r
    setRecording(true)
    acquireWakeLock()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tap-to-toggle: one tap starts, another tap stops
  const toggle = useCallback(() => {
    if (recognitionRef.current) {
      stop()
    } else {
      start()
    }
  }, [start, stop])

  return { recording, micBlocked, setMicBlocked, start, stop, toggle }
}

/* ── Timeline entry card ─────────────────────────────────────────────────── */
function TimelineEntry({
  entry,
  onDelete,
  onEdit,
  isFirst,
  t,
}: {
  entry: JournalEntry
  onDelete: (id: string) => void
  onEdit: (entry: JournalEntry) => void
  isFirst: boolean
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
              style={{ color: isFirst ? cat.color : t.text }}
            >
              {isFirst ? `Today · ${dateLabel}` : dateLabel}
            </span>
            <span className="text-[9px] font-medium" style={{ color: t.textMuted }}>{timeLabel}</span>
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
  const t = {
    bg: 'var(--bg-app)',
    text: 'var(--text-1)',
    textMuted: 'var(--text-2)',
    textSub: 'var(--text-3)',
    cardBg: 'var(--surface)',
    cardBorder: 'var(--border)',
    inputBg: 'var(--input-bg)',
    inputBorder: '1px solid var(--input-border)',
    inputColor: 'var(--text-1)',
    sheetBg: 'var(--surface-alt)',
    spineBg: darkMode ? 'rgba(37,99,235,0.25)' : 'rgba(37,99,235,0.15)',
  }

  /* editor state */
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<number>(6)
  const [category, setCategory] = useState<CategoryId>('brain-dump')
  const [currentId, setCurrentId] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [autoSaved, setAutoSaved] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── Draft restore on mount ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const { content: c, mood: m, category: cat, currentId: id } = JSON.parse(raw)
        if (c && c.trim()) {
          setContent(c)
          setMood(m ?? 6)
          setCategory((cat as CategoryId) ?? 'brain-dump')
          setCurrentId(id)
          setDraftRestored(true)
          setTimeout(() => setDraftRestored(false), 3000)
        }
      }
    } catch { /* ignore corrupt storage */ }
  }, [])

  /* ── Persist draft to localStorage + Supabase auto-save on change ── */
  useEffect(() => {
    // Save to localStorage immediately
    if (content.trim()) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, mood, category, currentId }))
    } else {
      localStorage.removeItem(DRAFT_KEY)
    }

    // Debounce Supabase auto-save (2 s after last keystroke)
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    if (!content.trim()) return
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const result = await upsertMutation.mutateAsync({ id: currentId, content, mood_score: mood, category })
        if (result?.id && !currentId) {
          setCurrentId(result.id)
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, mood, category, currentId: result.id }))
        }
        setAutoSaved(true)
        setTimeout(() => setAutoSaved(false), 2000)
      } catch { /* silently ignore auto-save failures */ }
    }, 2000)

    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, mood, category])

  /* search & filter */
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const [filterCat, setFilterCat] = useState<CategoryId | null>(null)

  /* edit modal */
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)

  /* delete confirm */
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  /* voice blob */
  const { recording, micBlocked, setMicBlocked, start: startRec, toggle: toggleRec } = useVoiceBlob((text) => {
    // Functional update avoids stale closure — always appends to latest content
    setContent(prev => {
      const trimmed = prev.trimEnd()
      return trimmed ? trimmed + ' ' + text : text
    })
  })
  const voiceSupported = !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  )

  /* save / new */
  async function handleSave() {
    if (!content.trim()) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    setSaving(true)
    await upsertMutation.mutateAsync({ id: currentId, content, mood_score: mood, category })
    localStorage.removeItem(DRAFT_KEY)
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
    (!search || e.content.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat || e.category === filterCat)
  )

  const activeCat = catById(category)

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 76, paddingBottom: 80 }}>
      <div className="px-4 pt-8 page-inner">

        {/* Header */}
        <div className="flex flex-col items-center mb-5">
          <DolphinLogo size={44} color="pink" />
          <h1 className="text-2xl font-bold mt-3" style={{ color: t.text }}>brain dump. no filter.</h1>
        </div>

        {/* ── Draft restored banner ── */}
        <AnimatePresence>
          {draftRestored && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs font-semibold"
              style={{ background: 'rgba(96,165,250,0.15)', color: 'var(--accent-text)', border: '1px solid rgba(96,165,250,0.3)' }}
            >
              <span>☁</span>
              <span>Draft restored — pick up where you left off</span>
            </motion.div>
          )}
        </AnimatePresence>

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
                    minWidth: 0,
                  }}
                >
                  <span className="text-base md:text-xl">{cat.emoji}</span>
                  <span className="text-[9px] md:text-xs">{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Mic blocked banner */}
          <AnimatePresence>
            {micBlocked && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl mb-3 text-xs"
                style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.28)', color: '#F87171' }}
              >
                <span>🎙 Mic access blocked. Enable it in your browser/phone settings, then try again.</span>
                <button onClick={() => setMicBlocked(false)} style={{ flexShrink: 0, opacity: 0.6 }}>✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Frog category hint */}
          {category === 'morning-frog' && !content.trim() && (
            <p className="text-sm mb-2 leading-snug" style={{ color: t.textMuted }}>
              What's the one biggest task{' '}
              <em style={{ fontStyle: 'italic', opacity: 0.75 }}>(frog)</em>{' '}
              you wanna do{' '}
              <em style={{ fontStyle: 'italic', opacity: 0.75 }}>(eat)</em>{' '}
              today?{' '}
              <em style={{ fontStyle: 'italic', opacity: 0.6, fontSize: '0.8em' }}>
                — from "Eat the Frog" by Brian Tracy
              </em>
            </p>
          )}

          {/* Textarea */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`${activeCat.emoji}  ${
              category === 'vent' ? "Let it all out…" :
              category === 'ideas' ? "What's the idea?" :
              category === 'morning-frog' ? "Write your frog here…" :
              category === 'to-do' ? "What needs doing?" :
              category === 'journalling' ? "Write it out…" :
              "What's on your mind?"
            }`}
            rows={5}
            className="w-full bg-transparent outline-none text-sm leading-relaxed resize-none"
            style={{ color: t.text }}
          />

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

            {/* Mic + Save */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[9px] transition-all" style={{
                color: saved ? '#93C5FD' : autoSaved ? t.textMuted : 'transparent',
              }}>
                {saved ? '✓ Saved!' : autoSaved ? '☁ Draft saved' : '·'}
              </span>
              <div className="flex items-center gap-2">
                {voiceSupported && (
                  <button
                    onClick={micBlocked ? () => { setMicBlocked(false); startRec() } : toggleRec}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base select-none flex-shrink-0"
                    style={{
                      background: micBlocked
                        ? 'rgba(248,113,113,0.10)'
                        : recording
                          ? 'rgba(248,113,113,0.20)'
                          : t.inputBg,
                      border: micBlocked
                        ? '1px solid rgba(248,113,113,0.30)'
                        : recording
                          ? '1px solid rgba(248,113,113,0.45)'
                          : `1px solid transparent`,
                      color: micBlocked ? 'rgba(248,113,113,0.5)' : recording ? '#F87171' : t.textMuted,
                      cursor: 'pointer',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    title={micBlocked ? 'Mic blocked — tap to retry' : recording ? 'Tap to stop recording' : 'Tap to start recording'}
                  >
                    {micBlocked ? '🚫' : recording ? '⏹' : '🎙'}
                  </button>
                )}
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

        {/* ── Category filter pills ── */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none justify-center flex-wrap">
          <button
            onClick={() => setFilterCat(null)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: filterCat === null ? 'rgba(96,165,250,0.25)' : t.inputBg,
              color: filterCat === null ? 'var(--accent-text)' : t.textSub,
              border: filterCat === null ? '1px solid rgba(96,165,250,0.45)' : '1px solid transparent',
            }}
          >All</button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(filterCat === cat.id ? null : cat.id)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filterCat === cat.id ? cat.bg : t.inputBg,
                color: filterCat === cat.id ? cat.color : t.textSub,
                border: filterCat === cat.id ? `1px solid ${cat.border}` : '1px solid transparent',
              }}
            >
              <span>{cat.emoji}</span>
            </button>
          ))}
        </div>

        {/* ── Timeline ── */}
        {filtered.length === 0 ? (
          <p className="text-center text-sm py-8" style={{ color: t.textSub }}>
            {search || filterCat ? 'No entries match.' : 'Your thoughts will appear here.'}
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
                      <span className="text-[9px] font-semibold" style={{ color: sel ? 'var(--accent-text)' : t.textSub }}>{m.label}</span>
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
