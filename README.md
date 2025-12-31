# Codem Frontend

## Project Overview

Codem Frontend is the Next.js web UI for Codem: a deterministic, agentic system that turns a short chat into verified programming activities (problems + tests) and lets learners run/submit code against the backend judge.

- Repo: `Codem-frontend` (this repository)
- Backend: `https://github.com/gael55x/Codem-backend`

## High-Level Architecture

The frontend is a thin client over a backend-driven workflow:

- **Next.js App Router UI** renders the chat, activity viewer/editor, and account pages.
- **HTTP + SSE integration** calls backend APIs for sessions, generation, activities, and judging.
- **No hidden logic**: all agent “decisions” (validation, state transitions, retries, confirmation gating) live in the backend; the frontend is responsible for UX and for faithfully rendering server state and progress.

## Core Responsibilities

- Sessions UX: create session, send user messages, render `nextQuestion` / `questionKey`, and display the evolving `spec`.
- Generation UX: open `GET /sessions/:id/generate/stream` and render structured progress events.
- Activity UX: fetch activities, render problems, run code (`POST /run`) and submit graded solutions (`POST /submit`).
- Account UX: auth, profile, and per-user LLM key settings (encrypted at rest by the backend when enabled).
- Community UX: list and view community-published activities.

## Getting Oriented

**Repo layout**

- `src/app` – Next.js routes (chat, activity solving, auth, profile, community)
- `src/components` – UI components used across routes
- `src/lib` – client-side helpers and normalization
- `src/types` – frontend-facing types for API payloads/events

**Local development**

Prereqs: Node.js 18+, npm. For end-to-end flows you also need the backend running (and Docker for the backend judge).

```bash
npm install
npm run dev
```

Configure backend URL via `.env`:

- `NEXT_PUBLIC_BACKEND_URL` (defaults to `http://localhost:4000` in code)

## Documentation Index

- Start here: `docs/index.md`
- Frontend ↔ backend integration: `docs/api/backend.md`
- Frontend architecture & state: `docs/architecture.md`, `docs/state-and-models.md`
- Debugging SSE progress/trace: `docs/debugging.md`

## Contributing

See `docs/contributing.md` for development workflow, conventions, and how to keep frontend behavior aligned with backend contracts.
