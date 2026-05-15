"""
AI router – POST /notes/{id}/generate-summary
Calls Google Gemini, extracts structured JSON, and persists results.
"""
import json
import re
from uuid import UUID

from google import genai
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from auth import get_current_user
from config import get_settings
from database import get_admin_client

router = APIRouter(tags=["ai"])

_PROMPT_TEMPLATE = """Analyze the following note. Return a JSON object with three keys:
"summary" (a brief string),
"action_items" (an array of strings),
and "suggested_title" (a string).

Note content:
{content}

Respond ONLY with valid JSON. No markdown fences, no extra text."""


def _extract_json(raw: str) -> dict:
    """Strip potential markdown fences and parse JSON."""
    cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
    return json.loads(cleaned)


@router.post("/notes/{note_id}/generate-summary")
async def generate_summary(
    note_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_admin_client),
):
    # 1. Fetch the note (must belong to current user)
    res = (
        db.table("notes")
        .select("id, content, user_id")
        .eq("id", str(note_id))
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Note not found")

    note = res.data
    content = note.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Note content is empty")

    # 2. Call Gemini
    settings = get_settings()
    client = genai.Client(api_key=settings.google_api_key)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=_PROMPT_TEMPLATE.format(content=content)
        )
        result = _extract_json(response.text)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini error: {exc}")

    summary = result.get("summary", "")
    action_items = result.get("action_items", [])
    suggested_title = result.get("suggested_title")

    # 3. Persist AI results back to the note
    updates: dict = {"ai_summary": summary, "action_items": action_items}
    if suggested_title:
        updates["title"] = suggested_title

    updated = (
        db.table("notes")
        .update(updates)
        .eq("id", str(note_id))
        .execute()
    )
    if not updated.data:
        raise HTTPException(status_code=500, detail="Failed to save AI results")

    return {
        "summary": summary,
        "action_items": action_items,
        "suggested_title": suggested_title,
        "note": updated.data[0],
    }
