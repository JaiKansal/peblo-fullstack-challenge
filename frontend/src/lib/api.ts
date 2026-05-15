/**
 * Typed API client that forwards the Supabase session JWT to the backend.
 */
import { supabase } from './supabase'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  is_public: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
  ai_summary: string | null
  action_items: string[] | null
}

export interface InsightsData {
  total_notes: number
  recently_updated: number
  top_tags: Record<string, number>
  ai_usage_count: number
}

export interface AISummaryResult {
  summary: string
  action_items: string[]
  suggested_title: string
  note: Note
}

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as unknown as T
  return res.json()
}

// ── Notes ──────────────────────────────────────────────────────────────────

export async function fetchNotes(): Promise<Note[]> {
  return request('/notes/', { headers: await authHeaders() })
}

export async function createNote(
  payload: Pick<Note, 'title' | 'content' | 'tags' | 'is_public'>
): Promise<Note> {
  return request('/notes/', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  })
}

export async function updateNote(
  id: string,
  payload: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'is_public'>>
): Promise<Note> {
  return request(`/notes/${id}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  })
}

export async function deleteNote(id: string): Promise<void> {
  return request(`/notes/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  })
}

export async function archiveNote(id: string): Promise<Note> {
  return request(`/notes/${id}/archive`, {
    method: 'PATCH',
    headers: await authHeaders(),
  })
}

// ── AI ─────────────────────────────────────────────────────────────────────

export async function generateSummary(id: string): Promise<AISummaryResult> {
  return request(`/notes/${id}/generate-summary`, {
    method: 'POST',
    headers: await authHeaders(),
  })
}

// ── Shared ──────────────────────────────────────────────────────────────────

export async function fetchSharedNote(id: string): Promise<Note> {
  return request(`/shared/${id}`)
}

// ── Insights ────────────────────────────────────────────────────────────────

export async function fetchInsights(): Promise<InsightsData> {
  return request('/insights', { headers: await authHeaders() })
}
