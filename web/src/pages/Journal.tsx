import { useState, useEffect, useRef, useCallback } from 'react'
import { useJournalEntries, useUpsertJournal, useDeleteJournalEntry } from '../hooks/useJournal'
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

function EntryCard({ entry, onDelete }: { entry: JournalEntry; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const preview = entry.content.slice(0, 120)
  const needsExpand = entry.content.length > 120

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <div className="flex items-start justify-between mb-2 gap-2">
        <div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <MoodChip score={entry.mood_score} />
          <button onClick={() => onDelete(entry.id)} className="text-xs"
            style={{ color: 'rgba(255,255,255,0.25)' }}>✕</button>
        </div>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: 'rgba(255,255,255,0.75)' }}>
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
  const upsertMutation = useUpsertJournal()
  const deleteMutation = useDeleteJournalEntry()

  const [content, setContent] = useState('')
  const [mood, setMood] = useState<number>(7)
  const [currentId, setCurrentId] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save on content/mood change
  const autoSave = useCallback(async (c: string, m: number, id?: string) => {
    if (!c.trim()) return
    setSaved(false)
    const result = await upsertMutation.mutateAsync({ id, content: c, mood_score: m })
    if (!id && (result as any)?.id) setCurrentId((result as any).id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  useEffect(() => {
    if (!content.trim()) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => autoSave(content, mood, currentId), 2000)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [content, mood])

  function handleNew() {
    setContent('')
    setMood(7)
    setCurrentId(undefined)
    setSaved(false)
  }

  const filtered = entries.filter(e =>
    !search || e.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen" style={{ background: '#0B1437', paddingTop: 60, paddingBottom: 80 }}>
      <div className="px-4 pt-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-5">
          <DolphinLogo size={40} />
          <h1 className="text-lg font-medium text-white mt-2">brain dump. no filter.</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Auto-saves every 2 seconds.
          </p>
        </div>

        {/* Editor */}
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind today? No judgment, no filter…"
            rows={6}
            className="w-full bg-transparent outline-none text-sm leading-relaxed resize-none"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          />

          {/* Mood slider */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Mood</span>
              <MoodChip score={mood} />
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full accent-blue-500"
              style={{ accentColor: '#2563EB' }}
            />
            <div className="flex justify-between text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              <span>😔 1</span>
              <span>10 😊</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs" style={{ color: saved ? '#93C5FD' : 'rgba(255,255,255,0.3)' }}>
              {saved ? '✓ Saved' : content.trim() ? 'Unsaved…' : ''}
            </span>
            <button
              onClick={handleNew}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}
            >
              New entry
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          placeholder="Search entries…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-4"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
        />

        {/* Past entries */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-sm py-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {search ? 'No entries match your search.' : 'Your thoughts will appear here.'}
            </p>
          ) : (
            filtered.map(e => (
              <EntryCard key={e.id} entry={e} onDelete={(id) => deleteMutation.mutate(id)} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
