"""
Insights router – GET /insights
Returns aggregate statistics for the authenticated user's notes.
"""
from collections import Counter
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from supabase import Client

from auth import get_current_user
from database import get_admin_client
from models import InsightsOut

router = APIRouter(prefix="", tags=["insights"])


@router.get("/insights", response_model=InsightsOut)
async def get_insights(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_admin_client),
):
    """Return aggregate stats for the current user's notes."""
    res = (
        db.table("notes")
        .select("updated_at, tags, ai_summary")
        .eq("user_id", current_user["id"])
        .execute()
    )
    notes = res.data or []

    total = len(notes)
    ai_count = sum(1 for n in notes if n.get("ai_summary"))

    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    recent = sum(
        1
        for n in notes
        if datetime.fromisoformat(n["updated_at"].replace("Z", "+00:00")) >= cutoff
    )

    tag_counter: Counter = Counter()
    for n in notes:
        for tag in (n.get("tags") or []):
            tag_counter[tag] += 1

    top_tags = dict(tag_counter.most_common(5))

    return InsightsOut(
        total_notes=total,
        recently_updated=recent,
        top_tags=top_tags,
        ai_usage_count=ai_count,
    )
