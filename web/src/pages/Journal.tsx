import { useState } from 'react'
import { useJournalEntries, useUpsertJournal, useDeleteJournalEntry } from '../hooks/useJournal'
import { useUIStore } from '../store/uiStore'
import { DolphinLogo } from '../components/DolphinLogo'
import type { JournalEntry } from '../lib/types'

function MoodChip({ score }: { score?: number }) {
  if (!score) return null
  const color = score >= 7 ? '#93C5FD' : score >= 4 ? '#60A5FA' : '#F87171'
  const bg = score >= 7 ? 'rgba(147,197,253,0.15)' : score >= 4 ? 'rgba(96,165,250,0.15)' : 'rgba(248,113,113,0.15)'
  const emoji = score >= 8 ? '😊' : score >= 6 ? '🙂' : score >= 4 ? '😐' : '😔'
  return (
    <span className="px-2 py-0.5 rounded-full text-xs"
      style={{ background: bg, color, border: `1px solid ${color}30` }}>
      {emoji} {score}/10
    </span>
  )
}

function EntryCard({
  entry,
  onDelete,
  onEdit,
  t,
}: {
  entry: JournalEntry
  onDelete: (id: string) => void
  onEdit: (entry: JournalEntry) => void
  t: Record<string, string>
}) {
  const [expanded, setExpanded] = useState(false)
  const preview = entry.content.slice(0, 120)
  const needsExpand = entry.content.length > 120

  return (
    <div className="rounded-2xl p-4" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
      <div className="flex items-start justify-between mb-2 gap-2">
        <div>
          <p className="text-xs" style={{ color: t.textMuted }}>
            {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <MoodChip score={entry.mood_score} />
          {/* Edit icon — flipped to match HabitCard orientation */}
          <button
            onClick={() => onEdit(entry)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors"
            style={{ color: t.textSub, background: t.inputBg }}
            title="Edit entry"
          >
            <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>✏️</span>
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
            style={{ color: t.textSub, background: t.inputBg }}
            title="Delete entry"
          >
            ✕
          </button>
        </div>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: t.text }}>
        {expanded ? entry.content : preview}
        {needsExpand && !expanded && '…'}
      </p>
      {needsExpand && (
        <button onClick={() => setExpanded(e => !e)} className="text-xs mt-1"
          style={{ color: '#60A5FA' }}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}

export default function Journal() {
  const { data: entries = [] } = useJournalEntries()
  const { darkMode } = useUIStore()
  const upsertMutation = useUpsertJournal()
  const deleteMutation = useDeleteJournalEntry()

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
    divider: 'rgba(255,255,255,0.1)',
    navBg: 'rgba(11,20,55,0.85)',
    navBorder: 'rgba(255,255,255,0.06)',
    sheetBg: '#0F1B45',
    badgeBg: 'rgba(255,255,255,0.08)',
    badgeText: 'rgba(255,255,255,0.5)',
  } : {
    bg: '#F0F4FF',
    text: '#0B1437',
    textMuted: 'rgba(11,20,55,0.55)',
    textSub: 'rgba(11,20,55,0.35)',
    cardBg: 'rgba(255,255,255,0.75)',
    cardBorder: 'rgba(11,20,55,0.09)',
    inputBg: 'rgba(11,20,55,0.05)',
    inputBorder: '1px solid rgba(11,20,55,0.15)',
    inputColor: '#0B1437',
    divider: 'rgba(11,20,55,0.12)',
    navBg: 'rgba(239,244,255,0.92)',
    navBorder: 'rgba(11,20,55,0.1)',
    sheetBg: '#E8EFFF',
    badgeBg: 'rgba(11,20,55,0.07)',
    badgeText: 'rgba(11,20,55,0.5)',
  }

  const [content, setContent] = useState('')
  const [mood, setMood] = useState<number>(7)
  const [currentId, setCurrentId] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)

  // Save current content and start a new entry
  async function handleNewEntry() {
    if (!content.trim()) return
    setSaving(true)
    await upsertMutation.mutateAsync({ id: currentId, content, mood_score: mood })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
    // Clear for next entry
    setContent('')
    setMood(7)
    setCurrentId(undefined)
  }

  // Save edits to an existing past entry
  async function handleSaveEdit() {
    if (!editingEntry || !editingEntry.content.trim()) return
    setSaving(true)
    await upsertMutation.mutateAsync({ id: editingEntry.id, content: editingEntry.content, mood_score: editingEntry.mood_score })
    setSaving(false)
    setEditingEntry(null)
  }

  // Load a past entry into the editor for editing
  function handleEditEntry(entry: JournalEntry) {
    setEditingEntry({ ...entry })
  }

  const filtered = entries.filter(e =>
    !search || e.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="app-bg min-h-screen" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <div className="px-4 pt-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-5">
          <DolphinLogo size={44} color="pink" />
          <h1 className="text-2xl font-bold mt-3" style={{ color: t.text }}>brain dump. no filter.</h1>
          <p className="text-sm mt-1" style={{ color: t.textMuted }}>
            Tap "New entry" to save and start fresh.
          </p>
        </div>

        {/* Editor */}
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind today? No judgment, no filter…"
            rows={6}
            className="w-full bg-transparent outline-none text-sm leading-relaxed resize-none"
            style={{ color: t.text }}
          />

          {/* Mood slider */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: t.textMuted }}>Mood</span>
              <MoodChip score={mood} />
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: '#2563EB' }}
            />
            <div className="flex justify-between text-xs mt-0.5" style={{ color: t.textSub }}>
              <span>😔 1</span>
              <span>10 😊</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs" style={{ color: saved ? '#93C5FD' : t.textSub }}>
              {saved ? '✓ Saved!' : ''}
            </span>
            <button
              onClick={handleNewEntry}
              disabled={!content.trim() || saving}
              className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: content.trim() ? '#2563EB' : t.inputBg,
                color: content.trim() ? '#fff' : t.textSub,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving…' : '+ New entry'}
            </button>
          </div>
        </div>

        {/* Edit modal for past entries */}
        {editingEntry && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 pb-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setEditingEntry(null)}>
            <div className="w-full max-w-md rounded-3xl p-6"
              style={{ background: t.sheetBg, border: `1px solid ${t.cardBorder}`, boxShadow: '0 24px 64px rgba(0,0,0,0.45)', maxHeight: '75vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold" style={{ color: t.text }}>Edit entry</span>
                <button onClick={() => setEditingEntry(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{ background: t.inputBg, color: t.textMuted }}>×</button>
              </div>
              <p className="text-xs mb-2 font-medium" style={{ color: t.textMuted }}>
                Editing — {new Date(editingEntry.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <textarea
                value={editingEntry.content}
                onChange={e => setEditingEntry({ ...editingEntry, content: e.target.value })}
                rows={7}
                className="w-full bg-transparent outline-none text-sm leading-relaxed resize-none mb-3"
                style={{ color: t.text, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: 12 }}
              />
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: t.textMuted }}>Mood</span>
                <MoodChip score={editingEntry.mood_score} />
              </div>
              <input
                type="range" min={1} max={10}
                value={editingEntry.mood_score ?? 7}
                onChange={e => setEditingEntry({ ...editingEntry, mood_score: Number(e.target.value) })}
                className="w-full mb-4" style={{ accentColor: '#2563EB' }}
              />
              <div className="flex gap-2">
                <button onClick={() => setEditingEntry(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs"
                  style={{ background: t.inputBg, color: t.textMuted }}>
                  Cancel
                </button>
                <button onClick={handleSaveEdit} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white"
                  style={{ background: '#2563EB', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <input
          placeholder="Search entries…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-4"
          style={{ background: t.inputBg, border: t.inputBorder, color: t.inputColor }}
        />

        {/* Past entries */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-sm py-6" style={{ color: t.textSub }}>
              {search ? 'No entries match your search.' : 'Your thoughts will appear here.'}
            </p>
          ) : (
            filtered.map(e => (
              <EntryCard
                key={e.id}
                entry={e}
                onDelete={(id) => deleteMutation.mutate(id)}
                onEdit={handleEditEntry}
                t={t}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
