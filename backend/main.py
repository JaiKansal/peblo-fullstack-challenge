"""
FastAPI application entry point.
Run with:  uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import get_settings
from routers import ai, insights, notes, shared

settings = get_settings()

app = FastAPI(
    title="AI Notes Workspace API",
    version="1.0.0",
    description="Backend for the AI-powered notes workspace MVP.",
    root_path="/api"
)

# ---------------------------------------------------------------------------
# CORS – allow the Vite dev server and production frontend
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(notes.router)
app.include_router(ai.router)
app.include_router(shared.router)
app.include_router(insights.router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}
