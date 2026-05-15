# NoteAI – AI-Powered Notes Workspace

⚠️ **Evaluation Notice:** This repository is proprietary and provided strictly for technical evaluation purposes. Commercial use, reproduction, or internal deployment of this code is strictly prohibited.

An MVP full-stack application for creating, organising, and AI-summarising notes — built with FastAPI, React 18, Supabase, and Google Gemini.

---

## Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS |
| Backend    | Python 3.13, FastAPI, Uvicorn            |
| Database   | Supabase (PostgreSQL + Auth)             |
| AI         | Google Gemini 2.5 Flash                  |

---

## System Architecture
The application follows a decoupled client-server architecture:
* **Client Layer:** A React SPA handles state management and UI interactions. It uses the Supabase client for secure authentication (JWT) and calls the backend REST API for all data operations.
* **API & AI Layer:** The FastAPI server acts as a secure middleware layer. It validates user sessions, processes CRUD requests, and orchestrates prompts to the Google Gemini 2.5 API, ensuring AI logic and API keys are kept entirely server-side.
* **Data Layer:** Supabase provides the PostgreSQL database. Row Level Security (RLS) policies are implemented to guarantee that users can only read, update, or archive their own private data.

---

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Pydantic settings
│   ├── database.py          # Supabase client factory
│   ├── auth.py              # JWT verification dependency
│   ├── models.py            # Pydantic request/response models
│   ├── routers/
│   │   ├── notes.py         # CRUD: GET/POST/PATCH/ARCHIVE /notes
│   │   ├── ai.py            # POST /notes/{id}/generate-summary
│   │   ├── shared.py        # GET /shared/{id}  (no auth)
│   │   └── insights.py      # GET /insights
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── context/AuthContext.tsx
│   │   ├── lib/
│   │   │   ├── supabase.ts  # Supabase client singleton
│   │   │   └── api.ts       # Typed API client
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── NotesList.tsx
│   │   │   ├── NoteEditor.tsx
│   │   │   └── InsightsDashboard.tsx
│   │   ├── pages/
│   │   │   ├── AuthPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── SharedNotePage.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
└── database/
    └── schema.sql           # Run once in Supabase SQL Editor
```

---

## Prerequisites

- **Node.js** ≥ 18
- **Python** 3.13
- A **Supabase** project (free tier is fine)
- A **Google Gemini** API key (get one at [aistudio.google.com](https://aistudio.google.com))

---

---

## 🛠️ Installation & Setup

### 1. Database Setup (Supabase)
1. Open your Supabase project → **SQL Editor**.
2. Paste and run the contents of [`database/schema.sql`](database/schema.sql).
3. This creates the `notes` table and all security policies.

### 2. Backend Installation & Execution
```bash
cd backend

# 1. Install Dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. Configure Environment
cp .env.example .env
# Edit .env with your SUPABASE_URL, SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, and GOOGLE_API_KEY

# 3. Run Backend
# On Mac, use the venv path explicitly:
.venv/bin/python3 -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Installation & Execution
```bash
cd frontend

# 1. Install Dependencies
npm install

# 2. Configure Environment
cp .env.example .env
# Edit .env with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Run Frontend
npm run dev
```

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key (required for AI features) |
| `GOOGLE_API_KEY` | Gemini API key from AI Studio |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Same as backend |
| `VITE_SUPABASE_ANON_KEY` | Same as backend |
| `VITE_API_BASE_URL` | http://localhost:8000 |

---

## 🧪 Testing & Validation

To ensure the application is running correctly, perform the following tests:

1. **Authentication Test:** Go to `http://localhost:5173`, sign up with a new email, and verify you are redirected to the dashboard.
2. **CRUD Test:** Create a new note, edit its content, add a tag, and refresh the page. The note should persist.
3. **AI Test:** Open a note with some text, click **"Generate AI Summary"**. Verify a summary and action items appear.
4. **API Validation:** Visit `http://localhost:8000/docs` to access the interactive Swagger documentation and test endpoints manually.
5. **Archive Test:** Click the "Archive" (folder) icon on a note. It should disappear from the active list but remain in the database.

---

## 5. API Reference

| Method | Endpoint                           | Auth | Description                   |
|--------|------------------------------------|------|-------------------------------|
| GET    | `/notes/`                          | ✅   | List all user notes           |
| POST   | `/notes/`                          | ✅   | Create a note                 |
| PATCH  | `/notes/{id}`                      | ✅   | Update a note (partial)       |
| DELETE | `/notes/{id}`                      | ✅   | Hard delete a note            |
| PATCH  | `/notes/{id}/archive`              | ✅   | Archive a note                |
| POST   | `/notes/{id}/generate-summary`     | ✅   | Generate AI summary via Gemini|
| GET    | `/shared/{id}`                     | ❌   | Fetch a public note           |
| GET    | `/insights`                        | ✅   | Aggregate stats (inc. AI count)|
| GET    | `/health`                          | ❌   | Health check                  |

---

## Features

- 🔐 **Supabase Auth** – Email/password login and signup
- 📝 **Notes CRUD** – Create, read, update, archive notes
- 🤖 **AI Summary** – Generate summary + action items via Gemini 2.5
- 🌓 **Dark Mode** – Seamless Tailwind CSS theme toggling for a premium UX
- 📝 **Markdown Support** – Native markdown parsing with a dedicated Preview tab
- 🔍 **Client-side search** – Filter by title, content, or tag
- 🏷️ **Tags** – Add tags with Enter/comma, click to remove
- 🌐 **Public sharing** – Toggle a note public and share a link
- 📊 **Insights** – Stats: total notes, recently updated, top tags, and total AI usage
- 💾 **Auto-save** – 800ms debounce on all edits
- 📥 **Archive System** – Hide notes from your active list without deleting them
