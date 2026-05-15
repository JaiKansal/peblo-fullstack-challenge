"""
Pydantic models / schemas for the notes domain.
"""
from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request bodies
# ---------------------------------------------------------------------------

class NoteCreate(BaseModel):
    title: str = Field(default="Untitled Note", max_length=255)
    content: str = Field(default="")
    tags: List[str] = Field(default_factory=list)
    is_public: bool = False


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None


# ---------------------------------------------------------------------------
# Response bodies
# ---------------------------------------------------------------------------

class NoteOut(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    content: str
    tags: List[str]
    is_public: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    ai_summary: Optional[str] = None
    action_items: Optional[List[str]] = None

    model_config = {"from_attributes": True}


class InsightsOut(BaseModel):
    total_notes: int
    recently_updated: int          # updated in last 7 days
    top_tags: dict[str, int]       # tag -> count (top 5)
    ai_usage_count: int
