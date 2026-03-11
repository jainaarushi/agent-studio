# AgentStudio — CLAUDE.md

## Project Overview
- **Product:** AgentStudio (agentstudio.world) — "Canva for AI Agents"
- **Path:** `/Users/lorick/Downloads/missioncontroller`
- **Stack:** Next.js 14 (App Router), TypeScript, Supabase, Tailwind CSS v4, Framer Motion
- **AI SDKs:** Anthropic, Google (Gemini), OpenAI via Vercel AI SDK
- **Voice:** Wispr Flow API for speech-to-text
- **File parsing:** pdf-parse, mammoth, xlsx
- **GitHub:** `jainaarushi/agent-studio` (private repo, use `jainaarushi` account for push)
- **Deploy:** Vercel (auto-deploy from main)

## Critical Rules
- **NEVER publish, commit, or expose API keys, secrets, or credentials.** Always use env vars and .env files (gitignored).
- **NEVER mention specific agent counts** (like "56 agents") in UI copy — use generic phrasing ("every agent", "50+").
- **Same experience for demo and signed-in users.** The only difference: running a task requires sign-in (401) and an API key (402).
- **Always use `jainaarushi` GitHub account** for pushing. Switch with `gh auth switch --user jainaarushi`.

## Architecture

### Auth & Demo Mode
- `src/lib/auth.ts` — `getAuthUser()` returns demo user when not authenticated. Demo user ID: `u1000000-0000-0000-0000-000000000001`.
- **ALL API routes must handle `user.isDemo`** — use mock data functions from `src/lib/mock-data.ts`, never return 401 for demo users except on `/api/tasks/[id]/run` and `/api/user/api-key` POST/DELETE.
- `requireAuth()` is deprecated — use `getAuthUser()` + `user.isDemo` check instead.

### Mock Data (`src/lib/mock-data.ts`)
- `mockAgents` — generated from `PRESET_AGENTS` with `generateAgentId(i)`. IDs must cover ALL agents (was a bug: only 12 IDs for 56 agents).
- `mockTasks` — seeded with 3 demo tasks (review, review, working) so demo users see a realistic workspace.
- `createMockTask(title, section, priority)` — always pass section and priority, not just title.
- `agentIdCounter` starts at `PRESET_AGENTS.length + 1`.

### Agent Data
- Seed file: `src/seed/agents.ts` — 56 preset agents with slugs.
- Thumbnails: `src/app/(app)/today/page.tsx` `AGENT_THUMBNAILS` record — must map every seed slug to an image in `public/agents/`.
- Agent cleanup runs in `GET /api/agents` — deduplicates by slug and deletes stale presets. Check Supabase RLS if cleanup fails silently.
- Priority ordering on today page: `prioritySlugs` array in the agent scroller sorts specified agents first.

### Task Execution
- `POST /api/tasks/[id]/run` — requires auth (401 for demo) and API key (402 if no key). Returns status codes, NOT redirects.
- Pipeline definitions: `src/lib/ai/pipelines.ts` — keyed by old internal slugs (scout, quill, etc.), falls back to `DEFAULT_PIPELINE` for all agents not explicitly mapped.
- File content is passed via `task.description` → injected into LLM prompt as `Details: {description}`.

### File Upload
- `POST /api/upload` — parses PDF, DOCX, DOC, XLSX, XLS, TXT, CSV, JSON, MD, images. 10MB limit.
- Parser: `src/lib/upload/parse-file.ts`
- Available in both create task modal AND task detail modal.
- Description max is 50,000 chars to support file content.

### Voice Input (Wispr Flow)
- `POST /api/speech` — proxies to Wispr REST API (`platform-api.wisprflow.ai`).
- Requires Wispr API key saved in user settings (encrypted with AES-256).
- Browser records WebM → converts to 16kHz mono PCM WAV → base64 → sends to API.
- Available in both create task modal AND task detail modal.

### Supabase Client Caching
- `src/lib/supabase/server.ts` uses `WeakMap` keyed by cookie store to cache client per-request.
- This prevents "lock was stolen by another request" errors from multiple `createClient()` calls.

## Common Bugs & How to Avoid

### React Hooks Order
- **NEVER place `useState`/`useEffect` after a conditional `return null`.** All hooks must be at the top of the component, before any early returns.

### Agent IDs for Mock Data
- Must generate IDs for ALL preset agents, not just a hardcoded subset. Use `generateAgentId(i)` pattern.

### PreSelected Agent in Create Modal
- Use a dedicated `createAgentId` state, NOT `previewAgent`. Clear it when opening from search bar / Cmd+N, set it only from "Use this agent" button.
- The `previewAgent` state is for the preview modal only.

### Demo User API Routes Checklist
Every API route that reads/writes tasks or agents must handle `user.isDemo`:
- `GET/POST /api/tasks` — uses mockTasks
- `GET/PATCH/DELETE /api/tasks/[id]` — uses getMockTask/updateMockTask/deleteMockTask
- `POST /api/tasks/[id]/assign` — uses updateMockTask
- `POST /api/tasks/[id]/approve` — uses updateMockTask (set status=done)
- `POST /api/tasks/[id]/revise` — uses updateMockTask (reset to todo + append note)
- `POST /api/tasks/[id]/run` — returns 401 (sign in required)
- `GET/POST /api/agents` — GET returns mockAgents, POST uses createMockAgent
- `GET/PATCH/DELETE /api/agents/[id]` — uses getAgent/deleteMockAgent
- `GET /api/stats` — compute from mockTasks

### Auth Prompt UX
- Don't redirect immediately on 401/402. Show a beautiful overlay with countdown (10s) and progress bar.
- 401 = "Oh snap! You need to sign in" → redirects to /login
- 402 = "Almost there! Add your API key" → redirects to /settings

## File Structure (Key Files)
```
src/
  app/
    page.tsx                    — Landing page (agentstudio.world)
    (app)/
      layout.tsx                — App shell (sidebar + gradient bg)
      today/page.tsx            — Main workspace
      agents/page.tsx           — Agent gallery
      analytics/page.tsx        — Analytics dashboard
      settings/page.tsx         — API keys + Wispr
    api/
      agents/route.ts           — GET (with cleanup), POST
      agents/[id]/route.ts      — GET, PATCH, DELETE
      tasks/route.ts            — GET, POST
      tasks/[id]/route.ts       — GET, PATCH, DELETE
      tasks/[id]/run/route.ts   — POST (execute agent)
      tasks/[id]/assign/route.ts
      tasks/[id]/approve/route.ts
      tasks/[id]/revise/route.ts
      upload/route.ts           — File upload + parsing
      speech/route.ts           — Wispr voice STT
      user/api-key/route.ts     — Key management
      stats/route.ts            — Dashboard stats
  components/
    tasks/
      create-task-modal.tsx     — Create task (voice + file + agent picker)
      task-detail-modal.tsx     — Task detail (run, review, voice, file)
      task-card.tsx             — Task list card
      task-section.tsx          — Section (review/working/todo)
    layout/
      sidebar.tsx               — Left nav
    shared/
      usage-panel.tsx           — Cost/token panel
  lib/
    auth.ts                     — Auth + demo user
    mock-data.ts                — In-memory demo data
    palette.ts                  — Design tokens
    upload/parse-file.ts        — File parser
    ai/
      pipelines.ts              — Agent step definitions
      client.ts                 — AI SDK setup
      encrypt.ts                — Key encryption
      get-user-key.ts           — Retrieve user's AI config
  seed/agents.ts                — 56 preset agent definitions
```

## User Preferences
- No emojis in code unless user requests
- Push changes after every significant edit
- Use `jainaarushi` GitHub account
- Don't mention specific agent counts in UI
- Favicon/logo: `public/logo.png` and `src/app/icon.png`
