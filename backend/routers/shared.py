"""
Public share router – GET /shared/{id}
No authentication required. Returns note only if is_public = true.
"""
from uuid import UUID
from fastapi import APIRouter, HTTPException
from supabase import Client
from fastapi import Depends

from database import get_admin_client
from models import NoteOut

router = APIRouter(tags=["shared"])


@router.get("/shared/{note_id}", response_model=NoteOut)
async def get_shared_note(
    note_id: UUID,
    db: Client = Depends(get_admin_client),
):
    """Return a public note without requiring authentication."""
    res = (
        db.table("notes")
        .select("*")
        .eq("id", str(note_id))
        .eq("is_public", True)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(
            status_code=404,
            detail="Note not found or is not public",
        )
    return res.data
