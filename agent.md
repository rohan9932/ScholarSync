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
**Status:** Not Started

- [ ] `pgvector` extension confirmed active on the DB
- [ ] `schema.prisma` written and migrated (`prisma migrate dev`)
- [ ] `services/embeddings.js` stub committed (`getEmbedding(text)` signature)
- [ ] 🔍 Real `faculty.json` / `schedule.json` fields reconciled against schema
- [ ] Seed script populates `faculties` + `schedule_slots`
- [ ] **Handoff note:** _(describe any schema/field deviations from plan.md here)_

---

## Phase 2 — Backend API (Agent 2)
**Status:** Not Started

- [ ] `app.js` boots, all routers mounted, error handler in place
- [ ] Faculty routes working (`/api/faculty*`)
- [ ] Task CRUD routes working (`/api/tasks*`)
- [ ] Application routes working (`/api/applications*`)
- [ ] Booking routes working (`/api/bookings*`)
- [ ] `/api/ai` mount point reserved for Agent 3
- [ ] `evaluateApplication` placeholder stub committed in `ai/matching.js`
- [ ] **Handoff note:** _(describe any payload-shape deviations from plan.md here)_

---

## Phase 3 — AI Integration & RAG (Agent 3)
**Status:** Not Started

- [ ] `getEmbedding` implemented against real Gemini embedding model
- [ ] Cosine similarity raw SQL query verified against seeded data
- [ ] `evaluateApplication` fully implemented, matches Agent 2's stub signature
- [ ] Tool-calling chat agent working end-to-end (schedule query → free slot → task creation)
- [ ] Loop cap (3 iterations) verified
- [ ] Backoff/retry on 429 verified
- [ ] **Handoff note:** _(confirm exact model identifiers used, e.g. embedding model string, flash model string)_

---

## Phase 4 — Frontend (Agent 4)
**Status:** Not Started

- [ ] Faculty dashboard: applicant list + match scores rendering
- [ ] Mentorship board grouping working
- [ ] Schedule view rendering slots/tasks/bookings together
- [ ] Student application form working
- [ ] Student booking calendar working
- [ ] Persistent chatbot widget mounted at app root, tool-call indicator working
- [ ] Swapped from mock data to live API calls
- [ ] **Handoff note:** _(list any API mismatches found while wiring up real endpoints)_

---

## Integration Milestones

- [ ] Phase 1 merged — DB migrated + seeded, verified in Prisma Studio
- [ ] Phase 2 merged — all endpoints manually tested against seeded data
- [ ] Phase 3 merged — re-seeded with real embeddings, one test application scored end-to-end
- [ ] Phase 4 merged — pointed at live API, full demo journey walked through once
- [ ] Demo journey rehearsed 2–3 times: **student applies → AI scores → faculty accepts → mentorship board updates → chatbot blocks time on schedule**

## Known Blockers / Open Questions
- _(log anything blocking an agent here, with who it's waiting on)_
