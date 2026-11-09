# 🌱 Mental Coach: Front End

A Next.js chat UI for your FastAPI mental coach. Ask it about stress, motivation, habits, or confidence, and it'll cheer you on. 💪

## 🚀 Run it locally

You need **two terminals**: one for the backend and one for the frontend.

**Terminal 1: the backend** (from the repo root)

```bash
uv sync
uv run uvicorn api.index:app --reload
```

Make sure `ANTHROPIC_API_KEY` is set, either exported in your shell or in a `.env` file at the repo root.

**Terminal 2: the frontend**

```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:3000** and say hi! 👋

## 🔌 How it talks to the backend

The page always calls a relative `/api/chat`. During `npm run dev`, `next.config.ts` forwards every `/api/*` request to `http://localhost:8000`, so you don't need to deal with CORS or hard-coded URLs.

Backend somewhere else? Point the frontend at it:

```bash
BACKEND_URL=http://127.0.0.1:9000 npm run dev
```

## 🧠 Good to know

- The backend is **stateless** and only sees your latest message. The chat history on screen lives in the browser, so refreshing the page starts fresh.
- **Enter** sends a message and **Shift+Enter** adds a new line.
- Light and dark mode follow your system setting.

## 🏗️ Production build

```bash
npm run build && npm start
```
