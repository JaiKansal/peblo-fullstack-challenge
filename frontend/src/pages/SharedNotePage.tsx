import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchSharedNote } from '../lib/api'
import type { Note } from '../lib/api'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function SharedNotePage() {
  const { id } = useParams<{ id: string }>()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchSharedNote(id)
      .then(setNote)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-white dark:bg-surface-900 transition-colors duration-300 p-4 sm:p-8 flex flex-col items-center">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-600/5 dark:bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-900/10 dark:bg-brand-900/20 blur-3xl" />
      </div>

      {/* Header */}
      <div className="w-full max-w-3xl flex items-center gap-2.5 mb-8">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-200">NoteAI</span>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-surface-700/60 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-full">
          Shared Note
        </span>
      </div>

      {/* Content */}
      <main className="w-full max-w-3xl animate-slide-up">
        {loading && (
          <div className="text-center py-20 text-slate-500">
            <svg className="w-8 h-8 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading note…
          </div>
        )}

        {error && (
          <div className="bg-white dark:bg-surface-800 border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center shadow-xl">
            <div className="text-4xl mb-3">🔒</div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200 mb-1">Note not available</h2>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        )}

        {note && (
          <article className="bg-white dark:bg-surface-800 border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-xl">
            <h1 id="shared-note-title" className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">{note.title}</h1>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              {note.tags.map((tag) => (
                <span key={tag} className="tag-pill dark:bg-surface-700">{tag}</span>
              ))}
              <span className="text-xs text-slate-500 ml-auto">
                Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
              </span>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-100 dark:border-white/10 pt-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content}
              </ReactMarkdown>
            </div>

            {note.ai_summary && (
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-300 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm font-semibold">AI Summary</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 italic">{note.ai_summary}</p>
                {note.action_items && note.action_items.length > 0 && (
                  <>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Action Items</p>
                    <ul className="space-y-1.5">
                      {note.action_items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <div className="w-4 h-4 rounded border border-brand-200 dark:border-brand-600/50 shrink-0 mt-0.5 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-sm bg-brand-500" />
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </article>
        )}
      </main>
    </div>
  )
}
