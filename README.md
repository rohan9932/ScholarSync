# ScholarSync

**Event:** AUST CSE Carnival <8.0/> — AI Build Hackathon, Final Round (Onsite, 6 Sept 2026)  
**Architecture:** Monorepo (`/server`, `/client`), 4 parallel agent workstreams + 1 integration lead.

ScholarSync is an intelligent faculty mentorship and scheduling platform bridging academic research matching with conflict-free scheduling and conversational AI assistant capabilities.

---

## 📁 Repository Structure

```
scholarsync/
├── package.json                 # Root orchestrator (runs server and client via concurrently)
├── .gitignore
├── .env.example
├── README.md
├── plan.md                      # Comprehensive specification and integration contracts
├── agent.md                     # Workstream progress and handoff tracker
├── server/                      # Node.js / Express backend with Prisma ORM & pgvector
│   ├── package.json
│   ├── .env
│   ├── prisma/
│   │   ├── schema.prisma        # Database models & vector extensions
│   │   └── seed.ts              # Seed script for faculty and schedule datasets
│   └── src/
│       ├── index.js             # Server entrypoint
│       ├── app.js               # Express application configuration & middleware
│       ├── config/              # Environment and database client configuration
│       ├── routes/              # Express API route modules
│       ├── controllers/         # Request handling logic
│       ├── middleware/          # Validation, error handling, CORS
│       ├── services/            # Core business & embedding services
│       └── ai/                  # Gemini 1.5 Flash agent, tools, and RAG matching
└── client/                      # React frontend powered by Vite and TailwindCSS
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── pages/               # Faculty Dashboard, Student Apply & Booking
        ├── components/          # Dashboard, Student, and persistent Chatbot
        ├── context/             # Global application state
        └── services/api.js      # Axios client contract for backend endpoints
```

---

## 🚀 Quick Start

### 1. Install Dependencies
Run in root:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env` and supply your database connection and Gemini API key:
```bash
cp .env.example server/.env
```

### 3. Database Setup (Phase 1)
```bash
npm run db:migrate
npm run db:seed
```

### 4. Run Development Servers
Start both backend (port 5000) and frontend (port 5173) concurrently:
```bash
npm run dev
```
