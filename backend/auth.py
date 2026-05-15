"""
JWT authentication dependency.

Extracts the Bearer token from the Authorization header and validates it
against Supabase's `auth.getUser()` API so we don't need to duplicate
the JWT-verification logic ourselves.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client
from database import get_anon_client

_bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Client = Depends(get_anon_client),
) -> dict:
    """Return the authenticated Supabase user dict or raise 401."""
    token = credentials.credentials
    try:
        response = db.auth.get_user(token)
        if response is None or response.user is None:
            raise ValueError("no user returned")
        return {"id": str(response.user.id), "token": token}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
