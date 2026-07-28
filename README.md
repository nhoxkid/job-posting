<div align="center">

# 🟢 RoleVault

### The early-careers job board where the *match* comes first.

[![Status](https://img.shields.io/badge/status-active%20development-2EA043)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-build-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Node >=20](https://img.shields.io/badge/Node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/tests-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Lint](https://img.shields.io/badge/lint-ESLint%20%2B%20Prettier-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)

```bash
npm install && npm run dev      # → http://localhost:5173
```

</div>

A full-stack platform for internships, co-ops, and new-grad roles — built so the two
things candidates care about most, **how well a role fits** and **whether it sponsors a
visa**, are surfaced before anything else.

**RoleVault** is a design-led product under active development. This milestone delivers
the full React experience on top of a deliberately layered, end-to-end–typed Express API
— running locally with no setup, and ready for PostgreSQL behind a single environment
switch.

> [!NOTE]
> **This README is the single source of truth.** Architecture, the data model, the
> complete API, every environment variable, and every way to run the stack — it's all
> here, and it's all verified against the code.

---

## Highlights

| | |
| :-- | :-- |
| 🚀 **One-command local dev** | `npm run dev` boots the client and API together against a seeded in-memory data layer — no external services to provision before you start building. |
| 🧱 **Layered, typed backend** | Routes → controllers → services → repositories, behind a single `JobRepository` interface. The in-memory and PostgreSQL implementations swap via one env value. |
| 🎯 **Product-first framing** | Resume-match scoring and visa sponsorship are first-class concepts, surfaced up front in the UI. |
| 🐘 **Production path ready** | A PostgreSQL implementation ships behind `DB_DRIVER`; `docker compose up` brings up a persistent, production-shaped stack. |
| 🧪 **Typed & tested end-to-end** | Strict TypeScript on both sides, Vitest + Testing Library on the client, supertest on the server, ESLint + Prettier across the monorepo. |

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [What this is](#2-what-this-is)
3. [Tech stack](#3-tech-stack)
4. [Repository layout](#4-repository-layout)
5. [Architecture](#5-architecture)
6. [The data model](#6-the-data-model)
7. [Backend in detail](#7-backend-in-detail)
8. [Frontend in detail](#8-frontend-in-detail)
9. [API reference](#9-api-reference)
10. [Configuration & environment files](#10-configuration--environment-files)
11. [How to run](#11-how-to-run)
12. [Scripts reference](#12-scripts-reference)
13. [Testing, linting, formatting](#13-testing-linting-formatting)
14. [Known limitations & design decisions](#14-known-limitations--design-decisions)
15. [Troubleshooting](#15-troubleshooting)
16. [Contributions (Milestone 2)](#16-contributions-milestone-2)

---

## 1. Quick start

Requires **Node.js >= 20** and npm. From the repository root:

```bash
npm install        # installs both workspaces (client + server)
npm run dev        # starts client + server together
```

| Piece | URL |
| :-- | :-- |
| Client (UI) | <http://localhost:5173> |
| API | <http://localhost:4000> |

That's it — the API serves a seeded **in-memory** dataset, so no database is required.
Open <http://localhost:5173> and you'll see live data.

> [!TIP]
> Want persistence / PostgreSQL? See
> [How to run → Docker](#c-docker-full-stack-with-postgresql).

---

## 2. What this is

RoleVault is a job board focused on internships, co-ops, and new-grad roles. The product
concept centres on ranking roles by how well they match a candidate's resume, and
surfacing **visa sponsorship** up front.

It is a **monorepo** with two deployable pieces, wired together with **npm workspaces**
so you install and run both from the root:

- **`client/`** — a React single-page app (the browser UI).
- **`server/`** — an Express REST API (the backend).

By default the API runs against a seeded in-memory data layer, so the app is fully
functional locally with no external services to set up. A production-grade **PostgreSQL**
path is wired in behind the `DB_DRIVER` switch for persistence and deployment.

---

## 3. Tech stack

### Frontend (`client/`)

| Concern | Choice |
| :-- | :-- |
| Language | TypeScript |
| UI library | React 19 |
| Build tool / dev server | Vite |
| Styling | Tailwind CSS v4 (CSS-variable design tokens) + inline styles for the design screens |
| Routing | React Router v7 (`react-router-dom`) |
| Server state / fetching | TanStack Query (React Query) v5 |
| Forms | React Hook Form |
| Fonts | Schibsted Grotesk, Plus Jakarta Sans, Instrument Serif (Google Fonts) |
| Tests | Vitest + Testing Library (jsdom) |

> [!NOTE]
> Node.js runs the **build tooling** (Vite, npm). The output shipped to the browser is
> static HTML/CSS/JS — no Node runs in the browser.

### Backend (`server/`)

| Concern | Choice |
| :-- | :-- |
| Language | TypeScript |
| Runtime | Node.js (>= 20) |
| Web framework | Express 4 |
| Database driver | `pg` (PostgreSQL) — used only in `postgres` mode |
| Security / middleware | helmet, cors, morgan |
| Dev runner | `tsx` (TypeScript execution + watch) |
| Tests | Vitest + supertest |

### Tooling (root)

| Concern | Choice |
| :-- | :-- |
| Monorepo | npm **workspaces** |
| Parallel dev | **concurrently** (client + server together) |
| Lint / format | **ESLint** (typescript-eslint) + **Prettier** (with Tailwind class sorting) |
| Containers | **Docker** + docker-compose |

---

## 4. Repository layout

```text
job-posting/
├── client/                          # Frontend (React + Vite)
│   ├── Dockerfile                   # Build static site, serve via nginx
│   ├── nginx.conf                   # SPA fallback routing
│   ├── index.html                   # HTML entry; loads Google Fonts
│   ├── vite.config.ts
│   └── src/
│       ├── api/
│       │   ├── client.ts            # fetch wrapper (base URL, JSON, errors)
│       │   └── jobs.ts              # jobs resource (list/get/create/update/remove)
│       ├── components/
│       │   ├── brand/Logo.tsx       # RoleVault logo mark + wordmark
│       │   ├── layout/
│       │   │   ├── Layout.tsx       # Shell: RvNav + routed <Outlet/>
│       │   │   ├── RvNav.tsx        # Sticky in-app top navigation
│       │   │   └── RvFooter.tsx     # Dark gradient footer (landing)
│       │   ├── ui/                  # Design-system primitives (Button, Card, …)
│       │   └── ErrorBoundary.tsx
│       ├── features/
│       │   └── jobs/
│       │       ├── components/      # JobCard, JobList, JobForm
│       │       ├── hooks/           # useJobs, useJob, useCreateJob
│       │       └── index.ts         # Public surface of the feature
│       ├── lib/
│       │   ├── cn.ts                # className merge helper
│       │   ├── env.ts               # typed import.meta.env access
│       │   ├── format.ts            # salary / relative-time / type labels
│       │   └── jobDisplay.ts        # avatar initials, sponsorship, logo colours
│       ├── pages/                   # One component per route (see §8)
│       ├── providers/
│       │   ├── QueryProvider.tsx    # React Query client
│       │   ├── ThemeProvider.tsx    # light/dark (defaults to light)
│       │   └── theme-context.ts
│       ├── styles/index.css         # Tailwind entry + design tokens + animations
│       ├── test/setup.ts
│       └── types/job.ts             # Frontend domain types
│
├── server/                          # Backend (Express REST API)
│   ├── Dockerfile
│   └── src/
│       ├── config/env.ts            # typed env loader (incl. DB_DRIVER)
│       ├── db/
│       │   ├── index.ts             # pg connection pool + query() helper
│       │   └── schema.sql           # jobs table DDL (postgres mode)
│       ├── controllers/job.controller.ts   # HTTP boundary
│       ├── services/job.service.ts         # business logic + validation
│       ├── repositories/
│       │   ├── job.repository.ts    # JobRepository: InMemory + SQL impls
│       │   ├── job.seed-data.ts     # sample dataset (~12 roles)
│       │   └── seed.ts              # schema apply + seed (postgres mode)
│       ├── models/job.ts            # backend domain types + enums
│       ├── middleware/              # errorHandler, notFound, validate (passthrough)
│       ├── routes/                  # health + jobs routers
│       ├── utils/                   # ApiError, asyncHandler
│       ├── app.ts                   # Express app factory (no port binding)
│       └── server.ts                # Entrypoint (binds port, optional DB init)
│
├── docker-compose.yml               # PROD stack: postgres + server + client (built images)
├── docker-compose.dev.yml           # DEV stack: same services, bind-mounts + live reload
├── package.json                     # workspace root + orchestration scripts
└── README.md                        # this file
```

---

## 5. Architecture

### Request flow (browser → database)

```text
Browser (React page)
  → React Query hook (useJobs / useJob / useCreateJob)
    → jobsApi (client/src/api/jobs.ts)
      → apiClient fetch wrapper  ── HTTP ──▶  Express
                                              → route (routes/job.routes.ts)
                                                → controller (parse req)
                                                  → service (validate, paginate)
                                                    → repository (InMemory | SQL)
                                                      → data
```

The backend is a clean layered architecture:

- **Routes** map URLs to controller handlers.
- **Controllers** are the HTTP boundary — parse/coerce the request, call the service,
  shape the response. No business logic.
- **Services** hold business rules: validation, defaults, building the paginated
  envelope, throwing `ApiError` (404/400) where appropriate.
- **Repositories** are the data-access boundary behind a single interface
  (`JobRepository`). Two implementations exist (in-memory and SQL); nothing above this
  layer knows which is active — which is why swapping the data source is a one-line,
  env-driven change.

### Frontend architecture

- **Pages** (`pages/`) are route-level components, one per screen.
- **Feature modules** (`features/jobs/`) encapsulate jobs-related data hooks and
  presentational components. Pages compose these.
- **UI primitives** (`components/ui/`) are the low-level design system, styled via
  Tailwind design tokens.
- **Data fetching** goes through React Query hooks → typed `jobsApi` → `apiClient`.
  Components never call `fetch` directly.

---

## 6. The data model

A **Job** is the single domain entity (identical shape on client and server):

```ts
interface Job {
  id: string;
  title: string;
  company: string;
  location: string; // e.g. "San Francisco, US"
  remote: boolean;
  employmentType:
    | 'full-time'
    | 'part-time'
    | 'contract'
    | 'internship'
    | 'temporary';
  description: string;
  tags: string[]; // skills + the sponsorship convention (below)
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string; // ISO code, e.g. "USD", "GBP", "CAD"
  status: 'open' | 'closed' | 'draft';
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
```

> [!IMPORTANT]
> **Sponsorship convention:** there is no dedicated column. A job sponsors visas when one
> of its `tags` matches `/sponsor/i` (e.g. `"Visa sponsorship"`). The UI derives the
> sponsorship badge from this via `lib/jobDisplay.ts → sponsorsVisa()`.

---

## 7. Backend in detail

### Data sources (the `DB_DRIVER` switch)

The active repository is chosen at startup by `DB_DRIVER`:

| Value | Implementation | Behaviour |
| :-- | :-- | :-- |
| `memory` *(default)* | `InMemoryJobRepository` | Seeded from `repositories/job.seed-data.ts` (~12 roles). No database needed; data resets on restart. Filtering, search, newest-first sorting, and pagination all happen in memory. |
| `postgres` | `SqlJobRepository` | Backed by the `pg` pool. On startup the server applies `db/schema.sql` (idempotent) and seeds the table if empty (`repositories/seed.ts`). |

`server.ts` only calls `connectToDatabase()` when `DB_DRIVER=postgres`, so the default
path never touches `pg`.

### Validation & errors

- The service validates create payloads (required fields, valid enums) and throws
  `ApiError.badRequest(...)` on failure; missing resources throw `ApiError.notFound(...)`.
- The central `errorHandler` middleware converts any thrown error into a consistent
  envelope — `{ "error": { "message": string } }` — with the right HTTP status. In
  production, unexpected (non-`ApiError`) errors are masked.

### Pagination envelope

```ts
{ data: Job[], page: number, pageSize: number, total: number, totalPages: number }
```

---

## 8. Frontend in detail

### Routes / screens

| Path | Screen | Data | Notes |
| :-- | :-- | :-- | :-- |
| `/` | Landing (`HomePage`) | live | Dark hero, search, marquee, **real** recent postings + stats |
| `/jobs` | Browse (`JobsPage`) | live | Filter sidebar (type, region, sponsorship, search) + table + pagination |
| `/jobs/:id` | Job detail (`JobDetailPage`) | live | Single-job fetch; hero, overview, tags, role details |
| `/jobs/new` | Post a job (`NewJobPage`) | live | Form → `POST /api/jobs` → redirect to the new job |
| `/recommended` | Recommended (`RecommendedPage`) | live + illustrative | Real jobs, **illustrative** match score (banner says so) |
| `/onboarding` | Resume upload (`OnboardingPage`) | static | Presentational (no resume backend) |
| `/profile` | Account settings (`ProfilePage`) | static | Working tabs; presentational |
| `/faq` | FAQ (`FaqPage`) | static | Working accordion |
| `/login`, `/register` | Auth (`AuthPage`) | static | Presentational; advances the intended flow |
| `*` | Not found (`NotFoundPage`) | — | Branded 404 |

**Layout split:** the in-app screens (`/jobs`, `/jobs/new`, `/recommended`,
`/onboarding`, `/profile`, `/faq`) render inside `Layout`, which provides the sticky
`RvNav`. Landing, auth, detail, and 404 are full-bleed with their own chrome.

### Theming

- **Design tokens** live in `styles/index.css` as CSS variables (`--primary`,
  `--background`, …) mapped into Tailwind utilities; the palette is RoleVault green and
  the UI primitives inherit it automatically.
- **Design screens** use inline styles for pixel-faithful gradients, shadows, and
  animations. Shared keyframes (`spr-up`, `auroraA/B`, `floaty`, `marquee`) and hover
  classes (`rv-*`) live in `styles/index.css` (the `rv-*` hover classes have `.dark`
  overrides so hover states stay readable in dark mode).
- **Light & dark modes** ship with a sun/moon toggle in the top-right of the in-app nav
  (`RvNav`) and the landing header: it shows a sun in light mode and a moon in dark mode,
  and each click flips between the two. `ThemeProvider` adds/removes `.dark` on `<html>`,
  which flips every token-driven component (the `components/ui/*` primitives)
  automatically. (`ThemeProvider` still understands a `system` preference from the OS or
  a stored value, but the toggle itself is a simple light↔dark switch.)
- **Inline-styled screens theme via a palette hook** — `lib/palette.ts → usePalette()` —
  which returns a semantic colour set (`surface`, `ink`, `body`, `accent`, …) that swaps
  with the active theme. Every in-app screen consumes it, so **dark mode applies across
  the whole app**. The landing hero and auth gradient panels are intentionally dark in
  both themes (decorative), with their on-gradient text kept as-is.
- **Persistence:** the chosen theme is saved to the backend (`GET`/`PUT
  /api/preferences`) in addition to `localStorage`, so it can later sync per user and
  across devices. `localStorage` is the instant-paint cache; the backend value is
  hydrated on load. If the API is unreachable the local choice still applies.

---

## 9. API reference

Base URL (dev): `http://localhost:4000/api`

| Method | Path | Description | Body | Success |
| :-- | :-- | :-- | :-- | :-- |
| `GET` | `/health` | Liveness check | — | `200 {"status":"ok"}` |
| `GET` | `/jobs` | List jobs (paginated) | — | `200` paginated envelope |
| `GET` | `/jobs/:id` | Get one job | — | `200` Job, `404` if missing |
| `POST` | `/jobs` | Create a job | `CreateJobInput` | `201` Job, `400` on validation error |
| `PATCH` | `/jobs/:id` | Update a job | partial Job | `200` Job, `404` if missing |
| `DELETE` | `/jobs/:id` | Delete a job | — | `204`, `404` if missing |
| `GET` | `/preferences` | Read UI preferences | — | `200` Preferences |
| `PUT` | `/preferences` | Save UI preferences | `{ theme }` | `200` Preferences, `400` on bad theme |

### `GET /jobs` query params

All optional:

| Param | Type | Effect |
| :-- | :-- | :-- |
| `search` | string | matches title / company / location / tags |
| `employmentType` | enum | exact match |
| `remote` | `true` / `false` | exact match |
| `status` | `open` / `closed` / `draft` | exact match |
| `page` | number | 1-based page |
| `pageSize` | number | items per page (default 12, max 100) |

### Examples

```bash
curl http://localhost:4000/api/health
curl "http://localhost:4000/api/jobs?status=open&search=react&pageSize=5"
curl http://localhost:4000/api/jobs/job_acme_swe_intern

curl -X POST http://localhost:4000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Intern",
    "company": "Helios",
    "location": "Remote, US",
    "remote": true,
    "employmentType": "internship",
    "description": "Build UI in React.",
    "tags": ["React", "TypeScript", "Visa sponsorship"]
  }'
```

---

## 10. Configuration & environment files

The real `.env` files are **git-ignored** (local only). Create them as needed — the full
contents are below. Defaults are baked into the code and `docker-compose.yml`, so the app
runs even without `.env` files.

### `server/.env`

```ini
# Runtime: development | test | production
NODE_ENV=development

# HTTP server
HOST=0.0.0.0
PORT=4000

# Comma-separated allowed CORS origins, or * for any
CORS_ORIGIN=http://localhost:5173

# Data source: 'memory' (default, no database) or 'postgres'
DB_DRIVER=memory

# PostgreSQL (only used when DB_DRIVER=postgres)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/job_posting

# AI summaries
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
```

| Variable | Default | Purpose |
| :-- | :-- | :-- |
| `NODE_ENV` | `development` | runtime mode |
| `HOST` | `0.0.0.0` | bind host |
| `PORT` | `4000` | API port |
| `CORS_ORIGIN` | `http://localhost:5173` | allowed origin(s) |
| `DB_DRIVER` | `memory` | data source: `memory` or `postgres` |
| `DATABASE_URL` | local pg URL | connection string (only when `postgres`) |
| `GEMINI_API_KEY` | none                    | enables grounded job and company summaries   |
| `GEMINI_MODEL`   | `gemini-3.6-flash`      | Gemini model used for summary generation     |

### `client/.env`

```ini
# Base URL of the backend API (baked in at build time)
VITE_API_BASE_URL=http://localhost:4000/api
```

### Root `.env` (only for `docker compose`)

```ini
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=job_posting
DB_PORT=5432
SERVER_PORT=4000
CLIENT_PORT=5173
CORS_ORIGIN=http://localhost:5173
```

All of these have defaults in `docker-compose.yml`, so the root `.env` is optional.

---

## 11. How to run

### A. Development (recommended — everyday use)

From the **repository root**:

```bash
npm install
npm run dev          # client + server together, hot reload, in-memory API
```

| Piece | URL |
| :-- | :-- |
| Client | <http://localhost:5173> |
| API | <http://localhost:4000> |

Run one side only if you prefer:

```bash
npm run dev:client   # Vite only
npm run dev:server   # API only (tsx watch)
```

### B. Production build (compiled output)

```bash
npm run build        # compiles server -> server/dist, client -> client/dist
npm run start        # runs the API from server/dist (SERVER ONLY)
```

> [!WARNING]
> `npm run start` starts **only the API**, not the client. To serve the built client, use
> any static server pointed at `client/dist` (e.g. `npx serve client/dist`), or use
> Docker (which serves it via nginx).

### C. Docker (full stack with PostgreSQL)

Requires Docker Desktop running. There are **two** compose files, each with an npm script
shortcut (run from the repository root).

#### Production stack — `docker-compose.yml`

Built, optimized images:

```bash
npm run docker:prod        # docker compose up -d --build  (detached)
npm run docker:prod:down   # docker compose down

# or directly, in the foreground:
docker compose up --build
```

Starts three containers:

| Service | URL / Port | Notes |
| :-- | :-- | :-- |
| `db` (Postgres 16) | `localhost:5432` | persistent volume `db-data` |
| `server` (Express) | `localhost:4000` | runs in **`postgres`** mode; auto-applies schema + seed on first boot |
| `client` (nginx) | `localhost:5173` | static build served by nginx |

Both `server` and `client` images are built from the **repo root** context so the
workspace lockfile is available for a reproducible `npm ci`.

Open <http://localhost:5173>. If you started it in the foreground, stop with `Ctrl+C`;
tear down with `npm run docker:prod:down` (or `docker compose down` — add `-v` to also
delete the database volume). In this stack, posted jobs **persist** across restarts
(unlike `memory` mode).

#### Development stack — `docker-compose.dev.yml`

Source bind-mounted, hot reload:

```bash
npm run docker:dev         # docker compose -f docker-compose.dev.yml up
npm run docker:dev:build   # same, forcing an image rebuild
npm run docker:dev:down    # tear the dev stack down
```

This runs the same three services on a `node:20-alpine` base, mounts `./client` and
`./server` into the containers, and runs the dev servers (Vite + `tsx watch`) so host
edits hot-reload inside the containers. It uses a separate compose project name
(`job-posting-dev`) so it can coexist with the production stack.

---

## 12. Scripts reference

Run from the repository root unless noted.

| Command | What it does |
| :-- | :-- |
| `npm run dev` | Run client + server concurrently (dev), via `concurrently` |
| `npm run watch` | Alias for `npm run dev` |
| `npm run dev:client` / `npm run dev:server` | Run one side |
| `npm run build` | Build server then client for production |
| `npm run start` | Start the compiled API (server only) |
| `npm run typecheck` | Type-check both workspaces |
| `npm run lint` / `npm run lint:fix` | ESLint across both workspaces |
| `npm run test` | Run Vitest in both workspaces |
| `npm run format` / `npm run format:check` | Prettier write / check |
| `npm run docker:prod` / `:down` | Build + run (detached) / tear down the prod stack |
| `npm run docker:dev` / `:build` / `:down` | Run / rebuild / tear down the dev (hot-reload) stack |

Per-workspace (inside `client/` or `server/`): `npm run dev`, `build`, `typecheck`,
`lint`, `test`.

---

## 13. Testing, linting, formatting

- **Server tests** (`server/src/app.test.ts`) use supertest against the Express app
  factory (no port binding) — covers health and the 404 envelope.
- **Client tests** use Vitest + Testing Library in jsdom (e.g. `Button.test.tsx`).
- **Lint:** typescript-eslint via `npm run lint`.
- **Format:** Prettier with the Tailwind class-sorting plugin.

---

## 14. Known limitations & design decisions

Intentional, given the current scope:

1. **No auth / accounts backend.** Login, Register, Onboarding, and Profile are
   presentational. Submitting login → Recommended, register → Onboarding.
2. **No resume-matching backend.** Recommended shows **real** live jobs, but the match
   percentage is **illustrative** (deterministic from the job id). A banner states this.
3. **`memory` mode is ephemeral.** Jobs posted in the default mode disappear on restart.
   Use the Docker/Postgres path for persistence.
4. **Sponsorship is a tag convention**, not a schema column (see [§6](#6-the-data-model)).
5. **Landing hero cards** (the three floating match cards) are decorative/fixed sample
   content, matching the original design.
6. **Theme persistence has no auth scope yet.** Light and dark modes are fully themed
   across every screen and persist to `/api/preferences`, but with no accounts backend the
   preference is stored against a single shared profile id (`default`); it becomes
   per-user once auth lands.

---

## 15. Troubleshooting

### `EADDRINUSE: address already in use 0.0.0.0:4000`

Something already listens on the API port (often a previous `npm run dev`). Kill it:

```powershell
# PowerShell
Get-NetTCPConnection -State Listen -LocalPort 4000 |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Then start again. (Same idea for `5173`.)

### "I ran `npm run start` and the client won't open."

`npm run start` starts the **API only**, from compiled `dist/`. For the UI use
`npm run dev`, or the Docker stack. `dist/` is only fresh after `npm run build`.

### Client loads but shows an error loading jobs

The API isn't reachable. Confirm the server runs on port 4000 and `VITE_API_BASE_URL`
points at it; `CORS_ORIGIN` must allow the client origin.

### Text looks invisible / very light

The design is light-first and `ThemeProvider` defaults to light. If dark mode was forced,
clear it: in the browser console run `localStorage.removeItem('theme')`, then reload.

### `docker: command not found`, or the daemon isn't running

Install Docker Desktop and launch it once (this starts the daemon and sets up the WSL2
backend). Verify with `docker --version` and `docker compose version`.

---

## 16. Contributions (Milestone 2)

| Contributor | Contribution |
| :-- | :-- |
| **Moez** | Front-end functionality: home screen and page routing, job browsing with filters, job details page, FAQ page. |
| **Tahmeed** | Front-end functionality: resume upload, skills extraction, simple job recommendation system. |
| **Adithya** | Wrote the SQL `CREATE TABLE` statements, verified they ran, and uploaded the document to MyLS. |
| **Nirmaan** | Backend routes and controllers. Contributed to the README. |
| **Duc** | Project skeleton and a runnable server entry point. Contributed to the README. |
| **Tioluwalashe** | Made the ER diagram for the tables. |
| **Clinton** | Converted all wireframes into finished UI designs in Figma. |
| **Michael** | Updated the activity blog with Milestone 2 tasks. |
