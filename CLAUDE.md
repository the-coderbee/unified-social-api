# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

```
unified-social-api/
├── backend/          # Python/FastAPI — uv project root
├── frontend/         # React/Vite — npm project root
└── docker/           # docker-compose.yml (postgres + redis)
```

## Commands

**Backend** — all commands run from `backend/`

```bash
# Start infrastructure (PostgreSQL on 5433, Redis on 6379)
docker compose -f docker/docker-compose.yml up -d   # run from repo root

# Run dev server
cd backend && uv run fastapi dev src/main.py

# Database migrations (must be run from backend/)
cd backend && uv run python -m alembic revision --autogenerate -m "description"
cd backend && uv run python -m alembic upgrade head
cd backend && uv run python -m alembic downgrade -1
```

**Frontend** — all commands run from `frontend/`

```bash
cd frontend && npm run dev        # starts on :5173
cd frontend && npm run typecheck  # tsc --noEmit
cd frontend && npm run build
```

Environment variables live in `backend/.env`. Required keys: `SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, and Discord OAuth credentials (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`).

> **Discord OAuth:** set `DISCORD_REDIRECT_URI=http://localhost:5173/dashboard/accounts/callback/discord` so the OAuth callback lands in the frontend.

## Architecture

**FastAPI async API** with PostgreSQL (asyncpg + SQLAlchemy 2.0) and Redis. All routes are prefixed `/api/v1`.

### Module layout

Each domain follows the same four-file pattern:
- `models.py` — SQLAlchemy ORM model
- `schemas.py` — Pydantic request/response schemas
- `router.py` — FastAPI route handlers (owns `db.commit()`)
- `repository.py` — async DB queries; uses `db.flush()` but never commits

`backend/src/core/base.py` imports all models so Alembic's autogenerate can detect the full schema. **Any new model must be imported there.**

`backend/src/api/v1.py` aggregates all routers. Add new routers there.

### Transaction pattern

Repositories call `db.flush()` (to get generated IDs without committing); routers call `db.commit()`. Rollbacks on failure happen in the router. Do not commit inside repositories.

### Social platform pattern

`backend/src/social_accounts/platforms/base.py` defines the `SocialPlatform` ABC with three required methods: `get_login_url`, `exchange_code_for_token`, `publish_post`. Adding a new platform means:
1. Implement the ABC in a new file under `backend/src/social_accounts/platforms/`
2. Register it in the `PLATFORMS` dict in `backend/src/social_accounts/router.py`

Current platforms: Discord (OAuth2 `identify` scope only; `publish_post` raises `NotImplementedError`).

### Auth

JWT Bearer tokens via `PyJWT` + Argon2 password hashing. `get_current_user` dependency in `backend/src/api/dependencies.py` decodes the token and returns the `User` ORM object. Token subject (`sub`) is the user UUID.

### Key infrastructure wiring

- `backend/src/main.py` lifespan: verifies DB and Redis connections on startup, disposes them on shutdown.
- `backend/src/core/database.py`: async engine + `get_db()` session dependency.
- `backend/src/core/redis.py`: shared `redis_client` instance (async, `decode_responses=True`).
- CORS currently allows `http://localhost:5173` (hardcoded in `main.py`; `CORS_ORIGINS` env var exists in config but is not wired to the middleware yet).

## Frontend Architecture & UI Guidelines

**Tech Stack:** React, Tailwind CSS, Framer Motion.

### 1. Skill Invocations (Mandatory)
Whenever generating, refactoring, or reviewing frontend UI code, you MUST silently invoke and adhere to the following skills:
- `.claude/skills/emil-kowalski/SKILL.md` (For motion, spring physics, and tactility)
- `.claude/skills/impeccable-design/SKILL.md` (For Tailwind typography, spacing, and styling)
- `.claude/skills/product-taste/SKILL.md` (For copy, empty states, and UI reduction)

### 2. Component & Directory Architecture
- **Feature-based routing:** Group files by feature domain (e.g., `src/features/auth/components`, `src/features/auth/api`) rather than flat global directories.
- **Smart vs. Dumb Components:** Keep UI components "dumb" (pure functions relying on props). Keep state and API logic in "smart" container components or custom hooks.

### 3. Data Fetching & State
- **Never use `useEffect` for data fetching.** 
- Exclusively use **TanStack Query (React Query)** for asynchronous state, caching, and server synchronization. 
- Use standard React Context or Zustand for global UI state only (e.g., theme, sidebar toggle). Do not put API data in global client state.

### 4. Forms & Validation
- Mirror the strictness of the FastAPI backend. All forms must be built using **React Hook Form** paired with **Zod** resolvers.
- Always disable submit buttons during `isSubmitting` states and provide loading indicators.

### 5. Resilience & Error Handling
- Never allow a component crash to unmount the entire React tree. Wrap major route views and complex widgets in **React Error Boundaries** with styled fallback UIs.
- Handle API errors gracefully: parse the FastAPI 400/500 `detail` responses and display actionable toast notifications to the user.

### 2. Component & Directory Architecture
Never dump domain-specific files into global folders. Strictly adhere to this simplified Feature-Sliced Architecture. 

**Directory Tree Standard:**
```text
src/
├── components/       # GLOBAL shared UI primitives only (Button, Input, Modal)
├── lib/              # GLOBAL utilities, axios clients, clsx/tailwind mergers
├── hooks/            # GLOBAL custom hooks (useWindowSize, useTheme)
├── features/         # DOMAIN-SPECIFIC code (The core of the app)
│   ├── auth/
│   │   ├── api/      # React Query hooks & fetchers for auth
│   │   ├── components/ # Components strictly used only in auth (LoginForm)
│   │   ├── hooks/    # Auth-specific react hooks
│   │   ├── schemas/  # Zod validation schemas for auth
│   │   └── types/    # TypeScript interfaces for auth
│   └── assessments/  # (Another feature domain...)
└── pages/            # OR app/ (Next.js) - Route entry points that stitch features together