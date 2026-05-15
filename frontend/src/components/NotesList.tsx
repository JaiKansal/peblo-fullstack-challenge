import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Note } from '../lib/api'

interface NotesListProps {
  notes: Note[]
  selectedId: string | null
  onSelect: (note: Note) => void
  onArchive: (id: string) => void
  loading: boolean
}

export default function NotesList({ notes, selectedId, onSelect, onArchive, loading }: NotesListProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return notes
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [notes, query])

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 bg-white dark:bg-transparent transition-colors">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="notes-search"
            type="text"
            className="input pl-9 bg-slate-50 dark:bg-surface-700/50 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Search notes or tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
            <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading notes…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">{query ? 'No notes match your search' : 'No notes yet. Create one!'}</p>
          </div>
        )}

        {filtered.map((note) => (
          <div
            key={note.id}
            id={`note-item-${note.id}`}
            onClick={() => onSelect(note)}
            className={`group relative rounded-xl p-4 cursor-pointer border transition-all duration-150 ${
              selectedId === note.id
                ? 'bg-brand-50 dark:bg-brand-600/15 border-brand-200 dark:border-brand-600/40 shadow-sm'
                : 'bg-white dark:bg-surface-700/40 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/15'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate flex-1">{note.title || 'Untitled'}</h3>
              <button
                id={`note-archive-${note.id}`}
                onClick={(e) => { e.stopPropagation(); onArchive(note.id) }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-amber-500 transition-all p-0.5 shrink-0"
                title="Archive note"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {note.content || 'No content…'}
            </p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-wrap gap-1">
                {note.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag-pill dark:bg-surface-600">{tag}</span>
                ))}
                {note.tags.length > 3 && (
                  <span className="tag-pill">+{note.tags.length - 3}</span>
                )}
              </div>
              <span className="text-xs text-slate-600 shrink-0 ml-2">
                {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
              </span>
            </div>

            {note.is_public && (
              <div className="absolute top-3 right-8">
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-1.5 py-0.5">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  Public
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
