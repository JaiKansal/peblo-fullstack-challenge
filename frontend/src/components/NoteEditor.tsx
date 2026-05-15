import React, { useCallback, useEffect, useRef, useState } from 'react'
import { generateSummary, updateNote } from '../lib/api'
import type { Note } from '../lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface NoteEditorProps {
  note: Note
  onUpdate: (updated: Note) => void
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState<string[]>(note.tags)
  const [tagInput, setTagInput] = useState('')
  const [isPublic, setIsPublic] = useState(note.is_public)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')

  const debouncedTitle = useDebounce(title, 800)
  const debouncedContent = useDebounce(content, 800)
  const debouncedIsPublic = useDebounce(isPublic, 800)
  const debouncedTags = useDebounce(tags, 800)

  const isFirstRender = useRef(true)

  // Reset when note changes
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setTags(note.tags)
    setIsPublic(note.is_public)
    isFirstRender.current = true
  }, [note.id]) // eslint-disable-line

  const save = useCallback(async (patch: Partial<Note>) => {
    setSaving(true)
    setSaveStatus('saving')
    try {
      const updated = await updateNote(note.id, patch)
      onUpdate(updated)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('idle')
    } finally {
      setSaving(false)
    }
  }, [note.id, onUpdate])

  // Auto-save debounced
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    save({ title: debouncedTitle, content: debouncedContent, tags: debouncedTags, is_public: debouncedIsPublic })
  }, [debouncedTitle, debouncedContent, debouncedTags, debouncedIsPublic]) // eslint-disable-line

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!tags.includes(newTag)) setTags((t) => [...t, newTag])
      setTagInput('')
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((t) => t.slice(0, -1))
    }
  }

  const handleGenerateSummary = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      const result = await generateSummary(note.id)
      onUpdate(result.note)
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const shareUrl = `${window.location.origin}/shared/${note.id}`

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-white/10 shrink-0 bg-white dark:bg-surface-900 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {saving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
            {saveStatus === 'saved' && !saving && <span className="text-emerald-500">✓ Saved</span>}
            {saveStatus === 'saving' && <span>Saving…</span>}
          </div>
          
          {/* View Toggle */}
          <div className="flex p-0.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                mode === 'edit' ? 'bg-white dark:bg-surface-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                mode === 'preview' ? 'bg-white dark:bg-surface-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Public toggle */}
        <div className="flex items-center gap-2.5">
          {isPublic && (
            <button
              id="note-copy-link"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl)
                alert('Public link copied to clipboard!')
              }}
              className="btn-ghost text-xs py-1 px-2.5 dark:text-slate-400"
              title="Copy share link"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy link
            </button>
          )}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs text-slate-400">Public</span>
            <button
              id="note-public-toggle"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic((p) => !p)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                isPublic ? 'bg-brand-600' : 'bg-slate-200 dark:bg-surface-500'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                isPublic ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </button>
          </label>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 space-y-4">
        {/* Title */}
        <input
          id="note-title"
          type="text"
          className="w-full bg-transparent text-2xl font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none border-none transition-colors"
          placeholder="Note title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 items-center border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 bg-slate-50 dark:bg-surface-700/40 focus-within:border-brand-500/50 transition-colors">
          {tags.map((tag) => (
            <span key={tag} className="tag-pill cursor-pointer dark:bg-surface-600" onClick={() => setTags((t) => t.filter((x) => x !== tag))}>
              {tag}
              <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          ))}
          <input
            id="note-tag-input"
            className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none"
            placeholder="Add tag, press Enter…"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </div>

        {/* Content Section */}
        <div className="min-h-[400px]">
          {mode === 'edit' ? (
            <textarea
              id="note-content"
              className="w-full min-h-[400px] bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 text-sm leading-relaxed focus:outline-none resize-none font-mono transition-colors"
              placeholder="Start writing your note with Markdown…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none animate-fade-in text-sm bg-slate-50 dark:bg-white/5 rounded-xl p-6 border border-slate-100 dark:border-white/5 min-h-[400px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*No content to preview*'}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* AI Section */}
        <div className="border-t border-slate-100 dark:border-white/10 pt-4 space-y-4">
          <button
            id="note-generate-ai"
            onClick={handleGenerateSummary}
            disabled={aiLoading || !content.trim()}
            className="btn-primary"
          >
            {aiLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )}
            {aiLoading ? 'Generating…' : 'Generate AI Summary'}
          </button>

          {aiError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{aiError}</p>
          )}

          {note.ai_summary && (
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm font-semibold">AI Summary</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">{note.ai_summary}</p>

              {note.action_items && note.action_items.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2">Action Items</p>
                  <ul className="space-y-1.5">
                    {note.action_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-4 h-4 rounded border border-brand-500/30 dark:border-brand-600/50 shrink-0 mt-0.5 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-sm bg-brand-500" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
