# ScholarSync — Build Progress Tracker

Update this file as work lands. Status values: `Not Started` / `In Progress` / `Blocked` / `Done`.
Each agent edits only their own section + adds a one-line note in "Handoff Notes" when something deviates from `plan.md`.

---

## Phase 0 — Scaffolding (Master Setup)
**Status:** Done

- [x] Repo initialized, `.gitignore` in place
- [x] `/server` and `/client` installed cleanly
- [ ] Postgres reachable, `pgvector` extension available (Agent 1 to provision / configure in server/.env)
- [x] `npm run dev` boots both apps concurrently
- [x] All interface contracts & stubs committed (`embeddings.js`, `matching.js`, `ai/routes.js`, `api.js`)
- [x] `plan.md` + `agent.md` shared with all agents

---

## Phase 1 — Server & Database (Agent 1)
**Status:** Done

- [x] `pgvector` extension confirmed active on the DB (Neon PostgreSQL 16, pgvector 0.8.6)
- [x] `schema.prisma` written, synced to DB (`prisma db push`), and Prisma Client generated
- [x] `services/embeddings.js` stub committed (`getEmbedding(text)` signature)
- [x] 🔍 Real `faculty.json` / `schedule.json` fields reconciled against schema (all 64 faculty and 30 schedules verified)
- [x] Seed script populates `faculties` (64 records) + `schedule_slots` (1538 slots across 30 faculty, 34 without schedule as expected)
- [x] **Handoff note:** Database is fully provisioned on Neon with vector extension active. 12h-to-24h time parser verified. Connection URL configured in `server/.env`. Once Agent 3 implements `getEmbedding`, re-run `npm run db:seed` to backfill faculty research vector embeddings.

---

## Phase 2 — Backend API (Agent 2)
**Status:** Done

- [x] `app.js` boots, all routers mounted, centralized error handler in place
- [x] Faculty routes working (`/api/faculty*` — list, getOne, schedule, free-slots with weekend & unscheduled handling)
- [x] Task CRUD routes working (`/api/tasks*` — list, create, update, remove with ISO date validation)
- [x] Application routes working (`/api/applications*` — create returns 202, decide, mentorship board)
- [x] Booking routes working (`/api/bookings*` — list, create, decide)
- [x] `/api/ai` mount point reserved for Agent 3 (`server/src/ai/routes.js`)
- [x] `evaluateApplication` placeholder stub committed in `ai/matching.js` and verified async execution
- [x] **Handoff note:** All 12 endpoints verified via 20 automated integration tests (20/20 passed). Validation schemas use Zod and return 400 Bad Request on errors. Weekend handling explicitly sets `isWeekend: true` for Friday/Saturday. Faculty without schedule return `hasSchedule: false`. Free slots dynamically account for seeded slots, tasks, and approved bookings.

---

## Phase 3 — AI Integration & RAG (Agent 3)
**Status:** Done

- [x] `getEmbedding` implemented against real Gemini embedding model (`gemini-embedding-001` with `outputDimensionality: 768`)
- [x] Cosine similarity raw SQL query verified against seeded data via pgvector `<=>` distance operator
- [x] `evaluateApplication` fully implemented, matches Agent 2's stub signature and scores applications async
- [x] Tool-calling chat agent working end-to-end (schedule query → free slot → task creation)
- [x] Loop cap (3 iterations) verified with graceful clarification fallback
- [x] Backoff/retry on 429/503 implemented via `withRetry` helper in `config/gemini.js`
- [x] **Handoff note:** Models confirmed: `gemini-embedding-001` (configured for 768 dimensions to match `vector(768)`) and `gemini-3.5-flash` (for fit summaries, conversation, and function calling). All 54 faculty with research interests have been backfilled with vector embeddings in Neon DB. Endpoints `/api/ai/chat` and `/api/ai/embed-test` verified. Automated test suite in `server/test-phase3.js` passed 22/22 checks.

---

## Phase 4 — Frontend (Agent 4)
**Status:** Done

- [x] Faculty dashboard: applicant list + match scores rendering with MatchScoreCard badges
- [x] Mentorship board grouping working with WhatsApp links, group badges, and capstone status
- [x] Schedule view rendering slots/tasks/bookings together for Bangladesh 5-day academic week (Sun-Thu)
- [x] Student application form working with async AI pitch scoring trigger
- [x] Student booking calendar working with dynamic free slot detection
- [x] Persistent chatbot widget mounted at app root (exclusive to Teachers) with tool-call indicator and quick prompts
- [x] Swapped from mock data to live API calls via `client/src/api/client.js`
- [x] Rebuilt with exact design system from `design (1).md` (dark `#0A0F0C` base, `#101712` surface, `#16A34A` emerald accent, Inter typography, fixed left sidebar, sticky topbar)
- [x] Role-Based Authentication integrated (Faculty vs Student credentials)
- [x] **Handoff note:** Production Vite build successfully compiled with zero errors (`npm run build`). Dev servers running on port 5000 (Express) and port 5173 (Vite). Tested endpoints return HTTP 200.

---

## Integration Milestones

- [x] Phase 1 merged — DB migrated + seeded, verified with direct queries
- [x] Phase 2 merged — all endpoints tested with 20 automated integration tests against live seeded DB
- [x] Phase 3 merged — re-seeded with real embeddings (54 faculty vectors), test application scored end-to-end, function-calling chat agent verified
- [x] Phase 4 merged — pointed at live API, full UI rebuilt to design specifications and connected to backend
- [x] Demo journey rehearsed: **student applies → AI scores → faculty accepts → mentorship board updates → chatbot blocks time on schedule**

## Known Blockers / Open Questions
- _(log anything blocking an agent here, with who it's waiting on)_
