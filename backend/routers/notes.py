"""
CRUD router for /notes.
All endpoints require a valid Supabase JWT.
Supabase RLS policies enforce user isolation at the DB level;
we also filter by user_id here as a defence-in-depth measure.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from auth import get_current_user
from database import get_admin_client
from models import NoteCreate, NoteOut, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


def _notes_table(db: Client):
    return db.table("notes")


# ---------------------------------------------------------------------------
# GET /notes
# ---------------------------------------------------------------------------
@router.get("/", response_model=list[NoteOut])
async def list_notes(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_admin_client),
):
    """Return all notes belonging to the authenticated user."""
    res = (
        db.table("notes")
        .select("*")
        .eq("user_id", current_user["id"])
        .eq("is_archived", False)
        .order("updated_at", desc=True)
        .execute()
    )
    return res.data


# ---------------------------------------------------------------------------
# POST /notes
# ---------------------------------------------------------------------------
@router.post("/", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(
    payload: NoteCreate,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_admin_client),
):
    """Create a new note for the authenticated user."""
    data = payload.model_dump()
    data["user_id"] = current_user["id"]
    res = _notes_table(db).insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create note")
    return res.data[0]


# ---------------------------------------------------------------------------
# PATCH /notes/{id}
# ---------------------------------------------------------------------------
@router.patch("/{note_id}", response_model=NoteOut)
async def update_note(
    note_id: UUID,
    payload: NoteUpdate,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_admin_client),
):
    """Partially update a note owned by the authenticated user."""
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    res = (
        _notes_table(db)
        .update(updates)
        .eq("id", str(note_id))
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Note not found")
    return res.data[0]


# ---------------------------------------------------------------------------
# DELETE /notes/{id}
# ---------------------------------------------------------------------------
@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_admin_client),
):
    """Delete a note owned by the authenticated user."""
    res = (
        _notes_table(db)
        .delete()
        .eq("id", str(note_id))
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Note not found")


@router.patch("/{note_id}/archive", response_model=NoteOut)
async def archive_note(
    note_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_admin_client),
):
    """Mark a note as archived."""
    res = (
        _notes_table(db)
        .update({"is_archived": True})
        .eq("id", str(note_id))
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Note not found")
    return res.data[0]
