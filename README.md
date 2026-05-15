---
title: PropAI
emoji: 🏠
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
license: mit
short_description: Property Manager AI Agent — portfolio dashboard with Gemini insights
---

# PropAI — Property Manager AI Agent

A full-stack property portfolio dashboard with AI-powered insights. Track properties, tenants, loans, maintenance, escrow, and appliances across your real-estate portfolio; ask Gemini for recommendations grounded in the live data.

## Features

- **Portfolio dashboard** — 10 seeded properties across 10 cities, with consolidated finance summary, alerts, and historical revenue/expense charts.
- **Tenant + lease tracking** — payment status, lease end dates, renewal pipeline, automated overdue + lease-end alerts.
- **Loans & escrow** — outstanding balances, EMI schedules, property tax / insurance / HOA tracking.
- **Maintenance workflow** — create requests, assign to contractors, track status from `pending` → `scheduled` → `complete`.
- **AI insights via Gemini** — natural-language Q&A grounded in your portfolio data.
- **Single-process deployment** — Express serves both the API and the prebuilt React bundle on one port.

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│  React + Vite SPA   │────▶│   Express API        │
│  (TypeScript, R19,  │     │   (server.ts, :7860) │
│  Tailwind v4,       │     │                      │
│  Recharts, Motion)  │     │   ├── /api/dashboard │
└──────────┬──────────┘     │   ├── /api/properties│
           │                │   ├── /api/maintenance│
           │ Gemini SDK     │   └── /api/finance   │
           ▼                └──────────┬───────────┘
    ai.google.dev                      │
                                       ▼
                            ┌─────────────────────┐
                            │  SQLite (file DB)   │
                            │  better-sqlite3     │
                            │  10 tables, seeded  │
                            └─────────────────────┘
```

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 6, TypeScript 5.8, Tailwind CSS 4, Lucide, Recharts, Motion |
| Backend | Express 4, tsx (TS runner), better-sqlite3 |
| AI | `@google/genai` (Gemini) |
| Storage | SQLite — file-based, schema auto-created and seeded on first launch |

## Run locally

```bash
npm install
cp .env.example .env.local       # then add your Gemini key
npm run dev                       # http://localhost:3000
```

Get a free Gemini API key at <https://ai.google.dev/> → "Get API key".

## Deploy

### Hugging Face Spaces (recommended — free, no cold starts)

1. Create a new Space at <https://huggingface.co/new-space> with `SDK = Docker`.
2. Push this repo to the Space (or link the GitHub repo via the Spaces UI).
3. In **Settings → Variables and secrets**, add `GEMINI_API_KEY`.
4. The Space builds from the included `Dockerfile`, exposes port `7860`, and serves both the API and the React bundle from `/`.

### Other hosts (Render, Railway, Fly)

The Dockerfile is portable. Set `PORT` (most hosts inject it automatically), `GEMINI_API_KEY`, and `NODE_ENV=production`. SQLite data is ephemeral on most free tiers — the seed data re-creates itself on each cold start, which is fine for demos but not for production state.

## Environment variables

See [.env.example](.env.example).

| Var | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` | Yes | AI features no-op without it (warning logged, app still serves) |
| `PORT` | No | Default 3000 locally, 7860 on HF Spaces |
| `NODE_ENV` | No | `production` skips Vite middleware and serves `./dist` |
| `APP_URL` | No | Self-referential URL (e.g. for share links) |

## Notes & caveats

- **SQLite is ephemeral on serverless / free containers.** Data resets on each redeploy. For persistent storage swap to Turso (libsql), Vercel Postgres, or a hosted Postgres.
- **Gemini key in client bundle.** `vite.config.ts` injects `process.env.GEMINI_API_KEY` at build time, which embeds it in the shipped JS. For a public demo, use a usage-limited key. To fully secure, route Gemini calls through a server-side `/api/ai` endpoint instead.

## License

MIT
