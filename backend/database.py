"""
Supabase client factory.
We keep two clients:
  - `anon_client`  – uses the anon key; respects Row Level Security
  - `admin_client` – uses the service-role key; bypasses RLS (used for AI writes)
"""
from functools import lru_cache
from supabase import create_client, Client
from config import get_settings


@lru_cache()
def get_anon_client() -> Client:
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_anon_key)


@lru_cache()
def get_admin_client() -> Client:
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_service_role_key)
