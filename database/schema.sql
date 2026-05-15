-- ============================================================
-- AI Notes Workspace - Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- NOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL DEFAULT 'Untitled Note',
    content     TEXT NOT NULL DEFAULT '',
    tags        TEXT[] DEFAULT '{}',
    is_public   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ai_summary  TEXT,
    action_items TEXT[],
    is_archived BOOLEAN NOT NULL DEFAULT FALSE
);

-- Index for archiving performance
CREATE INDEX IF NOT EXISTS idx_notes_is_archived ON public.notes(is_archived);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Users can view their own notes
CREATE POLICY "notes_select_own" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own notes
CREATE POLICY "notes_insert_own" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "notes_update_own" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "notes_delete_own" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Anyone can view public notes (for share links)
CREATE POLICY "notes_select_public" ON public.notes
    FOR SELECT USING (is_public = TRUE);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_notes_user_id    ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_is_public  ON public.notes(is_public) WHERE is_public = TRUE;
