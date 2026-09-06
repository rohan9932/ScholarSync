# ScholarSync — Execution Roadmap

**Event:** AUST CSE Carnival <8.0/> — AI Build Hackathon, Final Round (Onsite, 6 Sept 2026)
**Architecture pattern:** Monorepo, 2 packages (`/server`, `/client`), 4 parallel agent workstreams + 1 integration lead (you).

> ℹ️ **Confirmed data shape** (from the actual uploaded `faculty.json` / `schedule.json`, not assumptions):
> - **`faculty.json`** — 64 entries. Fields: `id` (string, e.g. `"fac-001"`, not auto-generated), `name`, `designation` (academic rank: Professor / Associate Professor / Assistant Professor / Lecturer Grade-I / Lecturer Grade-II / Lecturer — **there is no `department` field**), `email`, `research_interests` (**array** of strings, not one blob — 10 of the 64 entries have an *empty* array), `profile_url`.
> - **`schedule.json`** — only **30 of the 64 faculty** (join key is `faculty_name`, an exact string match to `faculty.json`'s `name` — verified 30/30 match). Each has a `schedule` array of exactly 5 day objects, `day ∈ {SUN, MON, TUE, WED, THU}` (**no Friday/Saturday** — matches the Bangladesh academic week). `busy_slots`/`free_slots` are arrays of strings like `"01:00 PM-01:50 PM"` (12-hour clock, hyphen with no surrounding spaces, 13 unique period boundaries total — a fixed timetable grid, not arbitrary times).
> - **The other 34 faculty have no schedule data at all** — their booking/tasking features will legitimately show "no schedule on file" in the demo unless you hand-seed a fallback.
>
> The schema and seed logic below are written against this confirmed shape.

---

## How to use this document

Each phase is self-contained enough to hand to a separate AI coding agent with **zero cross-talk** during development, as long as everyone honors the **Integration Contracts** in each phase header. Merge order at the end: **Phase 1 → Phase 2 → Phase 3 → Phase 4**, but all four can be *coded* simultaneously against the contracts.

---

## Phase 0: Project Scaffolding (Master Setup — run this yourself first)

### 0.1 Repository structure

```
scholarsync/
├── package.json                 # root, uses concurrently to run both apps
├── .gitignore
├── .env.example
├── README.md
├── plan.md
├── agent.md
├── server/
│   ├── package.json
│   ├── .env
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── index.js
│       ├── app.js
│       ├── config/
│       ├── routes/
│       ├── controllers/
│       ├── middleware/
│       ├── services/
│       │   └── embeddings.js    # 🔗 Agent 1 stubs, Agent 3 implements
│       └── ai/
│           ├── matching.js
│           ├── chatAgent.js
│           ├── tools.js
│           └── routes.js
└── client/
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── pages/
        ├── components/
        ├── context/
        └── services/api.js
```

### 0.2 Terminal commands

```bash
# --- Root ---
mkdir scholarsync && cd scholarsync
git init
npm init -y
npm install concurrently --save-dev

# --- Backend ---
mkdir server && cd server
npm init -y
npm install express cors dotenv @prisma/client pg zod
npm install -D prisma nodemon typescript ts-node @types/node
npx prisma init --datasource-provider postgresql

# Google Gen AI SDK
npm install @google/generative-ai

cd ..

# --- Frontend ---
npm create vite@latest client -- --template react
cd client
npm install
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
cd ..
```

### 0.3 Root `package.json` scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "db:migrate": "npm run db:migrate --prefix server",
    "db:seed": "npm run db:seed --prefix server"
  }
}
```

### 0.4 `.env.example` (root reference; actual `.env` lives in `/server`)

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/scholarsync?schema=public"
GEMINI_API_KEY="your-key-here"
PORT=5000
CLIENT_ORIGIN="http://localhost:5173"
```

### 0.5 Scaffolding checklist
- [ ] Root repo initialized, `.gitignore` covers `node_modules`, `.env`, `dist`
- [ ] `/server` and `/client` both `npm install` clean
- [ ] PostgreSQL running locally (or via Docker) and reachable at `DATABASE_URL`
- [ ] `pgvector` extension available on the Postgres instance (see Phase 1.1)
- [ ] Root `npm run dev` boots both apps concurrently
- [ ] Share this `plan.md` + `agent.md` with all four agents before they start

---

## Phase 1: Server & Database — Agent 1

**Owns:** `server/prisma/`, DB provisioning, seed data.
**Must deliver for others:** a running Postgres DB matching the schema below, migrated and seeded, plus a stub file `server/src/services/embeddings.js` exporting an unimplemented `getEmbedding(text)` function so Agent 2/3 can import against it immediately.

### 1.1 PostgreSQL + pgvector setup

```bash
# If using local Postgres:
sudo -u postgres psql -c "CREATE DATABASE scholarsync;"
sudo -u postgres psql -d scholarsync -c "CREATE EXTENSION IF NOT EXISTS vector;"

# If using Docker instead:
docker run --name scholarsync-pg -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d ankane/pgvector
```

- [ ] Confirm `CREATE EXTENSION vector;` succeeds (the `ankane/pgvector` image has it preinstalled; vanilla `postgres` images do not)
- [ ] Update `server/.env` with the real `DATABASE_URL`

### 1.2 `server/prisma/schema.prisma` — required contents

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}

model Faculty {
  id                String        @id            // use faculty.json's own "fac-001" style IDs directly — do NOT @default(cuid())
  name              String
  designation       String        // academic rank, e.g. "Professor" / "Assistant Professor" — faculty.json has no department field
  email             String        @unique
  profileUrl        String?
  researchInterests String[]      // raw array from faculty.json, kept for display/tagging
  embedding         Unsupported("vector(768)")?  // NULL when researchInterests is empty (10 of 64 faculty) — see Phase 3.2
  scheduleSlots     ScheduleSlot[]
  tasks             Task[]
  applications      Application[]
  bookings          Booking[]

  @@map("faculties")
}

model ScheduleSlot {
  id         String   @id @default(cuid())
  facultyId  String
  faculty    Faculty  @relation(fields: [facultyId], references: [id])
  day        DayOfWeek // only SUN–THU occur in the source data; treat FRI/SAT as always-free/no-class
  startTime  String   // "HH:mm" 24hr, converted from source's 12-hour "hh:mm AM/PM" strings
  endTime    String
  type       SlotType // BUSY or FREE
  source     String?  // e.g. "seed" | "task" | "booking", for provenance/debugging

  @@map("schedule_slots")
}

enum DayOfWeek {
  SUN
  MON
  TUE
  WED
  THU
  FRI
  SAT
}

enum SlotType {
  BUSY
  FREE
}

model Task {
  id          String     @id @default(cuid())
  facultyId   String
  faculty     Faculty    @relation(fields: [facultyId], references: [id])
  title       String
  description String?
  startTime   DateTime
  endTime     DateTime
  status      TaskStatus @default(PENDING)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("tasks")
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  DONE
  CANCELLED
}

model Application {
  id             String            @id @default(cuid())
  facultyId      String
  faculty        Faculty           @relation(fields: [facultyId], references: [id])
  studentName    String
  studentEmail   String
  studentContact String?           // for MESSENGER/WHATSAPP link, PRD §3.2
  pitchText      String
  embedding      Unsupported("vector(768)")?
  matchScore     Float?            // 0–100
  matchSummary   String?           // 1–2 sentence AI summary
  status         ApplicationStatus @default(PENDING)
  createdAt      DateTime          @default(now())

  @@map("applications")
}

enum ApplicationStatus {
  PENDING
  ACCEPTED
  REJECTED
}

model Booking {
  id            String        @id @default(cuid())
  facultyId     String
  faculty       Faculty       @relation(fields: [facultyId], references: [id])
  studentName   String
  studentEmail  String
  slotStart     DateTime
  slotEnd       DateTime
  isCustom      Boolean       @default(false) // true if no matching free_slot existed
  status        BookingStatus @default(PENDING)
  createdAt     DateTime      @default(now())

  @@map("bookings")
}

enum BookingStatus {
  PENDING
  APPROVED
  REJECTED
}
```

**Notes for Agent 1:**
- Prisma's query builder does **not** support vector similarity operators (`<=>`, `<->`). Any cosine-distance query must go through `prisma.$queryRaw`. This is Agent 3's concern, but don't be surprised when they bypass the generated client for those two queries.
- `Unsupported("vector(768)")` fields are **read-only** in the generated client — Agent 3 will write to them via raw SQL too.

### 1.3 Migration commands

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

- [ ] `npx prisma studio` opens and shows all 5 empty tables

### 1.4 Seed script — `server/prisma/seed.ts`

**Pipeline:**
1. Read and `JSON.parse` `faculty.json` → map each entry **directly** to a `Faculty` row using the source's own `id` (`"fac-001"`, etc. — don't let Prisma generate a new one), plus `name`, `designation`, `email`, `profileUrl: profile_url`, `researchInterests: research_interests` (store the array as-is).
2. Read and `JSON.parse` `schedule.json` → this file is keyed by `faculty_name`, **not** an ID. For each entry, look up the matching `Faculty` row by exact `name` match (confirmed 30/30 exact matches against `faculty.json`'s `name` field — no fuzzy matching needed). The **34 faculty not present in `schedule.json` simply get zero `ScheduleSlot` rows** — that's expected, not a bug.
3. For each of the 5 `day` objects (`SUN`–`THU`) per matched faculty, parse every string in `busy_slots` and `free_slots` (format: `"01:00 PM-01:50 PM"`, hyphen with no surrounding spaces) by splitting on `-`, then converting each `"hh:mm AM/PM"` half to 24-hour `"HH:mm"` (e.g. via `date-fns`' `parse`/`format`, or a small manual helper — don't hand-roll AM/PM math with off-by-one bugs around 12 PM/12 AM). Insert one `ScheduleSlot` row per slot string with `type: BUSY` or `type: FREE` accordingly. `FRI`/`SAT` never appear in the source — don't insert rows for them; treat them as fully free at the application layer (Phase 2's free-slot logic, §2.1) rather than seeding synthetic data for days with no source information.
4. 🔗 **Interface contract:** for each faculty row **where `researchInterests.length > 0`**, join the array (e.g. `researchInterests.join(", ")`) and call `getEmbedding(joinedText)` from `server/src/services/embeddings.js`, then `UPDATE` the row's `embedding` column via `prisma.$executeRawUnsafe`. For the 10 faculty with an empty array, **skip embedding generation entirely and leave `embedding` NULL** — Phase 3's matching logic must handle a NULL faculty embedding gracefully (see §3.2). Since Agent 3 may not have `getEmbedding` implemented yet, wrap the call in a try/catch that no-ops on failure, with `console.warn("Embeddings not yet available — run seed again after Phase 3 lands")`.
5. Do **not** seed `Application`, `Task`, or `Booking` — those are created at runtime through the API for the live demo.

```json
// server/package.json — add:
"prisma": { "seed": "ts-node prisma/seed.ts" },
"scripts": { "db:seed": "prisma db seed" }
```

### 1.5 Phase 1 checklist
- [ ] `pgvector` extension confirmed active
- [ ] `schema.prisma` migrated cleanly (`prisma migrate dev`)
- [ ] `services/embeddings.js` stub committed with the exact signature `async function getEmbedding(text: string): Promise<number[]>`
- [ ] Faculty IDs preserved from source (`"fac-001"` style), not regenerated
- [ ] Name-based join from `schedule.json` → `Faculty` verified (30 matched, 34 with no schedule rows — expected)
- [ ] AM/PM → 24-hour time parsing verified against a few known slots (e.g. `"08:00 AM-09:40 AM"` → `startTime: "08:00"`, `endTime: "09:40"`)
- [ ] `npm run db:seed` populates `faculties` and `schedule_slots` tables without error
- [ ] Handoff note written in `agent.md` if anything in the real files still doesn't match this plan

---

## Phase 2: Backend API — Agent 2

**Owns:** `server/src/app.js`, `routes/`, `controllers/`, `middleware/`.
**Depends on:** Phase 1's Prisma client and schema being generated (can start against the schema file alone, doesn't need real data).
**Must deliver for others:** a mounted, working REST API; a mount point (`app.use('/api/ai', aiRouter)`) reserved for Agent 3's router.

### 2.1 Routing map

| Method | Path | Purpose | Controller |
|---|---|---|---|
| GET | `/api/faculty` | List all faculty (id, name, designation) | `facultyController.list` |
| GET | `/api/faculty/:id` | Full faculty profile incl. researchInterests | `facultyController.getOne` |
| GET | `/api/faculty/:id/schedule` | All `ScheduleSlot` rows for a faculty, sorted by day/time | `facultyController.getSchedule` |
| GET | `/api/faculty/:id/free-slots?date=` | Computed free windows for a given date (derives from BUSY slots + existing tasks/bookings) | `facultyController.getFreeSlots` |
| GET | `/api/tasks?facultyId=` | List tasks for a faculty | `taskController.list` |
| POST | `/api/tasks` | Create a task | `taskController.create` |
| PATCH | `/api/tasks/:id` | Update a task (time, status, title) | `taskController.update` |
| DELETE | `/api/tasks/:id` | Delete a task | `taskController.remove` |
| GET | `/api/applications?facultyId=` | List applications, sorted by `matchScore` desc | `applicationController.list` |
| POST | `/api/applications` | Student submits a pitch (triggers Agent 3's embedding pipeline — see 2.3) | `applicationController.create` |
| PATCH | `/api/applications/:id` | Faculty accepts/rejects → sets `status`, and on ACCEPT also seeds a `Booking`-free mentorship record | `applicationController.decide` |
| GET | `/api/mentorships?facultyId=` | Accepted applications grouped by research topic | `applicationController.mentorshipBoard` |
| GET | `/api/bookings?facultyId=` | List bookings for a faculty | `bookingController.list` |
| POST | `/api/bookings` | Student requests a slot (matches a `free_slot` or flags `isCustom`) | `bookingController.create` |
| PATCH | `/api/bookings/:id` | Faculty approves/rejects | `bookingController.decide` |

### 2.2 Sample request/response payloads

**`POST /api/applications`**
```json
// Request
{
  "facultyId": "fac-002",
  "studentName": "Rafi Ahmed",
  "studentEmail": "rafi@aust.edu",
  "studentContact": "+8801xxxxxxxxx",
  "pitchText": "I'm interested in applying reinforcement learning to..."
}
// Response (202 Accepted — embedding/scoring happens async, see 2.3)
{
  "id": "clxapp456",
  "status": "PENDING",
  "matchScore": null,
  "message": "Application received. Scoring in progress."
}
```

**`GET /api/applications?facultyId=fac-002`**
```json
[
  {
    "id": "clxapp456",
    "studentName": "Rafi Ahmed",
    "matchScore": 87.4,
    "matchSummary": "Strong overlap with your RL and robotics control research.",
    "status": "PENDING"
  }
]
```

**`PATCH /api/tasks/:id`**
```json
// Request
{ "startTime": "2026-09-06T14:00:00Z", "endTime": "2026-09-06T16:00:00Z", "status": "IN_PROGRESS" }
// Response
{ "id": "clxtask789", "title": "Review exam papers", "status": "IN_PROGRESS", "updatedAt": "..." }
```

### 2.3 🔗 Integration contract with Agent 3

`applicationController.create` should **not** compute the match score inline — it should:
1. Insert the `Application` row with `status: PENDING`, `matchScore: null`.
2. Call an internal function `evaluateApplication(applicationId)` exported from `server/src/ai/matching.js` (Agent 3's file), fired-and-awaited or queued — Agent 2 just needs to call it; Agent 3 owns what happens inside.
3. Return the 202 response immediately (don't block the HTTP response on the Gemini round-trip if avoidable, to keep the demo snappy).

Agent 2 should write `matching.js` as an **empty exported function that resolves immediately** as a placeholder, so the route works end-to-end before Agent 3 finishes.

### 2.4 Middleware
- `cors({ origin: process.env.CLIENT_ORIGIN })`
- Centralized error handler (`middleware/errorHandler.js`) returning `{ error: message }` with proper status codes
- Request validation via `zod` schemas per route (reject malformed bodies with 400 before hitting controllers)

### 2.5 Phase 2 checklist
- [ ] `app.js` boots, mounts all routers, includes error handler as last middleware
- [ ] Every route in the table above returns correct status codes and shapes, tested via `curl`/Postman against seeded data
- [ ] `/api/ai` mount point reserved and documented (even if 404 until Agent 3 lands)
- [ ] `evaluateApplication` placeholder stub committed in `ai/matching.js`
- [ ] Free-slot computation logic documented in code comments (busy slots ∪ tasks ∪ approved bookings = unavailable; everything else within working hours = free)
- [ ] Free-slot logic only treats `SUN`–`THU` as class days (matching the source data's academic week) and either reports `FRI`/`SAT` as fully open or excludes them from booking entirely — pick one and document it, since neither is "wrong," but it must be consistent between the API and the frontend calendar
- [ ] For the 34 faculty with **no** `ScheduleSlot` rows at all, `/api/faculty/:id/free-slots` should return an explicit empty/informative response (not silently show "fully free all day," which would be misleading) — surface this as a distinct case the frontend can render as "schedule not available"

---

## Phase 3: AI Integration & RAG — Agent 3

**Owns:** `server/src/services/embeddings.js` (real implementation), `server/src/ai/matching.js`, `server/src/ai/chatAgent.js`, `server/src/ai/tools.js`, `server/src/ai/routes.js`.
**Depends on:** Phase 1's schema (for raw SQL column names) and Phase 2's controller stub signatures.

### 3.1 Embedding generation

```
services/embeddings.js
  export async function getEmbedding(text: string): Promise<number[]>
    → calls Gemini `text-embedding-004` (🔍 verify exact current model identifier
      in Google's docs before the demo — model name strings change)
    → returns a 768-length float array
    → wrap in try/catch with one retry on 429, per §3.4 below
```

- [ ] Used by Agent 1's seed script (faculty research interests)
- [ ] Used by `matching.js` (student pitch text)

### 3.2 Match scoring pipeline (fills in `evaluateApplication`)

1. Fetch the `Application` row and its parent `Faculty` (including `researchInterests` array and `embedding`).
2. **If `faculty.embedding` is NULL** (true for 10 of the 64 seeded faculty, whose `research_interests` array was empty) — skip the similarity math entirely, set `matchScore: null`, and set `matchSummary` to something like *"This faculty member hasn't listed research interests yet, so an automated match score isn't available."* Don't call Gemini for a summary in this case; there's nothing meaningful to compare against.
3. Otherwise: `getEmbedding(pitchText)` → get the student vector (same join-array-then-embed approach isn't needed here since `pitchText` is already a single string).
4. `UPDATE applications SET embedding = $1::vector WHERE id = $2` via `prisma.$executeRawUnsafe` (parameterized, not string-interpolated).
5. Cosine similarity query (pgvector's `<=>` operator returns *distance*, so similarity = `1 - distance`):

```sql
SELECT 1 - (a.embedding <=> f.embedding) AS similarity
FROM applications a
JOIN faculties f ON f.id = a."facultyId"
WHERE a.id = $1;
```

6. `matchScore = round(similarity * 100, 1)`.
7. One **single** Gemini `gemini-1.5-flash` call (verify the current flash-tier model identifier against Google's docs before the demo — these strings are updated periodically) that receives both `faculty.researchInterests.join(", ")` and `pitchText` and returns a 1–2 sentence fit summary — combine this with step 6's math result, don't ask the model to also estimate the score, to keep it a single deterministic + single generative call per application (satisfies PRD's "one API call per application" constraint at the LLM layer).
8. `UPDATE applications SET "matchScore" = $1, "matchSummary" = $2, ...`.

### 3.3 Conversational schedule/task agent

**File:** `ai/tools.js` — define the tool schema (Gemini function-calling format):

| Tool | Args | Effect |
|---|---|---|
| `get_schedule` | `facultyId, date` | Returns busy/free slots for that day. `date` maps to `SUN`–`THU`; if it resolves to `FRI`/`SAT`, return a "no class-day schedule for this date" result rather than an empty free list (consistent with Phase 2's §2.1 decision on those two days) |
| `find_free_slot` | `facultyId, date, durationMinutes` | Returns the first free window ≥ duration. If the faculty has no `ScheduleSlot` rows at all (34 of 64 do not), say so explicitly instead of returning an empty array the model might misread as "fully booked" |
| `create_task` | `facultyId, title, startTime, endTime` | `POST`-equivalent DB write |
| `update_task` | `taskId, fields` | `PATCH`-equivalent DB write |
| `delete_task` | `taskId` | `DELETE`-equivalent DB write |

**File:** `ai/chatAgent.js` — orchestration loop:
1. Receive user message + faculty context (facultyId, current date).
2. Send to Gemini with the tool definitions and a system prompt describing ScholarSync's scheduling domain.
3. If the model returns a `function_call`, execute the matching function from `tools.js` directly against Prisma, then send the tool result back to the model for a natural-language follow-up.
4. **Loop cap:** hard-limit to **3** tool-call round-trips per user message (`MAX_TOOL_ITERATIONS = 3`). If exceeded, return a graceful "I need more specifics — could you clarify?" instead of looping.
5. Return the final natural-language reply to the frontend chat widget.

**File:** `ai/routes.js` — exports an Express `Router` with `POST /api/ai/chat` and `POST /api/ai/embed-test` (a debug endpoint), mounted by Agent 2 at `/api/ai`.

### 3.4 Rate-limit resilience checklist
- [ ] Exponential backoff wrapper (e.g. 1s → 2s → 4s, max 2 retries) around every Gemini call
- [ ] Application scoring = exactly 1 embedding call + 1 flash call, never more, even on retry logic paths
- [ ] Chat agent's tool loop is hard-capped at 3 iterations
- [ ] All Gemini calls funneled through one shared client module so a global rate-limit counter/log can sit in one place for live-demo debugging

### 3.5 Phase 3 checklist
- [ ] `getEmbedding` implemented and confirmed against Agent 1's seed script (re-run `db:seed` once this lands)
- [ ] Cosine similarity raw query returns sane 0–1 values on real seeded data
- [ ] `evaluateApplication` replaces Agent 2's placeholder without changing its exported signature
- [ ] Tool-calling agent successfully performs a full "find a gap and block it out" flow against seeded schedule data
- [ ] Loop-cap and backoff verified by manually spamming the chat endpoint

---

## Phase 4: Frontend Development — Agent 4

**Owns:** everything under `client/src/`.
**Depends on:** Phase 2's route contracts (can be mocked with static JSON until the real API is live).

### 4.1 Component tree

```
App.jsx
├── pages/FacultyDashboardPage.jsx
│   ├── components/dashboard/ApplicantList.jsx
│   │   └── components/dashboard/MatchScoreCard.jsx
│   ├── components/dashboard/MentorshipBoard.jsx
│   │   └── components/dashboard/MentorshipGroupCard.jsx   (contact + WHATSAPP/MESSENGER link)
│   └── components/dashboard/ScheduleView.jsx
│       └── components/dashboard/TaskItem.jsx
├── pages/StudentApplyPage.jsx
│   └── components/student/ApplicationForm.jsx
├── pages/StudentBookingPage.jsx
│   └── components/student/BookingCalendar.jsx
└── components/chatbot/ChatWidget.jsx        (persistent, rendered at App root, not per-page)
    ├── components/chatbot/ChatBubble.jsx
    └── components/chatbot/ToolCallIndicator.jsx  (shows "checking your schedule…" while a tool call resolves)
```

### 4.2 Page requirements

**Faculty Dashboard (`FacultyDashboardPage`)**
- Applicant list sorted by `matchScore` desc, each card shows score %, 1–2 sentence summary, Accept/Reject buttons calling `PATCH /api/applications/:id`
- Mentorship board grouped by research topic: since a faculty can have multiple `researchInterests` tags, group accepted applicants under their faculty's first/primary tag (or list all tags as filter chips if time allows) — each group shows student contact + one-click chat link
- Schedule view: week grid rendering `ScheduleSlot` + `Task` + approved `Booking` together, color-coded by type

**Student views (`StudentApplyPage`, `StudentBookingPage`)**
- Application form: faculty picker, pitch textarea, submit → shows "Scoring in progress" state, then polls or shows a static confirmation (no need to expose the score to the student per PRD)
- Booking calendar: renders `GET /api/faculty/:id/free-slots`, lets student pick a slot or request a custom time (sets `isCustom: true`)

**Persistent Chatbot (`ChatWidget`)**
- Fixed-position widget available on every faculty-facing page
- Sends messages to `POST /api/ai/chat`, renders tool-call status indicators while waiting, then the final reply
- Must survive page navigation (mount at `App.jsx` level, not per-route)

### 4.3 `services/api.js` contract

Thin axios wrapper with one exported function per endpoint in Phase 2's table (e.g. `getFacultySchedule(id)`, `createApplication(payload)`, `postChatMessage(text)`), so components never call `axios` directly — this keeps the eventual real-API swap-in a one-file change if Agent 2's paths shift slightly.

### 4.4 Phase 4 checklist
- [ ] Tailwind configured, base design tokens picked (don't ship default untouched Tailwind look)
- [ ] All three pages render against **mocked** JSON before the real backend is ready
- [ ] Swap to real `api.js` calls once Phase 2 is live; confirm no payload-shape mismatches
- [ ] Chatbot widget visually distinguishes "thinking / calling a tool" from "final answer"
- [ ] Mobile/projector-friendly layout check (hackathon demos are often shown on a projector — verify contrast and font sizes at a distance)

---

## Cross-Agent Contract Summary

| Contract | Owner writes | Owner consumes | File |
|---|---|---|---|
| `getEmbedding(text)` | Agent 3 (impl), Agent 1 (stub) | Agent 1's seed script | `server/src/services/embeddings.js` |
| `evaluateApplication(id)` | Agent 3 (impl), Agent 2 (stub) | Agent 2's `applicationController.create` | `server/src/ai/matching.js` |
| AI Express router | Agent 3 | Agent 2 mounts at `/api/ai` | `server/src/ai/routes.js` |
| REST API paths/payloads | Agent 2 | Agent 4's `services/api.js` | This document, §2.1–2.2 |
| Prisma schema | Agent 1 | Agents 2 & 3 (via generated client + raw SQL) | `server/prisma/schema.prisma` |

**Rule of thumb for parallel work:** every agent codes against the *contract*, not against another agent's finished code. Stub first, implement second — nobody should be blocked waiting on someone else's PR.

---

## Suggested Integration Order (once all four land)

1. Merge Phase 1 → run migrate + seed, confirm tables populated.
2. Merge Phase 2 → hit every endpoint with Postman against seeded data (AI-dependent ones will return `null`/placeholder scores — that's expected).
3. Merge Phase 3 → re-run seed once (backfills faculty embeddings), submit one test application end-to-end, confirm a real `matchScore` appears.
4. Merge Phase 4 → point at the real API, walk through the full demo journey once live: **student applies → AI scores → faculty sees match → faculty accepts → mentorship board updates → faculty asks chatbot to block time → task appears on schedule.**
5. Rehearse the "one useful journey" demo path 2–3 times before judging — the problem statement explicitly rewards a convincing working flow over unfinished breadth.
