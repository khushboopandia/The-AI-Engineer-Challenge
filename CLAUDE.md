# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

AI Makerspace "AI Engineer Challenge": a FastAPI LLM chat backend (`api/index.py`) plus a Next.js chat frontend (`frontend/`), deployed together on Vercel.

## Commands

Run everything from the repo root. Python is pinned to 3.12 (`requires-python = ">=3.12,<3.13"`), and `uv` manages it.

```bash
uv sync                                   # install deps into .venv/
uv run uvicorn api.index:app --reload     # dev server on http://localhost:8000 (Swagger at /docs)
lsof -ti:8000 | xargs kill -9             # free port 8000 if it's "already in use"

curl -X POST http://127.0.0.1:8000/api/chat -H "Content-Type: application/json" -d '{"message": "Hello"}'

cd frontend && npm install && npm run dev # frontend on http://localhost:3000 (needs the backend running)
cd frontend && npm run build              # type-check + production build
```

The repo has no test suite, linter, or formatter configured.

## Architecture

- **Backend**: one file, `api/index.py`. It defines a FastAPI `app` with CORS open to `*` and these endpoints:
  - `GET /` returns `{"status": "ok"}`
  - `POST /api/chat` takes `{"message": str}` and returns `{"reply": str}`. It makes one stateless call to the LLM (no conversation history) with the system prompt "You are a supportive mental coach."
- **Frontend**: `frontend/` is a Next.js App Router app. The chat UI is a single client component, `app/page.tsx`, and it keeps the conversation history in React state because the backend doesn't store it. The page always calls a relative `/api/chat`. In `next dev`, `next.config.ts` rewrites `/api/*` to `BACKEND_URL` (default `http://localhost:8000`). In production builds it adds no rewrite, so `/api` stays on the same origin.
- **LLM provider**: the code now uses the **Anthropic** SDK (`claude-sonnet-5-5`) and reads `ANTHROPIC_API_KEY`. `python-dotenv` loads it from `.env`. The OpenAI client is commented out but kept for reference.
  - Some of the repo hasn't caught up with the switch. `api/README.md` and the root README still describe OpenAI/GPT-5 and `OPENAI_API_KEY`, and the missing-key error in `chat()` still says `OPENAI_API_KEY`. `api/README.md` also documents a `GET /api/health` endpoint that doesn't exist in the code.
- **Dependencies**: they're declared in two places. `pyproject.toml` and `uv.lock` are used for local `uv` development, and `requirements.txt` is what Vercel's Python runtime installs. When you add a runtime dependency, update both files.
- **Deployment**: `vercel.json` uses legacy `builds` to deploy two parts from one repo. `@vercel/next` builds `frontend/`, and `@vercel/python` builds `api/index.py`. Routes are checked in order: `/api/*` goes to the Python function, and the FastAPI routes keep their full `/api/...` path. Everything else goes to the Next.js app (`/frontend/$1`). Because of that ordering, any new backend endpoint must live under `/api/`. Set `ANTHROPIC_API_KEY` as a Vercel environment variable.

## Project rules (from `.cursor/rules/`)

These are the repo's Cursor rules, copied here so they apply in Claude Code too. If you change one, update both places.

### General (always applies — `general-rule.mdc`)

- Commit each code change as its own commit, but only after the user approves. Ask before every commit; never commit on your own. (This overrides the Cursor rule's "always commit".)
- You must always try and write code that is well documented. (self or commented is fine)
- You must only work on a single feature at a time.
- You must explain your decisions thoroughly to the user.

### Frontend (when designing a frontend or frontend components — `frontend-rule.mdc`)

- You must pay attention to visual clarity and contrast. Do not place white text on a white background.
- You must ensure the UX is pleasant. Boxes should grow to fit their contents, etc.
- When asking the user for sensitive information - you must use password style text-entry boxes in the UI.
- You should use Next.js as it works best with Vercel.
- This frontend will ultimately be deployed on Vercel, but it should be possible to test locally.
- Always provide users with a way to run the created UI once you have created it.

### READMEs (applies to `*.md` — `readme-rule.mdc`)

- When you create README.md's - they should be dope, and use fun and approachable language.
- While being fun, they should remain technically accurate.
