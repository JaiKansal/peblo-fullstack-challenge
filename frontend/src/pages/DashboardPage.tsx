import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import NotesList from '../components/NotesList'
import NoteEditor from '../components/NoteEditor'
import InsightsDashboard from '../components/InsightsDashboard'
import { createNote, archiveNote, fetchNotes } from '../lib/api'
import type { Note } from '../lib/api'

type View = 'notes' | 'insights'

export default function DashboardPage() {
  const [view, setView] = useState<View>('notes')
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Sync view with route
  useEffect(() => {
    if (pathname === '/insights') setView('insights')
    else setView('notes')
  }, [pathname])

  const loadNotes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchNotes()
      setNotes(data)
      if (!selectedNote && data.length > 0) setSelectedNote(data[0])
    } catch {
      // handle silently – auth errors will be caught by route guard
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line

  useEffect(() => { loadNotes() }, [loadNotes])

  const handleNewNote = async () => {
    try {
      const note = await createNote({ title: 'Untitled Note', content: '', tags: [], is_public: false })
      setNotes((prev) => [note, ...prev])
      setSelectedNote(note)
      setView('notes')
      navigate('/dashboard')
    } catch (e) {
      console.error(e)
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await archiveNote(id)
      setNotes((prev) => prev.filter((n) => n.id !== id))
      if (selectedNote?.id === id) {
        const remaining = notes.filter((n) => n.id !== id)
        setSelectedNote(remaining[0] ?? null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdate = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    setSelectedNote(updated)
  }

  return (
    <div className="flex h-screen bg-white dark:bg-surface-900 transition-colors duration-300 overflow-hidden">
      <Sidebar
        onNewNote={handleNewNote}
      />

      {/* Main content – offset by sidebar width */}
      <div className="flex flex-1 ml-64 overflow-hidden">
        {view === 'insights' ? (
          <div className="flex-1 overflow-y-auto bg-white dark:bg-surface-900">
            <InsightsDashboard />
          </div>
        ) : (
          <>
            {/* Notes list panel */}
            <div className="w-80 border-r border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-surface-800/50 flex flex-col overflow-hidden">
              <NotesList
                notes={notes}
                selectedId={selectedNote?.id ?? null}
                onSelect={setSelectedNote}
                onArchive={handleArchive}
                loading={loading}
              />
            </div>

            {/* Editor panel */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-surface-900">
              {selectedNote ? (
                <NoteEditor key={selectedNote.id} note={selectedNote} onUpdate={handleUpdate} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
                  <svg className="w-16 h-16 mb-4 opacity-20 dark:opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm font-medium">Select a note or create a new one</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
